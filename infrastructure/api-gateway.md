# API Gateway Configuration — CyberGuard AI

## Tipo: HTTP API (no REST API)

| Parámetro | Valor |
|-----------|-------|
| Tipo | HTTP API |
| Endpoint URL | _(completar al crear en Fase 3)_ |
| Stage | `$default` |
| Ruta | `POST /analyze` |
| Integración | Lambda proxy (cyberguard-analyze) |

## Configuración CORS

```
Allow Origins:  https://{dominio}.amplifyapp.com  (actualizar con dominio real)
Allow Methods:  POST, OPTIONS
Allow Headers:  Content-Type
Max Age:        300
```

## Notas

- Usar HTTP API (no REST API): menor latencia y menor costo.
- El frontend configura `VITE_API_ENDPOINT` con la URL completa del endpoint.
- Actualizar `ALLOWED_ORIGIN` en las variables de entorno de Lambda con el dominio exacto de Amplify.
