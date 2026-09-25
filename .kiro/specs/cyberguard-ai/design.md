# CyberGuard AI — Design

> **Nota de diseño:** La experiencia visual es una prioridad del MVP. El objetivo es un nivel de acabado apto para Demo Day, no una prueba de concepto. Las decisiones de arquitectura y stack están subordinadas a garantizar que la implementación pueda producir esa calidad visual.

---

## Arquitectura AWS

### Diagrama de la arquitectura

```
┌──────────────────────────────────────────────────────────────────┐
│                        USUARIO (Browser)                         │
│              React + TypeScript + Tailwind CSS                   │
│                                                                  │
│   ┌─────────────────┐      ┌──────────────────────────────────┐  │
│   │   UI Components │◄─────│  State (React hooks / Context)   │  │
│   └─────────────────┘      └──────────────────────────────────┘  │
│            │  HTTPS POST /analyze                                │
└────────────┼─────────────────────────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────────────────────────┐
│                        AWS AMPLIFY                               │
│           Hosting del frontend (archivos estáticos)              │
│           CI/CD desde repositorio Git                            │
│           HTTPS automático + dominio                             │
└────────────┬─────────────────────────────────────────────────────┘
             │  HTTPS → endpoint público
┌────────────▼─────────────────────────────────────────────────────┐
│                    AMAZON API GATEWAY                            │
│           HTTP API  POST /analyze                                │
│           Valida formato de la request                           │
│           Invoca Lambda de forma asíncrona                       │
│           CORS configurado para el dominio de Amplify            │
└────────────┬─────────────────────────────────────────────────────┘
             │  Event (payload JSON)
┌────────────▼─────────────────────────────────────────────────────┐
│                       AWS LAMBDA                                 │
│           Runtime: Node.js 20.x                                  │
│           Función: cyberguard-analyze                            │
│                                                                  │
│   ┌──────────────────┐    ┌───────────────────────────────────┐  │
│   │  Input validator  │    │       Bedrock Analyzer            │  │
│   │  + Sanitizer      │───►│  (InvokeModel → Claude/Titan)    │  │
│   └──────────────────┘    └──────────────────┬────────────────┘  │
│                                              │ falla/timeout     │
│                                    ┌─────────▼────────────────┐  │
│                                    │   Heuristic Fallback      │  │
│                                    └──────────────────────────┘  │
│           IAM Role: solo bedrock:InvokeModel                     │
│           Variables de entorno: BEDROCK_MODEL_ID, AWS_REGION     │
└────────────┬─────────────────────────────────────────────────────┘
             │  AWS SDK (bedrock-runtime)
┌────────────▼─────────────────────────────────────────────────────┐
│                     AMAZON BEDROCK                               │
│           Modelo: Anthropic Claude 3 Haiku                       │
│           (o Amazon Titan Text si Haiku no está disponible)      │
│           Invocación síncrona vía InvokeModel                    │
│           Respuesta: JSON estructurado definido por el prompt    │
└──────────────────────────────────────────────────────────────────┘

               IAM  ──  gestiona permisos entre todos los servicios
               CloudWatch  ──  recibe logs y métricas de Lambda
```

---

### Servicios AWS del MVP — justificación y rol

#### AWS Amplify
**Rol:** hosting y despliegue del frontend.
**Por qué:** Amplify simplifica radicalmente el deploy de una SPA/app React. Conecta con el repositorio Git, construye automáticamente y publica con HTTPS. Para el MVP elimina la necesidad de gestionar S3 + CloudFront manualmente.
**Relación:** sirve los archivos estáticos del frontend al usuario. El frontend llama a API Gateway, no a Amplify.
**Posible simplificación:** podría reemplazarse por S3 + CloudFront si se requiere más control, pero Amplify es suficiente y más simple para el MVP.

#### Amazon API Gateway (HTTP API)
**Rol:** punto de entrada HTTP público y seguro entre el frontend y Lambda.
**Por qué:** el frontend nunca invoca Lambda directamente. API Gateway expone el endpoint `POST /analyze`, gestiona CORS, y actúa como proxy hacia Lambda. Usar **HTTP API** (no REST API) para mantener bajo costo y latencia mínima.
**Relación:** recibe la request del frontend (vía Amplify), valida el formato básico y pasa el payload a Lambda como evento.
**Posible simplificación:** en una iteración futura se podría añadir throttling por IP o una API Key de API Gateway para control de acceso, pero para el MVP no es necesario.

