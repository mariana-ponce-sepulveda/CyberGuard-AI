# CyberGuard AI — Guía de despliegue en AWS

> Ejecutar los pasos en el orden indicado. Cada sección tiene una dependencia con la anterior.

---

## Prerrequisitos

- Cuenta AWS activa con permisos para IAM, Lambda, API Gateway, Bedrock y Amplify.
- AWS CLI instalado y configurado (`aws configure`) con un perfil que tenga los permisos anteriores.
- Node.js 20+ instalado localmente.
- Repositorio Git del proyecto (GitHub, GitLab o CodeCommit) — requerido por Amplify.

---

## Paso 1 — Habilitar el modelo en Amazon Bedrock

> Este paso puede tardar minutos u horas según la cuenta. Hacerlo primero.

1. Abrir la consola AWS → **Amazon Bedrock** → **Model access** (panel izquierdo).
2. Verificar qué modelos tienen acceso habilitado en la región de despliegue.
3. Si el modelo deseado no está habilitado, hacer clic en **Manage model access** → seleccionar el modelo → **Request access**.
4. Esperar a que el estado cambie a **Access granted**.
5. Copiar el **Model ID** exacto. Ejemplos compatibles:
   - `anthropic.claude-3-haiku-20240307-v1:0` ← recomendado
   - `anthropic.claude-3-sonnet-20240229-v1:0`
6. Anotar también la **región** (ej. `us-east-1`). El modelo debe estar disponible en esa misma región donde se desplegará Lambda.

---

## Paso 2 — Crear el rol IAM para Lambda

1. Abrir **IAM** → **Roles** → **Create role**.
2. Tipo de entidad de confianza: **AWS service** → **Lambda** → Next.
3. Buscar y adjuntar la política gestionada: `AWSLambdaBasicExecutionRole` → Next.
4. Nombre del rol: `cyberguard-lambda-role` → **Create role**.
5. Abrir el rol recién creado → pestaña **Permissions** → **Add permissions** → **Create inline policy**.
6. Usar el editor JSON y pegar la siguiente política, sustituyendo `{REGION}` y `{BEDROCK_MODEL_ID}` con los valores del Paso 1:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockInvokeModel",
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel"],
      "Resource": "arn:aws:bedrock:{REGION}::foundation-model/{BEDROCK_MODEL_ID}"
    }
  ]
}
```

7. Nombre de la política: `cyberguard-bedrock-invoke` → **Create policy**.
8. Verificar que el rol tiene exactamente **dos** políticas: `AWSLambdaBasicExecutionRole` + `cyberguard-bedrock-invoke`. Sin más permisos.
9. Copiar el **ARN del rol** (formato: `arn:aws:iam::ACCOUNT_ID:role/cyberguard-lambda-role`).
10. Anotar el ARN en `infrastructure/lambda-config.md`.

---

## Paso 3 — Empaquetar y crear la función Lambda

### 3a. Generar el zip del código

Desde la raíz del repositorio en PowerShell:

```powershell
# Opción A: script automatizado
.\backend\scripts\package-lambda.ps1

# Opción B: manual
cd backend
node esbuild.config.mjs
Compress-Archive -Force -Path dist/index.js -DestinationPath dist/function.zip
cd ..
```

El archivo resultante es `backend/dist/function.zip` (~25 KB).

### 3b. Crear la función en la consola Lambda

1. Abrir **Lambda** → **Create function** → **Author from scratch**.
2. Configurar:
   - **Function name**: `cyberguard-analyze`
   - **Runtime**: `Node.js 20.x`
   - **Architecture**: `x86_64`
   - **Permissions**: seleccionar *Use an existing role* → `cyberguard-lambda-role`
3. Hacer clic en **Create function**.

### 3c. Subir el código

1. En la página de la función → sección **Code** → **Upload from** → **.zip file**.
2. Seleccionar `backend/dist/function.zip` → **Save**.
3. En **Runtime settings** → **Edit** → Handler: `index.handler` → **Save**.

### 3d. Configurar parámetros

1. Pestaña **Configuration** → **General configuration** → **Edit**:
   - Memory: `256 MB`
   - Timeout: `0 min 30 sec`
   - Guardar.

2. Pestaña **Configuration** → **Environment variables** → **Edit** → **Add environment variable**:

   | Key | Value |
   |-----|-------|
   | `BEDROCK_MODEL_ID` | El model ID del Paso 1 (ej. `anthropic.claude-3-haiku-20240307-v1:0`) |
   | `AWS_REGION` | La región del despliegue (ej. `us-east-1`) |
   | `ALLOWED_ORIGIN` | Dejar en `*` por ahora — se actualiza en el Paso 6 con el dominio de Amplify |

3. Guardar.

### 3e. Prueba inicial de Lambda

1. Pestaña **Test** → **Create new event** → Nombre: `test-message`.
2. Pegar el siguiente JSON:

```json
{
  "version": "2.0",
  "routeKey": "POST /analyze",
  "rawPath": "/analyze",
  "requestContext": {
    "http": { "method": "POST", "path": "/analyze" },
    "requestId": "test-001"
  },
  "body": "{\"content\":\"URGENTE: Su cuenta ha sido suspendida. Haga clic aquí para verificar.\",\"type\":\"message\"}",
  "isBase64Encoded": false
}
```

3. Hacer clic en **Test**.
4. Verificar que el resultado tiene `statusCode: 200` y el body contiene `success: true` con un `riskLevel` de `"alto"` o `"medio"`.
5. Si aparece error sobre `BEDROCK_MODEL_ID` no configurado o acceso denegado → revisar Paso 1 y Paso 2.

---

## Paso 4 — Crear el HTTP API en API Gateway

1. Abrir **API Gateway** → **Create API** → **HTTP API** → **Build**.
2. En **Integrations** → **Add integration**:
   - Integration type: **Lambda**
   - Lambda function: `cyberguard-analyze`
   - Version: `2.0`
3. **API name**: `cyberguard-api` → Next.
4. En **Configure routes**:
   - Method: `POST`
   - Resource path: `/analyze`
   - Integration target: `cyberguard-analyze`
5. En **Define stages**: dejar el stage `$default` con auto-deploy → Next → **Create**.
6. Copiar el **Invoke URL** que aparece en la página del stage. Formato: `https://{api-id}.execute-api.{region}.amazonaws.com`
   - El endpoint completo será: `https://{api-id}.execute-api.{region}.amazonaws.com/analyze`

