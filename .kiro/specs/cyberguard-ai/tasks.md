# CyberGuard AI — Implementation Tasks

## Principios de implementación

- Priorizar calidad visual sobre cantidad de funcionalidades.
- Cada tarea produce código funcional y verificable antes de pasar a la siguiente.
- Las tareas de UI se implementan con el sistema de diseño definido en `design.md` desde el inicio, no como revisión posterior.
- El backend (Lambda) y el frontend (React/Vite) son proyectos independientes dentro del mismo repositorio.
- El orden sigue la dependencia técnica: infraestructura AWS → lógica de análisis (Lambda) → frontend base → componentes UI → integración → pulido → despliegue.

---

## FASE 1 — Configuración del proyecto y estructura base

### Tarea 1.1 — Inicializar el monorepo
- [ ] Crear la estructura de carpetas raíz: `frontend/`, `backend/`, `infrastructure/`.
- [ ] Crear `README.md` en la raíz con descripción del proyecto, estructura y pasos de setup.
- [ ] Crear `.gitignore` global que excluya `node_modules/`, `dist/`, `.env`, `.env.local`, `*.zip`.

### Tarea 1.2 — Inicializar el proyecto frontend (React + Vite)
- [ ] Crear el proyecto en `frontend/` con Vite, plantilla React + TypeScript.
- [ ] Verificar que el proyecto compila y levanta con `vite dev`.
- [ ] Eliminar contenido de ejemplo generado por defecto.
- [ ] Configurar alias de paths en `tsconfig.json` (`@/` apuntando a `src/`).
- [ ] Configurar `vite.config.ts` con el alias `@/` y la URL del endpoint de API Gateway como variable de entorno (`VITE_API_ENDPOINT`).
- [ ] Crear `frontend/.env.example` con `VITE_API_ENDPOINT=https://TU_API_ID.execute-api.REGION.amazonaws.com/analyze`.

