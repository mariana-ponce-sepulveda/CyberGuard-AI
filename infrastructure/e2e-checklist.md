# CyberGuard AI — Checklist de verificación end-to-end

Ejecutar en orden después de completar todos los pasos de `deployment-guide.md`.

---

## Bloque A — Verificación de infraestructura AWS

- [ ] **A1.** El modelo de Bedrock tiene estado **Access granted** en la consola.
- [ ] **A2.** El rol IAM `cyberguard-lambda-role` tiene exactamente dos políticas: `AWSLambdaBasicExecutionRole` + `cyberguard-bedrock-invoke`. Sin otras.
- [ ] **A3.** La función Lambda `cyberguard-analyze` existe, tiene runtime Node.js 20.x, 256 MB de memoria y 30 segundos de timeout.
- [ ] **A4.** Las tres variables de entorno de Lambda están configuradas: `BEDROCK_MODEL_ID`, `AWS_REGION`, `ALLOWED_ORIGIN`.
- [ ] **A5.** El `ALLOWED_ORIGIN` de Lambda coincide exactamente con el dominio de Amplify (no `*`).
- [ ] **A6.** La ruta `POST /analyze` de API Gateway apunta a la Lambda y tiene CORS configurado con el dominio de Amplify.
- [ ] **A7.** El log group `/aws/lambda/cyberguard-analyze` existe en CloudWatch con retención de 7 días.

---

## Bloque B — Prueba de Lambda directa (consola AWS)

### B1. Prueba con mensaje de alto riesgo

Evento de prueba a usar en la consola Lambda (pestaña **Test**):

```json
{
  "version": "2.0",
  "routeKey": "POST /analyze",
  "rawPath": "/analyze",
  "requestContext": {
    "http": { "method": "POST", "path": "/analyze" },
    "requestId": "e2e-test-high"
  },
  "body": "{\"content\":\"Estimado cliente, su cuenta bancaria ha sido SUSPENDIDA. Ingrese su contraseña y PIN en este enlace: http://bancoseguro-verificacion.tk/reactivar Tiene 24 HORAS.\",\"type\":\"message\"}",
  "isBase64Encoded": false
}
```

Resultado esperado:
- [ ] `statusCode: 200`
- [ ] `body.success: true`
- [ ] `body.result.riskLevel: "alto"`
- [ ] `body.result.source: "llm"` (si Bedrock está disponible)
- [ ] `body.result.indicators` contiene al menos 2 indicadores
- [ ] Los logs de CloudWatch NO contienen el texto del mensaje analizado

### B2. Prueba con URL de riesgo medio

```json
{
  "version": "2.0",
  "routeKey": "POST /analyze",
  "rawPath": "/analyze",
  "requestContext": {
    "http": { "method": "POST", "path": "/analyze" },
    "requestId": "e2e-test-url"
  },
  "body": "{\"content\":\"http://paypa1-secure-login.verificacion-cuenta.tk/signin\",\"type\":\"url\"}",
  "isBase64Encoded": false
}
```

Resultado esperado:
- [ ] `statusCode: 200`
- [ ] `body.result.riskLevel: "medio"` o `"alto"`
- [ ] `body.result.analysisType: "url"`

### B3. Prueba de validación — body inválido

```json
{
  "version": "2.0",
  "routeKey": "POST /analyze",
  "rawPath": "/analyze",
  "requestContext": {
    "http": { "method": "POST", "path": "/analyze" },
    "requestId": "e2e-test-invalid"
  },
  "body": "{\"content\":\"\",\"type\":\"message\"}",
  "isBase64Encoded": false
}
```

Resultado esperado:
- [ ] `statusCode: 400`
- [ ] `body.success: false`
- [ ] `body.error` contiene un mensaje descriptivo en español

---

## Bloque C — Prueba del fallback heurístico

> Objetivo: confirmar que si Bedrock falla, el análisis heurístico responde sin mostrar error al usuario.