#### AWS Lambda
**Rol:** backend serverless — toda la lógica de análisis vive aquí.
**Por qué:** sin servidor que gestionar, pago por invocación (costo casi cero en MVP), escala automáticamente. La lógica de negocio (sanitización, llamada a Bedrock, fallback heurístico, construcción del resultado) queda completamente aislada del cliente.
**Relación:** es invocada por API Gateway, llama a Bedrock vía AWS SDK, y devuelve el resultado a API Gateway que lo retorna al frontend.
**Configuración para el MVP:**
- Runtime: Node.js 20.x
- Memoria: 256 MB (suficiente para el análisis de texto)
- Timeout: 30 segundos (Bedrock puede tardar hasta 20s en respuesta lenta)
- Variables de entorno: `BEDROCK_MODEL_ID`, `AWS_REGION`

#### Amazon Bedrock
**Rol:** proveedor del modelo de lenguaje para el análisis de phishing.
**Por qué:** Bedrock permite usar modelos de IA generativa (Anthropic Claude, Amazon Titan) sin gestionar infraestructura de ML. El acceso es mediante el AWS SDK estándar usando el rol IAM de Lambda; no se necesita API Key externa.
**Modelo recomendado:** **Anthropic Claude 3 Haiku** — es el modelo más rápido y económico de la familia Claude, adecuado para análisis de texto corto con respuesta JSON estructurada.
**Alternativa:** Amazon Titan Text Express si Claude no está disponible en la región del despliegue.
**Relación:** Lambda invoca Bedrock vía `BedrockRuntimeClient.send(InvokeModelCommand)`. La respuesta es el JSON estructurado del análisis.
**Posible simplificación:** Bedrock es el núcleo del MVP; no se puede simplificar. Lo que sí se puede ajustar es el modelo según disponibilidad regional.

#### AWS IAM
**Rol:** control de permisos entre servicios, principio de mínimo privilegio.
**Por qué:** sin IAM correctamente configurado, Lambda no puede llamar a Bedrock, o peor, podría tener acceso excesivo a otros servicios.
**Configuración para el MVP:**
```json
{
  "Effect": "Allow",
  "Action": ["bedrock:InvokeModel"],
  "Resource": "arn:aws:bedrock:{region}::foundation-model/anthropic.claude-3-haiku-*"
}
```
Lambda no necesita ningún otro permiso. CloudWatch Logs se habilita automáticamente con el rol de ejecución básico de Lambda (`AWSLambdaBasicExecutionRole`).
**Relación:** el rol IAM se adjunta a Lambda. API Gateway no necesita permisos IAM adicionales para invocar Lambda en una HTTP API (usa resource-based policy).

#### Amazon CloudWatch
**Rol:** observabilidad — logs de errores y métricas de Lambda.
**Por qué:** es esencial para depurar errores durante el desarrollo y la demo. Se activa automáticamente con Lambda sin configuración adicional significativa.
**Qué se registra (MVP):**
- Errores de invocación de Lambda.
- Tiempo de ejecución y uso de memoria.
- Errores de llamada a Bedrock (sin incluir el contenido del usuario).
- Resultado del análisis: solo nivel de riesgo y fuente (llm/heuristic), nunca el contenido ingresado.
**Posible simplificación:** para el MVP basta con los logs automáticos de Lambda. No se necesitan dashboards ni alarmas personalizadas.

---

### Flujo de datos completo

```
1. Usuario ingresa contenido en el frontend (Amplify)
2. Frontend envía POST HTTPS a API Gateway: { content, type }
3. API Gateway valida formato básico e invoca Lambda
4. Lambda:
   a. Valida y sanitiza el input (Zod + sanitizer)
   b. Construye el prompt con el contenido
   c. Llama a Bedrock (Claude 3 Haiku) con InvokeModel
   d. Si Bedrock responde: parsea JSON → AnalysisResult (source: 'llm')
   e. Si Bedrock falla/timeout: ejecuta análisis heurístico → AnalysisResult (source: 'heuristic')
   f. Retorna { success: true, result: AnalysisResult } a API Gateway
5. API Gateway devuelve la respuesta al frontend
6. Frontend renderiza el ResultCard con animaciones
7. CloudWatch registra métricas y errores técnicos (sin contenido del usuario)
```

---

## Stack tecnológico