### 4b. Configurar CORS en API Gateway

1. Panel izquierdo → **CORS** → **Configure**.
2. Configurar:
   - **Access-Control-Allow-Origin**: `*` (temporal — se reemplaza con el dominio de Amplify en el Paso 6)
   - **Access-Control-Allow-Methods**: `POST, OPTIONS`
   - **Access-Control-Allow-Headers**: `Content-Type`
   - **Access-Control-Max-Age**: `300`
3. **Save**.

### 4c. Prueba del endpoint

Desde PowerShell, probar que el endpoint responde:

```powershell
$body = '{"content":"Estimado usuario, su cuenta sera cancelada.","type":"message"}'
Invoke-RestMethod -Method POST `
  -Uri "https://TU_API_ID.execute-api.REGION.amazonaws.com/analyze" `
  -ContentType "application/json" `
  -Body $body | ConvertTo-Json -Depth 10
```

Debe devolver un resultado con `success: true` y un `riskLevel` válido.

---

## Paso 5 — Configurar el frontend localmente

1. En la carpeta `frontend/`, copiar el archivo de ejemplo:

```powershell
Copy-Item frontend\.env.example frontend\.env.local
```

2. Editar `frontend/.env.local` y reemplazar la URL de ejemplo por el endpoint real del Paso 4:

```
VITE_API_ENDPOINT=https://TU_API_ID.execute-api.REGION.amazonaws.com/analyze
```

3. Iniciar el servidor de desarrollo y probar la integración completa:

```powershell
cd frontend
node node_modules/vite/bin/vite.js
```

4. Abrir `http://localhost:5173`, pegar un texto de prueba y verificar que el resultado llega desde Lambda/Bedrock (el chip debe decir "Análisis con IA" y `source: 'llm'`).

---

## Paso 6 — Desplegar el frontend en AWS Amplify

### 6a. Conectar el repositorio

1. Abrir **AWS Amplify** → **New app** → **Host web app**.
2. Seleccionar el proveedor Git (GitHub, GitLab, etc.) → autorizar acceso → seleccionar el repositorio `cyberguard-ai` y la rama principal (`main` o `master`).
3. En **App settings**:
   - App name: `cyberguard-ai`
   - Build and test settings: Amplify detectará `infrastructure/amplify.yml` automáticamente. Si no, pegarlo manualmente.

### 6b. Configurar la variable de entorno en Amplify

> **Importante:** esta variable debe configurarse ANTES del primer deploy para que Vite la incluya en el bundle.

1. En la pantalla de configuración del deploy (o después en **App settings** → **Environment variables**):
2. Añadir:
   - **Variable**: `VITE_API_ENDPOINT`
   - **Value**: `https://TU_API_ID.execute-api.REGION.amazonaws.com/analyze`
3. Guardar → continuar con el deploy.

### 6c. Primer deploy

1. Hacer clic en **Save and deploy**.
2. Esperar a que el pipeline complete (preBuild → Build → Deploy). Tarda ~2-4 minutos.
3. Amplify asignará un dominio tipo `https://main.XXXXXXXX.amplifyapp.com`.
4. Abrir el dominio y verificar que la aplicación carga correctamente.

---

## Paso 7 — Actualizar CORS con el dominio real de Amplify

Una vez obtenido el dominio de Amplify, restringir CORS a ese origen exacto:

### 7a. Actualizar API Gateway

1. **API Gateway** → `cyberguard-api` → **CORS**.
2. Cambiar `Access-Control-Allow-Origin` de `*` a `https://main.XXXXXXXX.amplifyapp.com`.
3. **Save**.

### 7b. Actualizar la variable de entorno en Lambda

1. **Lambda** → `cyberguard-analyze` → **Configuration** → **Environment variables** → **Edit**.
2. Cambiar `ALLOWED_ORIGIN` de `*` a `https://main.XXXXXXXX.amplifyapp.com`.
3. **Save**.

### 7c. Reempaquetar y subir Lambda con CORS actualizado

```powershell
# El handler.ts ya lee ALLOWED_ORIGIN de env var — solo hay que hacer rebuild
.\backend\scripts\package-lambda.ps1

# Subir el nuevo zip
aws lambda update-function-code `
  --function-name cyberguard-analyze `
  --zip-file fileb://backend/dist/function.zip
```

O subirlo manualmente desde la consola Lambda → Upload from → .zip file.

---

## Paso 8 — Configurar CloudWatch Logs (retención)

Por defecto Lambda crea el log group automáticamente. Para reducir costos en el MVP:

1. Abrir **CloudWatch** → **Log groups** → `/aws/lambda/cyberguard-analyze`.
2. **Actions** → **Edit retention setting** → seleccionar **7 days** → **Save**.

---

## Resumen de recursos creados

| Recurso | Nombre / ID |
|---------|-------------|
| IAM Role | `cyberguard-lambda-role` |
| Lambda Function | `cyberguard-analyze` |
| API Gateway | `cyberguard-api` |
| Amplify App | `cyberguard-ai` |
| CloudWatch Log Group | `/aws/lambda/cyberguard-analyze` |