**Pasos:**
1. En Lambda → **Configuration** → **Environment variables** → **Edit**.
2. Cambiar `BEDROCK_MODEL_ID` a un valor inválido: `modelo-inexistente-test`.
3. Guardar.
4. Ejecutar la prueba B1 nuevamente.

Resultado esperado con fallback:
- [ ] `statusCode: 200` (no un error)
- [ ] `body.success: true`
- [ ] `body.result.source: "heuristic"` (el fallback se activó)
- [ ] `body.result.riskLevel` es un valor válido (`"bajo"`, `"medio"` o `"alto"`)
- [ ] Los logs de CloudWatch muestran `"Bedrock unavailable, using heuristic fallback"` con el reason técnico, pero SIN el contenido del usuario

5. Restaurar `BEDROCK_MODEL_ID` al valor correcto del Paso 1. Guardar.
6. Ejecutar B1 nuevamente y confirmar que `source` vuelve a ser `"llm"`.

---

## Bloque D — Prueba end-to-end desde el frontend (Amplify)

Abrir el dominio de Amplify en el navegador.

### D1. Flujo completo con ejemplo alto riesgo

1. [ ] Hacer clic en el chip **"🔴 Correo bancario falso"** → el área de texto se rellena automáticamente.
2. [ ] Hacer clic en **Analizar**.
3. [ ] Aparece el estado de carga animado (escudo pulsante).
4. [ ] En menos de 15 segundos aparece el `ResultCard` con animación slide-up.
5. [ ] El `RiskHeader` muestra **RIESGO ALTO** en rojo.
6. [ ] La barra `RiskMeter` se anima de izquierda a derecha.
7. [ ] Se muestran al menos 2 indicadores con su explicación.
8. [ ] Se muestran recomendaciones de seguridad.
9. [ ] El chip superior muestra **"Análisis con IA"** (si Bedrock responde) o **"Análisis básico"** (si usa fallback).
10. [ ] La advertencia educativa es visible al fondo de la tarjeta.

### D2. Flujo completo con ejemplo URL

1. [ ] Hacer clic en el chip **"🟡 URL sospechosa"** → el tipo cambia a **URL** automáticamente.
2. [ ] Hacer clic en **Analizar**.
3. [ ] Resultado visible en menos de 15 segundos con `riskLevel: "medio"` o `"alto"`.

### D3. Flujo completo con mensaje legítimo

1. [ ] Hacer clic en el chip **"🟢 Mensaje legítimo"**.
2. [ ] Hacer clic en **Analizar**.
3. [ ] Resultado con `riskLevel: "bajo"`.
4. [ ] La sección de indicadores muestra el mensaje "No encontramos señales de riesgo" con el ícono verde.

### D4. Nuevo análisis

1. [ ] Con un resultado visible, hacer clic en **"Nuevo análisis"**.
2. [ ] La tarjeta de resultado desaparece con animación.
3. [ ] El scroll sube automáticamente al área del analizador.
4. [ ] El campo de texto está vacío y listo para un nuevo contenido.

### D5. Verificación de seguridad en logs

1. [ ] Abrir CloudWatch → `/aws/lambda/cyberguard-analyze`.
2. [ ] Revisar los logs de las invocaciones de la prueba D1–D4.
3. [ ] Confirmar que ningún log contiene el texto del correo o URL analizado.
4. [ ] Confirmar que los logs sí contienen: `type`, `contentLength`, `riskLevel`, `source`, `durationMs`.

---

## Bloque E — Verificación responsive

Probar desde el dominio de Amplify en el navegador con DevTools:

- [ ] **E1.** 375px (iPhone SE): Hero legible, AnalyzerCard usable, ResultCard sin overflow.
- [ ] **E2.** 768px (iPad): layout correcto, chips en fila.
- [ ] **E3.** 1280px (escritorio): contenido centrado, ancho máximo 768px respetado.

---

## Criterios de aprobación para Demo Day

El MVP está listo cuando todos los bloques A, B, C y D están marcados como completados y el tiempo de respuesta en D1 es ≤ 15 segundos.