### Frontend

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Framework | **React 18 + Vite** | SPA estática, compatible con Amplify, build optimizado |
| Lenguaje | **TypeScript** | Tipado estático, reduce errores en runtime |
| Estilos | **Tailwind CSS** | Utilidades rápidas, diseño responsive y dark theme sin fricción |
| Componentes UI | **shadcn/ui** | Componentes accesibles y altamente personalizables |
| Iconos | **Lucide React** | Ligero, coherente con shadcn/ui |
| Animaciones | **Framer Motion** | Microinteracciones y transiciones de entrada de resultados |
| Validación | **Zod** | Validación client-side del input antes de llamar a la API |
| Fuentes | **Inter + JetBrains Mono** (Google Fonts) | Inter para UI, Mono para URLs y fragmentos técnicos |

> **Nota sobre el framework:** Se usa React + Vite (SPA estática) en lugar de Next.js, ya que Amplify despliega el frontend como archivos estáticos. No se necesita SSR. La lógica de servidor vive completamente en Lambda.

### Backend (Lambda)

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Runtime | **Node.js 20.x** | Soporte nativo de AWS SDK v3, TypeScript vía esbuild |
| Lenguaje | **TypeScript** (transpilado) | Consistencia con el frontend, tipado en la lógica de análisis |
| LLM | **Amazon Bedrock — Claude 3 Haiku** | IA generativa nativa en AWS, sin API Key externa |
| AWS SDK | **@aws-sdk/client-bedrock-runtime** | Llamadas a Bedrock desde Lambda |
| Validación | **Zod** | Validación del payload entrante y parseo del JSON de Bedrock |
| Build | **esbuild** | Bundling rápido de TypeScript para el zip de Lambda |

---

## Estructura de archivos del proyecto

```
cyberguard-ai/
├── .kiro/
│   └── specs/cyberguard-ai/
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
│
├── frontend/                         # React + Vite (desplegado en Amplify)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── hero/
│   │   │   │   └── HeroSection.tsx
│   │   │   ├── analyzer/
│   │   │   │   ├── AnalyzerCard.tsx
│   │   │   │   ├── AnalysisTypeSelector.tsx
│   │   │   │   ├── InputArea.tsx
│   │   │   │   ├── AnalyzeButton.tsx
│   │   │   │   └── ExampleSelector.tsx
│   │   │   ├── loading/
│   │   │   │   └── AnalyzingState.tsx
│   │   │   ├── results/
│   │   │   │   ├── ResultCard.tsx
│   │   │   │   ├── RiskHeader.tsx
│   │   │   │   ├── RiskMeter.tsx
│   │   │   │   ├── IndicatorList.tsx
│   │   │   │   ├── IndicatorItem.tsx
│   │   │   │   ├── RecommendationList.tsx
│   │   │   │   ├── ExplanationBlock.tsx
│   │   │   │   └── EducationalWarning.tsx
│   │   │   └── ui/                   # shadcn/ui components
│   │   ├── hooks/
│   │   │   └── useAnalyzer.ts        # Custom hook: estado y lógica del análisis
│   │   ├── lib/
│   │   │   ├── api-client.ts         # fetch wrapper para POST /analyze
│   │   │   ├── schemas/
│   │   │   │   ├── analysis-request.ts
│   │   │   │   └── analysis-result.ts
│   │   │   └── examples/
│   │   │       └── demo-examples.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx                   # Composición de la página principal
│   │   ├── main.tsx                  # Entry point de Vite
│   │   └── index.css                 # Variables CSS + estilos globales
│   ├── public/
│   │   └── logo.svg
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                          # Lambda function (desplegada en AWS)
│   ├── src/
│   │   ├── handler.ts                # Entry point de Lambda
│   │   ├── analysis/
│   │   │   ├── bedrock-analyzer.ts   # Invocación a Amazon Bedrock
│   │   │   ├── heuristic-analyzer.ts # Motor heurístico de respaldo
│   │   │   ├── prompts.ts            # System prompt + builder del user prompt
│   │   │   └── sanitizer.ts          # Sanitización del input
│   │   ├── schemas/
│   │   │   ├── analysis-request.ts   # Schema Zod para el evento Lambda
│   │   │   └── analysis-result.ts    # Schema Zod para la respuesta de Bedrock
│   │   └── types/
│   │       └── index.ts              # Tipos compartidos del backend
│   ├── esbuild.config.js             # Configuración del bundler para Lambda
│   ├── tsconfig.json
│   └── package.json
│
├── infrastructure/                   # Configuración de infraestructura AWS
│   ├── api-gateway.md                # Documentación de la configuración de API Gateway
│   ├── lambda-config.md              # Parámetros de Lambda (memoria, timeout, env vars)
│   ├── iam-policy.json               # Política IAM mínima para el rol de Lambda
│   └── amplify.yml                   # Build spec de AWS Amplify
│
├── .gitignore
└── README.md
```

