# CyberGuard AI

Herramienta web educativa de ciberseguridad que analiza mensajes, correos y URLs sospechosas para identificar posibles intentos de phishing. Utiliza IA generativa mediante Amazon Bedrock y presenta los resultados en lenguaje sencillo, orientado a personas sin conocimientos técnicos.

> ⚠️ **Herramienta exclusivamente educativa.** El análisis es orientativo y no garantiza que un contenido sea completamente seguro o malicioso.

---

## Demostración del flujo

```
Usuario ingresa contenido sospechoso
        ↓
Frontend (AWS Amplify)
        ↓  HTTPS POST
API Gateway (HTTP API)
        ↓  proxy síncrono
Lambda cyberguard-analyze
        ↓  InvokeModel
Amazon Bedrock (Claude / Titan)
        ↓  JSON estructurado
Lambda → API Gateway → Frontend
        ↓
ResultCard con nivel de riesgo,
indicadores y recomendaciones
```

Si Bedrock no responde en 20 segundos, Lambda activa automáticamente el análisis heurístico de respaldo y el usuario recibe un resultado válido sin ver ningún error.

---

## Estructura del proyecto

```
cyberguard-ai/
├── frontend/          # React 18 + Vite + Tailwind CSS (desplegado en Amplify)
├── backend/           # AWS Lambda Node.js 20 + TypeScript (análisis con Bedrock)
├── infrastructure/    # Guías de despliegue, configuración AWS, checklist e2e
└── .kiro/specs/       # Especificación del proyecto (requirements, design, tasks)
```

---

## Servicios AWS utilizados

| Servicio | Rol |
|----------|-----|
| **AWS Amplify** | Hosting del frontend (CI/CD desde Git, HTTPS automático) |
| **Amazon API Gateway** | Endpoint HTTP público entre frontend y Lambda |
| **AWS Lambda** | Lógica de análisis serverless (Node.js 20.x) |
| **Amazon Bedrock** | Modelo de lenguaje para el análisis de phishing |
| **AWS IAM** | Permisos de mínimo privilegio entre servicios |
| **Amazon CloudWatch** | Logs y métricas de Lambda |

---

## Requisitos previos

- Node.js 20.x LTS o superior
- npm 10.x o superior
- Cuenta AWS con acceso a Bedrock, Lambda, API Gateway y Amplify
- Git

---

## Setup local — Frontend

```powershell
cd frontend
npm install

# Crear archivo de variables de entorno
Copy-Item .env.example .env.local
# Editar .env.local con el endpoint real de API Gateway:
# VITE_API_ENDPOINT=https://TU_API_ID.execute-api.REGION.amazonaws.com/analyze

# Iniciar servidor de desarrollo
node node_modules/vite/bin/vite.js
# → http://localhost:5173
```

### Variables de entorno del frontend

| Variable | Descripción |
|----------|-------------|
| `VITE_API_ENDPOINT` | URL completa del endpoint de API Gateway. Ejemplo: `https://abc123.execute-api.us-east-1.amazonaws.com/analyze` |

> Sin esta variable configurada, el frontend mostrará un error amigable al intentar analizar. El análisis heurístico de respaldo funciona en el backend independientemente.

---

## Setup local — Backend (Lambda)

```powershell
cd backend
npm install

# Compilar y empaquetar para Lambda
node esbuild.config.mjs
# → genera dist/index.js (136 KB)

# Empaquetar en zip listo para subir a Lambda
.\scripts\package-lambda.ps1
# → genera dist/function.zip (25 KB)
```

### Variables de entorno de Lambda (configurar en consola AWS)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `BEDROCK_MODEL_ID` | Model ID confirmado disponible en la región. Ver Paso 1 de la guía. | `anthropic.claude-3-haiku-20240307-v1:0` |
| `AWS_REGION` | Región de despliegue | `us-east-1` |
| `ALLOWED_ORIGIN` | Dominio de Amplify para CORS | `https://main.abc123.amplifyapp.com` |

> `BEDROCK_MODEL_ID` no tiene valor por defecto en el código. Debe configurarse según la disponibilidad del modelo en la región de despliegue antes de subir el zip.

---

## Despliegue en AWS

