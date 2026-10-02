# Lambda Configuration — CyberGuard AI

## Función: cyberguard-analyze

| Parámetro | Valor |
|-----------|-------|
| Runtime | Node.js 20.x |
| Handler | `index.handler` |
| Memoria | 256 MB |
| Timeout | 30 segundos |
| Arquitectura | x86_64 |

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `BEDROCK_MODEL_ID` | Model ID de Bedrock confirmado disponible en la región | `anthropic.claude-3-haiku-20240307-v1:0` |
| `AWS_REGION` | Región de despliegue | `us-east-1` |
| `ALLOWED_ORIGIN` | Dominio de Amplify para CORS | `https://main.abc123.amplifyapp.com` |

## Rol IAM

ARN del rol: _(completar al crear en Fase 3)_

Política inline requerida:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel"],
      "Resource": "arn:aws:bedrock:{REGION}::foundation-model/{BEDROCK_MODEL_ID}"
    }
  ]
}
```

> IMPORTANTE: Sustituir `{REGION}` y `{BEDROCK_MODEL_ID}` con los valores
> reales confirmados. Ver `.env.example` para modelos compatibles.

## Notas de despliegue

- Build: `cd backend && npm run build` genera `dist/index.js`
- Zip: `npm run build:zip` genera `dist/function.zip`
- Subir el zip en la consola de Lambda o vía AWS CLI:
  `aws lambda update-function-code --function-name cyberguard-analyze --zip-file fileb://dist/function.zip`