---

## Diseño de tipos (TypeScript)

```typescript
export type AnalysisType = 'message' | 'url';
export type RiskLevel = 'bajo' | 'medio' | 'alto';

export interface AnalysisIndicator {
  id: string;
  name: string;
  explanation: string;   // En lenguaje sencillo, sin jerga
  severity: RiskLevel;
}

export interface AnalysisResult {
  riskLevel: RiskLevel;
  riskScore: number;            // 0–100 para el medidor visual
  summary: string;              // Párrafo explicativo en español
  indicators: AnalysisIndicator[];
  recommendations: string[];
  analysisType: AnalysisType;
  analyzedAt: string;           // ISO timestamp
  source: 'llm' | 'heuristic';
}

export interface AnalysisRequest {
  content: string;
  type: AnalysisType;
}

export interface DemoExample {
  id: string;
  label: string;
  type: AnalysisType;
  content: string;
  expectedRisk: RiskLevel;
}
```

---

## API: POST /analyze (API Gateway → Lambda)

El frontend llama a este endpoint. Lo expone API Gateway y lo procesa Lambda.

### Endpoint
```
POST https://{api-id}.execute-api.{region}.amazonaws.com/analyze
Content-Type: application/json
```

### Request
```json
{ "content": "string", "type": "message" | "url" }
```

### Response 200
```json
{
  "success": true,
  "result": {
    "riskLevel": "alto",
    "riskScore": 87,
    "summary": "Este mensaje presenta múltiples señales de phishing...",
    "indicators": [
      {
        "id": "urgency",
        "name": "Urgencia artificial",
        "explanation": "El mensaje te presiona a actuar rápido para que no pienses con calma.",
        "severity": "alto"
      }
    ],
    "recommendations": ["No hagas clic en ningún enlace del mensaje."],
    "analysisType": "message",
    "analyzedAt": "2026-09-24T23:00:00.000Z",
    "source": "llm"
  }
}
```

### Response error
```json
{ "success": false, "error": "Descripción del error en español" }
```

### CORS
API Gateway debe estar configurado para aceptar requests del dominio de Amplify (`https://*.amplifyapp.com` durante desarrollo, dominio propio en producción).

---

## Prompt del LLM (Amazon Bedrock — Claude 3 Haiku)

```typescript
// backend/src/analysis/prompts.ts

export const SYSTEM_PROMPT = `
Eres CyberGuard AI, un asistente experto en ciberseguridad educativa.
Analiza el contenido recibido e identifica señales de phishing u otras amenazas digitales.
Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown:

{
  "riskLevel": "bajo" | "medio" | "alto",
  "riskScore": number (0-100),
  "summary": string (1-3 oraciones en español sencillo),
  "indicators": [{ "id": string, "name": string, "explanation": string, "severity": "bajo"|"medio"|"alto" }],
  "recommendations": string[] (3-5 ítems en español)
}

Reglas:
- Solo español. Lenguaje accesible para personas sin conocimientos técnicos.
- Si no hay indicadores, devuelve riskLevel "bajo" y indicators [].
- No inventes indicadores ausentes en el contenido.
- El análisis es educativo; no afirmes con certeza absoluta que algo es malicioso.
`;

export function buildUserPrompt(content: string, type: string): string {
  return `Tipo de contenido: ${type === 'url' ? 'URL' : 'Mensaje o correo electrónico'}\n\nContenido a analizar:\n${content}`;
}
```

### Invocación a Bedrock desde Lambda

```typescript
// backend/src/analysis/bedrock-analyzer.ts

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

// El modelo se lee desde variable de entorno para facilitar el cambio
// Valor por defecto: anthropic.claude-3-haiku-20240307-v1:0
const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? 'anthropic.claude-3-haiku-20240307-v1:0';

// Formato de payload para modelos Anthropic en Bedrock (Messages API)
const payload = {
  anthropic_version: 'bedrock-2023-05-31',
  max_tokens: 1024,
  temperature: 0,
  system: SYSTEM_PROMPT,
  messages: [{ role: 'user', content: buildUserPrompt(content, type) }]
};
```