### Tarea 1.3 — Configurar Tailwind CSS con el sistema de diseño
- [ ] Instalar Tailwind CSS en `frontend/` y configurar con PostCSS.
- [ ] Extender `tailwind.config.ts` con la paleta completa de CyberGuard AI:
  - Fondos: `bg-base` (#080d1a), `bg-surface` (#0d1526), `bg-elevated` (#121d35), `bg-muted` (#1a2640).
  - Acentos: `accent-primary` (#00d4ff), `accent-secondary` (#3b82f6).
  - Riesgo: `risk-low` (#22c55e), `risk-medium` (#f59e0b), `risk-high` (#ef4444) y sus variantes `-bg`.
  - Texto: `text-primary` (#f0f4ff), `text-secondary` (#8892a4), `text-muted` (#4a5568), `text-accent` (#00d4ff).
- [ ] Configurar fuentes Inter y JetBrains Mono en `tailwind.config.ts`.
- [ ] Definir todas las variables CSS y el efecto de grid tecnológico de fondo en `src/index.css`.

### Tarea 1.4 — Instalar dependencias del frontend
- [ ] Instalar shadcn/ui e inicializar (`npx shadcn-ui@latest init`).
- [ ] Añadir componentes shadcn: `button`, `card`, `badge`, `tabs`, `textarea`, `input`.
- [ ] Instalar Framer Motion.
- [ ] Instalar Zod.
- [ ] Instalar Lucide React.

### Tarea 1.5 — Definir tipos compartidos y estructura de carpetas
- [ ] Crear `frontend/src/types/index.ts` con: `AnalysisType`, `RiskLevel`, `AnalysisIndicator`, `AnalysisResult`, `AnalysisRequest`, `DemoExample`.
- [ ] Crear `frontend/src/lib/schemas/analysis-request.ts` con schema Zod de validación client-side.
- [ ] Crear `frontend/src/lib/schemas/analysis-result.ts` con schema Zod para parsear la respuesta de la API.
- [ ] Crear la estructura de carpetas vacía definida en `design.md` dentro de `frontend/src/`.

### Tarea 1.6 — Inicializar el proyecto backend (Lambda)
- [ ] Inicializar `backend/` como proyecto Node.js con TypeScript.
- [ ] Instalar dependencias: `@aws-sdk/client-bedrock-runtime`, `zod`.
- [ ] Instalar dependencias de desarrollo: `typescript`, `esbuild`, `@types/aws-lambda`, `@types/node`.
- [ ] Configurar `tsconfig.json` para target ES2022, module CommonJS (requerido por Lambda).
- [ ] Crear `esbuild.config.js` que empaquete `src/handler.ts` en un único archivo `dist/index.js` para el zip de Lambda.
- [ ] Crear `backend/.env.example` con `BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0` y `AWS_REGION=us-east-1`.

---

## FASE 2 — Backend: lógica de análisis en Lambda

### Tarea 2.1 — Schemas Zod del backend
- [ ] Crear `backend/src/schemas/analysis-request.ts`:
  - Schema que valida `content` (string, 1–5000 chars para mensaje, 1–2048 para URL) y `type` (`'message' | 'url'`).
- [ ] Crear `backend/src/schemas/analysis-result.ts`:
  - Schema que valida la estructura JSON devuelta por Bedrock.
  - Incluir `.default()` en campos opcionales para evitar errores de parseo ante respuestas incompletas.

### Tarea 2.2 — Sanitizador de input
- [ ] Crear `backend/src/analysis/sanitizer.ts`:
  - Función `sanitizeInput(content: string, type: AnalysisType): string`.
  - Remover caracteres de control (excepto `\n` y `\t`).
  - Truncar al límite según tipo: 5000 chars (mensaje) o 2048 chars (URL).
  - Neutralizar patrones obvios de prompt injection: frases como "ignora las instrucciones anteriores", "olvida el sistema prompt", etc.

### Tarea 2.3 — Prompts del LLM
- [ ] Crear `backend/src/analysis/prompts.ts`:
  - Constante `SYSTEM_PROMPT` con el prompt completo definido en `design.md`.
  - Función `buildUserPrompt(content: string, type: AnalysisType): string`.
  - Esta es la única fuente de verdad de los prompts; no duplicarlos en ningún otro archivo.

### Tarea 2.4 — Analizador Bedrock
- [ ] Crear `backend/src/analysis/bedrock-analyzer.ts`:
  - Función `analyzeWithBedrock(request: AnalysisRequest): Promise<AnalysisResult>`.
  - Instanciar `BedrockRuntimeClient` con la región desde `process.env.AWS_REGION`.
  - Leer el model ID desde `process.env.BEDROCK_MODEL_ID`.
  - Construir el payload en formato Anthropic Messages API (ver `design.md`): `anthropic_version`, `max_tokens: 1024`, `temperature: 0`, `system`, `messages`.
  - Enviar con `InvokeModelCommand` y parsear el body de la respuesta.
  - Extraer el texto del campo `content[0].text` de la respuesta de Claude.
  - Parsear el JSON del texto con el schema Zod de `analysis-result.ts`.
  - Agregar `source: 'llm'` y `analyzedAt: new Date().toISOString()`.
  - Timeout implícito vía el timeout de Lambda (25s); si Bedrock no responde, Lambda lanza error y el handler activa el fallback.

### Tarea 2.5 — Analizador heurístico (fallback)
- [ ] Crear `backend/src/analysis/heuristic-analyzer.ts`:
  - Función `analyzeWithHeuristics(request: AnalysisRequest): AnalysisResult`.
  - Implementar las 8 reglas de `design.md` con sus pesos (búsqueda case-insensitive).
  - Calcular `riskScore` como suma ponderada normalizada a 0–100.
  - Calcular `riskLevel`: bajo (0–33), medio (34–66), alto (67–100).
  - Construir `indicators[]` solo con los indicadores efectivamente detectados.
  - Generar `summary` y `recommendations` predefinidos según el nivel de riesgo.
  - Agregar `source: 'heuristic'` y `analyzedAt`.
  - **Esta función nunca debe lanzar excepciones.** Siempre devuelve un `AnalysisResult` válido.

### Tarea 2.6 — Handler de Lambda
- [ ] Crear `backend/src/handler.ts`:
  - Exportar `handler` como `APIGatewayProxyHandlerV2` (compatible con HTTP API de API Gateway).
  - Parsear y validar el body del evento con el schema Zod de request. Devolver HTTP 400 si es inválido.
  - Sanitizar el input con `sanitizeInput`.
  - Intentar `analyzeWithBedrock`. Si lanza cualquier error, ejecutar `analyzeWithHeuristics` como fallback.
  - Devolver HTTP 200 con `{ success: true, result: AnalysisResult }`.
  - Devolver HTTP 500 con `{ success: false, error: 'Error interno. Por favor, inténtalo de nuevo.' }` solo si el fallback también falla (caso excepcional).
  - Headers CORS en todas las respuestas: `Access-Control-Allow-Origin` con el dominio de Amplify.
  - **No loguear el contenido del usuario.** Solo loguear: tipo de análisis, nivel de riesgo resultante, fuente (llm/heuristic), duración y errores técnicos.
- [ ] Añadir script `build` en `backend/package.json` que ejecute esbuild y genere `dist/index.js`.
- [ ] Verificar que `npm run build` produce `dist/index.js` sin errores de TypeScript.

---

## FASE 3 — Infraestructura AWS

### Tarea 3.1 — IAM: rol de ejecución de Lambda
- [ ] Crear el rol IAM `cyberguard-lambda-role` en la consola AWS o mediante CLI.
- [ ] Adjuntar la política gestionada `AWSLambdaBasicExecutionRole` (habilita CloudWatch Logs automáticamente).
- [ ] Crear y adjuntar una política inline con el permiso mínimo necesario:
  ```json
  {
    "Effect": "Allow",
    "Action": ["bedrock:InvokeModel"],
    "Resource": "arn:aws:bedrock:{region}::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
  }
  ```
- [ ] Verificar que el rol no tiene ningún permiso adicional (sin S3, sin DynamoDB, sin otros servicios).
- [ ] Documentar el ARN del rol en `infrastructure/lambda-config.md`.

### Tarea 3.2 — Amazon Bedrock: habilitar el modelo
- [ ] En la consola de AWS Bedrock, solicitar acceso al modelo **Anthropic Claude 3 Haiku** en la región de despliegue.
- [ ] Verificar que el acceso está aprobado antes de continuar (puede tardar minutos u horas).
- [ ] Si Claude 3 Haiku no está disponible en la región, usar **Amazon Titan Text Express** como alternativa y actualizar `BEDROCK_MODEL_ID` y el formato del payload en `bedrock-analyzer.ts`.
- [ ] Documentar el model ID y la región en `infrastructure/lambda-config.md`.

### Tarea 3.3 — AWS Lambda: crear y configurar la función
- [ ] Crear la función Lambda `cyberguard-analyze` con runtime Node.js 20.x.
- [ ] Asignar el rol `cyberguard-lambda-role` como rol de ejecución.
- [ ] Configurar parámetros:
  - Memoria: 256 MB.
  - Timeout: 30 segundos.
  - Variables de entorno: `BEDROCK_MODEL_ID` y `AWS_REGION`.
  - Handler: `index.handler`.
- [ ] Crear el zip del código: `zip -j function.zip dist/index.js` (o equivalente en PowerShell).
- [ ] Subir el zip a la función Lambda (consola o AWS CLI).
- [ ] Realizar una invocación de prueba desde la consola con un payload de ejemplo y verificar que la respuesta es correcta.

### Tarea 3.4 — Amazon API Gateway: crear el HTTP API
- [ ] Crear un **HTTP API** (no REST API) en API Gateway.
- [ ] Crear la ruta: `POST /analyze`, integrada con la Lambda `cyberguard-analyze` mediante invocación de proxy.
- [ ] Configurar CORS en API Gateway:
  - Allow origins: `https://*.amplifyapp.com` (actualizar con el dominio real de Amplify al desplegarlo).
  - Allow methods: `POST, OPTIONS`.
  - Allow headers: `Content-Type`.
- [ ] Desplegar el API en el stage `prod` o `$default`.
- [ ] Copiar el endpoint URL generado (formato: `https://{id}.execute-api.{region}.amazonaws.com/analyze`).
- [ ] Documentar el endpoint en `infrastructure/api-gateway.md`.
- [ ] Probar el endpoint con `curl` o Postman con un payload válido y verificar respuesta 200.

### Tarea 3.5 — CloudWatch: verificar observabilidad
- [ ] Confirmar que el log group `/aws/lambda/cyberguard-analyze` se creó automáticamente.
- [ ] Ejecutar al menos una invocación de prueba y verificar que los logs aparecen en CloudWatch.
- [ ] Confirmar que los logs no contienen el contenido ingresado por el usuario (solo métricas técnicas).
- [ ] Configurar retención de logs a 7 días para el MVP (reducir costos de almacenamiento).

### Tarea 3.6 — Documentar la configuración de infraestructura
- [ ] Crear `infrastructure/lambda-config.md` con: ARN del rol, model ID, región, parámetros de Lambda.
- [ ] Crear `infrastructure/api-gateway.md` con: endpoint URL, configuración de CORS, ID del API.
- [ ] Crear `infrastructure/iam-policy.json` con la política IAM del rol de Lambda.
- [ ] Crear `infrastructure/amplify.yml` con el build spec de Amplify (ver Tarea 8.1).

---

## FASE 4 — Componentes de UI base (Frontend)

### Tarea 4.1 — Layout y estilos globales
- [ ] Configurar `frontend/src/main.tsx` con el entry point de React + Vite.
- [ ] Crear `frontend/src/App.tsx` con la composición básica de la página (estructura de secciones).
- [ ] Finalizar `frontend/src/index.css`:
  - Importar fuentes Inter y JetBrains Mono desde Google Fonts.
  - Definir todas las variables CSS del sistema de diseño.
  - Implementar el efecto de grid tecnológico de fondo.
  - Scrollbar estilizada coherente con el tema oscuro.
  - Reset y estilos base.

### Tarea 4.2 — Header
- [ ] Crear `frontend/src/components/layout/Header.tsx`:
  - Logo SVG conceptual (escudo + símbolo de IA).
  - Nombre "CyberGuard AI" en Inter Bold + tagline breve.
  - Fondo glassmorphism sutil.
  - Sticky en la parte superior.
  - Responsive: tagline oculta en móvil.

### Tarea 4.3 — Footer
- [ ] Crear `frontend/src/components/layout/Footer.tsx`:
  - Texto de aviso educativo.
  - Mención "Powered by AWS Bedrock" discreta.
  - Versión del MVP.

### Tarea 4.4 — HeroSection
- [ ] Crear `frontend/src/components/hero/HeroSection.tsx`:
  - Headline impactante en español.
  - Párrafo descriptivo breve.
  - 3 chips: "Análisis con IA", "100% Educativo", "En Español".
  - Flecha o botón de scroll suave al analizador.
  - Responsive: headline reducida en móvil.

---

## FASE 5 — Componentes del analizador (Frontend)

### Tarea 5.1 — AnalysisTypeSelector
- [ ] Crear `frontend/src/components/analyzer/AnalysisTypeSelector.tsx`:
  - Tabs "Mensaje / Correo" y "URL" con íconos.
  - Tab activo: borde inferior cian, texto accent-primary.
  - Transición suave entre tabs.

### Tarea 5.2 — InputArea
- [ ] Crear `frontend/src/components/analyzer/InputArea.tsx`:
  - Modo mensaje: textarea Inter, placeholder descriptivo, resize vertical, foco con glow cian.
  - Modo URL: input JetBrains Mono con ícono prefijo.
  - Validación visual: borde rojo si está vacío al intentar analizar.

### Tarea 5.3 — ExampleSelector y datos de demo
- [ ] Crear `frontend/src/lib/examples/demo-examples.ts` con los 3 ejemplos definidos en `design.md`.
- [ ] Crear `frontend/src/components/analyzer/ExampleSelector.tsx`:
  - 3 chips con ícono de color por nivel de riesgo.
  - Al hacer clic: llena el input y cambia el tipo de análisis.
  - Estado hover: borde cian sutil.

### Tarea 5.4 — AnalyzeButton
- [ ] Crear `frontend/src/components/analyzer/AnalyzeButton.tsx`:
  - Full-width, gradiente accent-gradient.
  - Estado loading: "Analizando…" + spinner, deshabilitado.
  - Estado hover: glow aumentado.

### Tarea 5.5 — AnalyzerCard (contenedor)
- [ ] Crear `frontend/src/components/analyzer/AnalyzerCard.tsx`:
  - Borde superior degradado cian→azul.
  - Sombra `0 4px 24px rgba(0,0,0,0.4)`.
  - Componer: AnalysisTypeSelector + InputArea + ExampleSelector + AnalyzeButton.
  - Padding generoso (1.5rem escritorio, 1rem móvil).

---

## FASE 6 — Estado de carga y resultados (Frontend)

### Tarea 6.1 — AnalyzingState
- [ ] Crear `frontend/src/components/loading/AnalyzingState.tsx`:
  - Ícono central con animación de pulso (Framer Motion).
  - Texto "Analizando el contenido…".
  - Barra de progreso indeterminada con gradiente cian.
  - Fade in al aparecer, fade out al desaparecer.

### Tarea 6.2 — RiskHeader y RiskMeter
- [ ] Crear `frontend/src/components/results/RiskHeader.tsx`:
  - Fondo tenue del color del nivel de riesgo.
  - Borde superior sólido del color del nivel.
  - Ícono grande + "RIESGO ALTO/MEDIO/BAJO" en mayúsculas.
  - Subtexto contextual.
- [ ] Crear `frontend/src/components/results/RiskMeter.tsx`:
  - Barra horizontal con color dinámico.
  - Score numérico visible.
  - Labels Bajo/Medio/Alto en los tercios.
  - Animación de llenado al montar (Framer Motion, 600ms ease-out).

### Tarea 6.3 — ExplanationBlock
- [ ] Crear `frontend/src/components/results/ExplanationBlock.tsx`:
  - Borde izquierdo cian 3px, fondo diferenciado.
  - Fuente Inter, line-height relajado.

### Tarea 6.4 — IndicatorList e IndicatorItem
- [ ] Crear `frontend/src/components/results/IndicatorItem.tsx`:
  - Borde izquierdo con color de severidad.
  - Nombre en negrita + badge de severidad.
  - Explicación en texto secundario.
- [ ] Crear `frontend/src/components/results/IndicatorList.tsx`:
  - Mensaje positivo si indicators está vacío.
  - Stagger animation (Framer Motion, 80ms entre ítems).

### Tarea 6.5 — RecommendationList y EducationalWarning
- [ ] Crear `frontend/src/components/results/RecommendationList.tsx`:
  - Título "Qué debes hacer" con ícono de escudo.
  - Cada ítem con ícono de check.
- [ ] Crear `frontend/src/components/results/EducationalWarning.tsx`:
  - Banner fijo al fondo de resultados.
  - Texto fijo del aviso educativo.

### Tarea 6.6 — ResultCard (contenedor)
- [ ] Crear `frontend/src/components/results/ResultCard.tsx`:
  - Componer: RiskHeader → RiskMeter → ExplanationBlock → IndicatorList → RecommendationList → EducationalWarning.
  - Botón "Nuevo análisis" (outline) al final.
  - Animación entrada: slide up + fade in (Framer Motion, 400ms).
  - Animación salida: fade out + slide down.
  - Chip "Análisis básico (modo sin IA)" si `source === 'heuristic'`.

---

## FASE 7 — API client, hook e integración (Frontend)

### Tarea 7.1 — API client
- [ ] Crear `frontend/src/lib/api-client.ts`:
  - Función `analyzeContent(request: AnalysisRequest): Promise<AnalysisResult>`.
  - Leer el endpoint desde `import.meta.env.VITE_API_ENDPOINT`.
  - `fetch` con `method: 'POST'`, `Content-Type: application/json`, `body: JSON.stringify(request)`.
  - Timeout de 30s usando `AbortController`.
  - Si la respuesta no es ok o el body tiene `success: false`, lanzar error con el mensaje del servidor.
  - Parsear y validar la respuesta con el schema Zod de `analysis-result.ts`.

### Tarea 7.2 — useAnalyzer hook
- [ ] Crear `frontend/src/hooks/useAnalyzer.ts`:
  - Estado: `content`, `analysisType`, `result`, `loading`, `error`.
  - `analyze()`: valida con Zod client-side, llama a `analyzeContent`, maneja loading/error/result.
  - `reset()`: limpia content, result y error.
  - `loadExample(example: DemoExample)`: carga contenido y tipo del ejemplo.

### Tarea 7.3 — App.tsx (integración completa)
- [ ] Editar `frontend/src/App.tsx`:
  - Componer: Header → HeroSection → AnalyzerCard → AnalyzingState (condicional) → ResultCard (condicional) → Footer.
  - Usar `useAnalyzer` para conectar todos los componentes.
  - AnalyzingState reemplaza ResultCard mientras `loading === true`.
  - ResultCard aparece con animación cuando `result !== null`.
  - Scroll suave desde el hero al analizador.
  - Error visible y amigable si `error !== null`.

---

## FASE 8 — Despliegue en AWS

### Tarea 8.1 — Configurar AWS Amplify
- [ ] Crear `infrastructure/amplify.yml` con el build spec:
  ```yaml
  version: 1
  frontend:
    phases:
      preBuild:
        commands:
          - cd frontend && npm ci
      build:
        commands:
          - npm run build
    artifacts:
      baseDirectory: frontend/dist
      files:
        - '**/*'
    cache:
      paths:
        - frontend/node_modules/**/*
  ```
- [ ] En la consola de AWS Amplify, conectar el repositorio Git del proyecto.
- [ ] Configurar la variable de entorno `VITE_API_ENDPOINT` en Amplify con el endpoint de API Gateway (Tarea 3.4).
- [ ] Desplegar y verificar que el frontend carga correctamente vía HTTPS.
- [ ] Copiar el dominio de Amplify (`.amplifyapp.com`) y actualizar el CORS de API Gateway con ese dominio.

### Tarea 8.2 — Despliegue final de Lambda con CORS actualizado
- [ ] Actualizar el header `Access-Control-Allow-Origin` en `handler.ts` con el dominio real de Amplify.
- [ ] Rebuild del zip: `npm run build` en `backend/` y subir el nuevo zip a Lambda.
- [ ] Verificar que una invocación desde el frontend desplegado en Amplify llega correctamente a Lambda.

### Tarea 8.3 — Prueba de integración end-to-end en producción
- [ ] Probar el flujo completo desde el dominio de Amplify con los 3 ejemplos de demostración.
- [ ] Verificar en CloudWatch que los logs de Lambda aparecen sin contenido del usuario.
- [ ] Verificar que la respuesta Bedrock (`source: 'llm'`) se recibe correctamente.
- [ ] Probar el fallback heurístico: temporalmente configurar un `BEDROCK_MODEL_ID` inválido, verificar que el resultado de fallback llega al frontend sin error visible, restaurar el valor correcto.

---

## FASE 9 — Pulido visual y verificación final

### Tarea 9.1 — Revisión de identidad visual
- [ ] Verificar que la paleta de colores de `design.md` está aplicada consistentemente.
- [ ] Verificar que los estilos por defecto de shadcn/ui no rompen la identidad visual.
- [ ] Verificar jerarquía tipográfica en todos los componentes.
- [ ] Verificar glassmorphism del header y bordes de tarjetas.

### Tarea 9.2 — Verificación de microinteracciones
- [ ] Verificar animaciones de entrada/salida de ResultCard.
- [ ] Verificar animación de llenado de RiskMeter.
- [ ] Verificar stagger de IndicatorItems.
- [ ] Verificar estados hover de botones y chips.
- [ ] Verificar `prefers-reduced-motion` en todas las animaciones.

### Tarea 9.3 — Verificación responsive
- [ ] Probar en 375px, 768px y 1280px+.
- [ ] Verificar HeroSection, AnalyzerCard y ResultCard en móvil.
- [ ] Verificar chips de ExampleSelector en pantallas pequeñas.

### Tarea 9.4 — Verificación de seguridad
- [ ] Confirmar que `VITE_API_ENDPOINT` en Amplify no expone credenciales AWS.
- [ ] Confirmar en CloudWatch que ningún log contiene el contenido del usuario.
- [ ] Confirmar que el rol IAM de Lambda solo tiene `bedrock:InvokeModel` sobre el modelo específico.
- [ ] Confirmar que API Gateway rechaza requests con origen distinto al dominio de Amplify.

### Tarea 9.5 — Preparación para Demo Day
- [ ] Verificar que los 3 ejemplos predefinidos producen resultados coherentes con el riesgo esperado.
- [ ] Ensayar el flujo completo de la demo: cargar ejemplo → analizar → leer resultado → nuevo análisis.
- [ ] Verificar que el tiempo de respuesta con Bedrock es ≤ 15 segundos.
- [ ] Completar `README.md` con: descripción, arquitectura, instrucciones de setup local y despliegue.

---

## Orden de implementación recomendado

```
Fase 1 (estructura base + configuración)
  → Fase 2 (lógica Lambda + Bedrock)
  → Fase 3 (infraestructura AWS)        ← verificar Lambda en AWS antes de continuar
  → Fase 4 (UI base)
  → Fase 5 (analizador UI)
  → Fase 6 (resultados UI)
  → Fase 7 (integración frontend)
  → Fase 8 (despliegue Amplify)
  → Fase 9 (pulido y verificación)
```

Las fases 4–6 (UI) pueden desarrollarse en paralelo con la Fase 3 (infraestructura), usando un mock del API client que devuelva datos de prueba fijos hasta que el endpoint de API Gateway esté disponible.

---

## Criterios de finalización del MVP

El MVP está listo para Demo Day cuando:

- [ ] El frontend está desplegado en AWS Amplify y es accesible públicamente vía HTTPS.
- [ ] El análisis funciona end-to-end: frontend (Amplify) → API Gateway → Lambda → Bedrock → resultado.
- [ ] Los 3 ejemplos de demostración producen resultados coherentes con el nivel de riesgo esperado.
- [ ] El fallback heurístico funciona correctamente y no muestra errores al usuario.
- [ ] La interfaz es visualmente profesional en escritorio y en móvil (375px).
- [ ] Las microinteracciones y animaciones están implementadas y son suaves.
- [ ] El rol IAM de Lambda solo tiene el permiso mínimo necesario (`bedrock:InvokeModel`).
- [ ] CloudWatch registra errores técnicos sin incluir el contenido del usuario.
- [ ] El tiempo de respuesta del análisis con Bedrock es ≤ 15 segundos.
- [ ] La advertencia educativa es visible en todos los resultados.
- [ ] El build del frontend (`vite build`) y el build de Lambda (`esbuild`) compilan sin errores.