La guía completa está en [`infrastructure/deployment-guide.md`](infrastructure/deployment-guide.md).

Resumen de pasos:

1. **Bedrock** — Habilitar el modelo en la consola y copiar el model ID.
2. **IAM** — Crear rol `cyberguard-lambda-role` con `AWSLambdaBasicExecutionRole` + política inline `bedrock:InvokeModel`.
3. **Lambda** — Crear función `cyberguard-analyze`, subir `dist/function.zip`, configurar variables de entorno.
4. **API Gateway** — Crear HTTP API con ruta `POST /analyze`, CORS configurado.
5. **Frontend local** — Copiar `.env.example` como `.env.local` y pegar el endpoint de API Gateway.
6. **Amplify** — Conectar repositorio Git, configurar `VITE_API_ENDPOINT` en Environment variables, desplegar.
7. **CORS final** — Actualizar `ALLOWED_ORIGIN` en Lambda y CORS en API Gateway con el dominio real de Amplify.
8. **CloudWatch** — Configurar retención de logs a 7 días.

---

## Verificación end-to-end

El checklist completo está en [`infrastructure/e2e-checklist.md`](infrastructure/e2e-checklist.md).

Prueba rápida desde PowerShell (requiere el endpoint de API Gateway):

```powershell
$body = '{"content":"URGENTE: Su cuenta ha sido suspendida. Verifique sus datos: http://banco-falso.tk/login","type":"message"}'
Invoke-RestMethod `
  -Method POST `
  -Uri "https://TU_API_ID.execute-api.REGION.amazonaws.com/analyze" `
  -ContentType "application/json" `
  -Body $body | ConvertTo-Json -Depth 10
```

Respuesta esperada: `success: true`, `riskLevel: "alto"`, `source: "llm"`.

---

## Arquitectura de seguridad

- El frontend solo conoce la URL pública de API Gateway. No contiene credenciales AWS.
- Lambda accede a Bedrock mediante el rol IAM adjunto, sin API Keys externas.
- El contenido analizado se procesa en memoria y **no se almacena** en ningún servicio.
- Los logs de CloudWatch registran métricas técnicas (tipo, nivel de riesgo, duración) pero **nunca el contenido del usuario**.
- El rol IAM tiene un único permiso: `bedrock:InvokeModel` sobre el modelo específico configurado.

---

## Ejemplos de demostración (seguros)

Los tres ejemplos predefinidos en la aplicación usan contenido completamente ficticio creado para demostración:

| Ejemplo | Tipo | Riesgo esperado |
|---------|------|-----------------|
| Correo bancario falso | Mensaje | 🔴 Alto |
| URL sospechosa | URL | 🟠 Medio |
| Mensaje legítimo | Mensaje | 🟢 Bajo |

> ⚠️ Los dominios y URLs de los ejemplos son ficticios. No existen y no deben visitarse.

---

## Stack tecnológico

### Frontend
- React 18 + Vite 5
- TypeScript 5
- Tailwind CSS 3
- Framer Motion 11
- Lucide React
- Zod

### Backend (Lambda)
- Node.js 20.x
- TypeScript 5 (transpilado con esbuild)
- AWS SDK v3 (`@aws-sdk/client-bedrock-runtime`)
- Zod

---

## Documentación adicional

| Documento | Descripción |
|-----------|-------------|
| `.kiro/specs/cyberguard-ai/requirements.md` | Requisitos funcionales y no funcionales del MVP |
| `.kiro/specs/cyberguard-ai/design.md` | Arquitectura, sistema de diseño, decisiones técnicas |
| `.kiro/specs/cyberguard-ai/tasks.md` | Tareas de implementación por fase |
| `infrastructure/deployment-guide.md` | Guía paso a paso de despliegue en AWS |
| `infrastructure/e2e-checklist.md` | Checklist de verificación end-to-end |
| `infrastructure/lambda-config.md` | Parámetros de configuración de Lambda |
| `infrastructure/api-gateway.md` | Configuración de API Gateway |
| `infrastructure/iam-policy.json` | Política IAM de mínimo privilegio |
| `infrastructure/amplify.yml` | Build spec de AWS Amplify |