---

## Motor heurístico de respaldo

Evalúa el contenido con reglas predefinidas cuando el LLM no responde.

| Indicador | Patrón | Peso |
|-----------|--------|------|
| Urgencia | urgente, inmediatamente, suspenderá, vence, actúa ahora | Alto |
| Datos sensibles | contraseña, clave, pin, cuenta bancaria, tarjeta, CVV | Alto |
| Amenaza | bloqueado, cancelado, suspendido, demanda, legal | Medio |
| Oferta sospechosa | ganaste, premio, gratis, seleccionado, millones | Medio |
| URL acortada | bit.ly, tinyurl, t.co, ow.ly | Medio |
| Dominio falsificado | paypa1, arnazon, g00gle, faceb00k | Alto |
| Lenguaje genérico | estimado usuario, dear customer | Bajo |
| Clic urgente | haz clic aquí, click here, accede ahora | Bajo |

**Riskcore:** suma ponderada normalizada a 0–100. Bajo: 0–33 · Medio: 34–66 · Alto: 67–100.

---

## Sistema de diseño visual

### Principios de diseño

1. **Identidad propia sobre genericidad.** Cada elemento debe reforzar la imagen de CyberGuard AI como herramienta de ciberseguridad, no de un formulario web estándar.
2. **Jerarquía clara.** El flujo visual guía al usuario: hero → analizador → resultados. Nunca debe haber ambigüedad sobre qué hacer a continuación.
3. **Los resultados son el momento estelar.** La tarjeta de resultado debe sentirse como un "veredicto" visual poderoso, no como un bloque de texto.
4. **Economía visual.** Espaciado generoso, máximo 3–4 elementos por sección visible, sin ruido. Menos es más.
5. **Las microinteracciones justifican el MVP.** El estado de carga, las animaciones de entrada y los estados hover no son opcionales; son parte del nivel de acabado requerido.

---

### Paleta de colores

```css
/* Fondos — oscuro profundo, tecnológico */
--bg-base:        #080d1a;   /* Fondo de página */
--bg-surface:     #0d1526;   /* Tarjetas y paneles */
--bg-elevated:    #121d35;   /* Superficies elevadas, inputs */
--bg-muted:       #1a2640;   /* Bordes, divisores */

/* Acento principal — cian tecnológico */
--accent-primary:  #00d4ff;
--accent-secondary: #3b82f6;
--accent-glow:     rgba(0, 212, 255, 0.15);
--accent-gradient: linear-gradient(135deg, #00d4ff, #3b82f6);

/* Riesgo */
--risk-low:        #22c55e;   /* Verde */
--risk-low-bg:     rgba(34, 197, 94, 0.10);
--risk-medium:     #f59e0b;   /* Ámbar */
--risk-medium-bg:  rgba(245, 158, 11, 0.10);
--risk-high:       #ef4444;   /* Rojo */
--risk-high-bg:    rgba(239, 68, 68, 0.10);

/* Texto */
--text-primary:    #f0f4ff;
--text-secondary:  #8892a4;
--text-muted:      #4a5568;
--text-accent:     #00d4ff;
```

### Tipografía

| Uso | Fuente | Pesos |
|-----|--------|-------|
| Textos de UI, párrafos, botones | **Inter** | 400, 500, 600, 700 |
| URLs, fragmentos técnicos, badges | **JetBrains Mono** | 400, 500 |

Escala de tamaños (base 16px):
- Hero title: 3rem / 700 / tracking tight
- Section title: 1.5rem / 600
- Body: 1rem / 400 / leading relaxed
- Small / caption: 0.875rem / 400
- Mono (URLs): 0.875rem / JetBrains Mono

---

### Efectos y tratamientos visuales

**Glassmorphism sutil (header y tarjetas):**
```css
background: rgba(13, 21, 38, 0.85);
backdrop-filter: blur(12px);
border: 1px solid rgba(0, 212, 255, 0.10);
```

**Resplandor de acento (elementos activos, botones primarios):**
```css
box-shadow: 0 0 20px rgba(0, 212, 255, 0.25);
```

**Borde superior de tarjetas de análisis:**
```css
border-top: 2px solid transparent;
background-clip: padding-box;
/* o vía pseudo-elemento con gradiente */
```

**Fondo del hero — grid tecnológico:**
- Grid CSS sutil con líneas de `rgba(0, 212, 255, 0.04)` sobre el fondo oscuro.
- Sin imágenes externas ni librerías de partículas para mantener el rendimiento.

---

## Layout de la página principal

### Estructura de secciones (una sola página, scroll vertical)

```
┌─────────────────────────────────────────────┐
│  HEADER (sticky)                            │
│  Logo · CyberGuard AI · "Herramienta..."    │
├─────────────────────────────────────────────┤
│  HERO SECTION                               │
│  Headline + subtítulo + stat chips          │
│  ↓ CTA scroll o ancla al analizador         │
├─────────────────────────────────────────────┤
│  ANALYZER SECTION (área principal)          │
│  ┌─────────────────────────────────────┐    │
│  │  Tabs: Mensaje | URL                │    │
│  │  Textarea / Input de URL            │    │
│  │  Ejemplos rápidos (chips)           │    │
│  │  [  Analizar  ] ←── botón primario  │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  RESULT SECTION (aparece tras el análisis)  │
│  ┌─────────────────────────────────────┐    │
│  │  Nivel de riesgo + score            │    │
│  │  Barra / medidor visual             │    │
│  │  Resumen explicativo                │    │
│  │  Indicadores detectados             │    │
│  │  Recomendaciones                    │    │
│  │  ⚠ Advertencia educativa           │    │
│  │  [ Nuevo análisis ]                 │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  FOOTER                                     │
│  Aviso educativo · Versión MVP              │
└─────────────────────────────────────────────┘
```

---

## Especificaciones de componentes clave

### HeroSection

- Fondo con grid CSS sutil (sin librerías externas).
- Headline principal: **"Detecta amenazas digitales antes de que sea tarde"** (o similar, en español).
- Subtítulo breve explicando el propósito educativo.
- 3 stat chips decorativos: "Análisis con IA", "100% educativo", "En español".
- Flecha o botón de scroll suave hacia el analizador.
- En móvil: headline reducida, chips en fila compacta o columna.

### AnalyzerCard

- Tarjeta elevada sobre el fondo, con borde superior degradado (`--accent-gradient`).
- Borde izquierdo de grosor 1px con `--bg-muted`.
- Sombra sutil: `0 4px 24px rgba(0,0,0,0.4)`.
- **Tabs de tipo de análisis:**
  - Tab activo: texto `--accent-primary`, borde inferior cian, fondo `--bg-elevated`.
  - Tab inactivo: texto `--text-secondary`, sin borde.
  - Transición suave al cambiar de tab.
- **Textarea (modo mensaje):**
  - Fuente Inter, tamaño 0.9375rem.
  - Placeholder descriptivo: "Pega aquí el mensaje o correo sospechoso…"
  - Mínimo 140px de alto, máximo 320px, resize vertical.
  - Fondo `--bg-elevated`, borde `--bg-muted`, foco con borde `--accent-primary` y glow sutil.
- **Input de URL (modo URL):**
  - Input single-line, fuente JetBrains Mono.
  - Placeholder: "https://ejemplo-sospechoso.com/ruta"
  - Prefijo visual con ícono de enlace.
- **ExampleSelector:**
  - 3 chips compactos debajo del input.
  - Chip con ícono de color de riesgo + etiqueta corta.
  - Al hacer clic: llena el input con el ejemplo y selecciona el tipo correcto.
  - Estado hover: borde cian sutil.
- **AnalyzeButton:**
  - Botón ancho completo (full-width).
  - Gradiente `--accent-gradient` como fondo.
  - Texto: "Analizar" con ícono de escudo o lupa.
  - Estado cargando: texto cambia a "Analizando…", spinner interno, botón deshabilitado.
  - Estado hover: brillo aumentado + glow.

### AnalyzingState

- Reemplaza o superpone el botón durante el análisis.
- Animación de pulso en un ícono de escudo o radar circular.
- Mensaje rotativo o fijo: "Analizando el contenido…" / "Identificando señales…".
- Barra de progreso indeterminada con gradiente cian.
- Duración típica 3–10s, no debe sentirse como un error.

### ResultCard — Diseño detallado

La tarjeta de resultado es el componente más importante visualmente.

**RiskHeader:**
- Ocupa el ancho completo superior de la tarjeta.
- Fondo con color tenue del nivel de riesgo (`--risk-{level}-bg`).
- Borde superior con color sólido del nivel de riesgo.
- Ícono grande centrado o a la izquierda: escudo con check (bajo), advertencia (medio), peligro (alto).
- Texto grande: "RIESGO ALTO" / "RIESGO MEDIO" / "RIESGO BAJO" en mayúsculas, color del nivel.
- Subtexto: frase contextual corta (ej. "Este contenido presenta señales serias de phishing").

**RiskMeter:**
- Barra horizontal de progreso (0–100) con el color del nivel de riesgo.
- Score numérico visible al final de la barra.
- Animación de llenado al aparecer (Framer Motion: de 0 al valor real, ~600ms).
- Labels: Bajo / Medio / Alto en los tercios de la barra.

**ExplanationBlock:**
- Párrafo de resumen con fuente Inter, tamaño 1rem, color `--text-primary`.
- Fondo ligeramente diferenciado o con borde izquierdo cian.

**IndicatorList:**
- Título de sección: "Señales detectadas" con ícono.
- Si no hay indicadores: mensaje positivo con ícono verde ("No encontramos señales de riesgo").
- Cada IndicatorItem:
  - Borde izquierdo con color de severidad.
  - Nombre en negrita + badge de severidad pequeño.
  - Explicación en texto secundario.
  - Fondo `--bg-elevated`, esquinas redondeadas.

**RecommendationList:**
- Título: "Qué debes hacer".
- Lista con íconos de check o flecha, cada ítem en card compacta.
- Color de texto `--text-primary`, fondo diferenciado del resto.

**EducationalWarning:**
- Banner fijo al fondo de la tarjeta de resultado.
- Ícono de información, fondo sutil, texto en `--text-secondary`.
- Texto: "Este análisis es educativo. No garantiza que el contenido sea completamente seguro o malicioso. Ante cualquier duda, consulta con un experto."

**Botón "Nuevo análisis":**
- Botón secundario (outline) debajo de la advertencia.
- Al hacer clic: limpia el input, oculta resultados con animación de salida (Framer Motion).

---

## Microinteracciones y animaciones

| Evento | Animación |
|--------|-----------|
| Aparición de ResultCard | Slide up + fade in (Framer Motion, 400ms) |
| RiskMeter al aparecer | Llenado progresivo de izquierda a derecha (600ms, ease-out) |
| IndicatorItems | Stagger: cada ítem aparece con 80ms de delay entre sí |
| Botón Analizar hover | Scale 1.02 + glow aumentado |
| Chips de ejemplos hover | Borde cian + fondo `--accent-glow` |
| Tab change | Slide suave del indicador inferior |
| Estado de carga | Pulso del ícono central (keyframes CSS o Framer Motion) |
| Ocultación de ResultCard | Fade out + slide down al hacer "Nuevo análisis" |

Todas las duraciones deben respetar `prefers-reduced-motion`.

---

## Responsive — Adaptaciones por breakpoint

### Escritorio (≥1280px)
- Ancho máximo del contenido: 768px centrado.
- Hero con texto grande, chips en una fila.
- AnalyzerCard con padding generoso.
- ResultCard con las secciones en una columna.

### Tablet (768px–1279px)
- Ancho máximo: 640px.
- Misma estructura vertical, padding reducido.

### Móvil (< 768px)
- Ancho 100%, padding horizontal 1rem.
- Hero: headline reducida (1.875rem), chips en dos filas o columna.
- AnalyzerCard: textarea altura mínima reducida (100px).
- ResultCard: secciones compactas, sin padding excesivo.
- RiskHeader: ícono y texto apilados verticalmente.
- Botones full-width.

---

## Flujo de datos del análisis

```
Usuario ingresa contenido en el frontend (servido por Amplify)
        │
        ▼
useAnalyzer hook
  ├── Validación Zod (client-side)
  └── setLoading(true) → muestra AnalyzingState
        │
        ▼
POST https://{api-id}.execute-api.{region}.amazonaws.com/analyze
  (API Gateway HTTP API)
        │
        ▼
Lambda: cyberguard-analyze
  ├── Validación server-side (Zod)
  ├── Sanitización del input
  ├── Intento: Bedrock InvokeModel (Claude 3 Haiku, timeout 25s)
  │     ├── Éxito → parsear JSON con Zod → AnalysisResult (source: 'llm')
  │     └── Error/timeout → Heuristic Analyzer → AnalysisResult (source: 'heuristic')
  └── Retorna { success: true, result } a API Gateway
        │
        ▼
API Gateway devuelve respuesta al frontend
        │
        ▼
useAnalyzer hook
  ├── setResult(data)
  └── setLoading(false) → anima entrada de ResultCard
        │
        ▼
ResultCard renderiza con animaciones
```

---

## Ejemplos predefinidos para Demo Day

```typescript
export const DEMO_EXAMPLES: DemoExample[] = [
  {
    id: 'phishing-bank',
    label: '🔴 Correo bancario falso',
    type: 'message',
    expectedRisk: 'alto',
    content: `De: soporte@bancoseguro-alertas.com
Asunto: URGENTE: Su cuenta ha sido suspendida

Estimado cliente,

Hemos detectado actividad inusual en su cuenta. Su acceso ha sido SUSPENDIDO por seguridad.

Para reactivarlo INMEDIATAMENTE y evitar el cierre permanente, verifique sus datos:
http://bancoseguro-verificacion.tk/reactivar?token=ABC123

Deberá ingresar su número de cuenta, contraseña y PIN.
Tiene 24 HORAS o su cuenta será CANCELADA definitivamente.

Departamento de Seguridad — Banco Seguro S.A.`
  },
  {
    id: 'suspicious-url',
    label: '🟡 URL sospechosa',
    type: 'url',
    expectedRisk: 'medio',
    content: 'http://paypa1-secure-login.verificacion-cuenta.tk/signin'
  },
  {
    id: 'safe-message',
    label: '🟢 Mensaje legítimo',
    type: 'message',
    expectedRisk: 'bajo',
    content: `Hola,

Te recuerdo que mañana tenemos reunión de equipo a las 10:00 AM en la sala del tercer piso.

Si no puedes asistir, avísame para coordinar con el equipo.

¡Nos vemos mañana!
María`
  }
];
```

---

## Seguridad en el diseño

1. **Sin almacenamiento del contenido:** El input del usuario se procesa en memoria dentro de Lambda y no se persiste en ningún servicio AWS (ni S3, ni DynamoDB, ni logs de CloudWatch).
2. **Sin credenciales en el frontend:** El frontend solo conoce la URL del endpoint de API Gateway. No tiene acceso a credenciales AWS ni a claves de Bedrock. El acceso a Bedrock se realiza exclusivamente mediante el rol IAM de Lambda.
3. **IAM de mínimo privilegio:** El rol de Lambda solo tiene permiso `bedrock:InvokeModel` sobre el ARN específico del modelo. Ningún otro permiso adicional.
4. **Sanitización de prompt en Lambda:** Se remueven caracteres de control y se trunca el input antes de enviarlo a Bedrock para mitigar prompt injection básico.
5. **CORS restringido:** API Gateway solo acepta requests del dominio de Amplify configurado explícitamente.
6. **CloudWatch sin contenido del usuario:** Los logs de Lambda registran errores técnicos (excepción, código de estado, duración) pero nunca el contenido analizado.
7. **Sin ejecución de archivos:** El MVP no procesa archivos; cualquier futura implementación debe realizarse en sandbox aislado.

---

## Decisiones de diseño y justificaciones

| Decisión | Alternativa considerada | Justificación |
|----------|------------------------|---------------|
| React + Vite (SPA) en Amplify | Next.js en Amplify SSR | La app es una SPA sin SSR; Vite produce archivos estáticos más simples y compatibles con Amplify hosting |
| Amazon Bedrock (Claude 3 Haiku) | OpenAI GPT-4o-mini | Bedrock es nativo en AWS, usa el rol IAM de Lambda (sin API Key externa), bajo costo por token, latencia adecuada |
| Lambda + API Gateway | Next.js API Routes | La separación frontend/backend es correcta en AWS; Lambda es serverless, sin servidor que gestionar |
| HTTP API Gateway (no REST API) | REST API Gateway | HTTP API tiene menor latencia y menor costo; suficiente para el MVP |
| Amplify Hosting | S3 + CloudFront manual | Amplify simplifica CI/CD, HTTPS y configuración de dominio; S3+CloudFront es más flexible pero innecesariamente complejo para el MVP |
| shadcn/ui | MUI / Chakra UI | Mayor control sobre estilos, integración directa con Tailwind |
| Framer Motion | CSS transitions puras | Animaciones más complejas (stagger, layout animations) con API declarativa |
| Fallback heurístico en Lambda | Solo Bedrock | Garantiza demostración funcional si Bedrock tiene latencia alta o errores transitorios |
| JSON estructurado de Bedrock | Texto libre parseado | Respuestas predecibles, validables con Zod, sin lógica de parsing frágil |
