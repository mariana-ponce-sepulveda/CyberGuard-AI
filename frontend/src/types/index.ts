// ─── Tipos compartidos de CyberGuard AI ─────────────────────────────────────
// Usados en el frontend. El backend mantiene su propia copia en backend/src/types/

/** Tipo de contenido que se va a analizar */
export type AnalysisType = 'message' | 'url'

/** Nivel de riesgo del análisis */
export type RiskLevel = 'bajo' | 'medio' | 'alto'

/** Un indicador de phishing detectado en el contenido */
export interface AnalysisIndicator {
  /** Identificador único del indicador */
  id: string
  /** Nombre corto del indicador (ej. "Urgencia artificial") */
  name: string
  /** Explicación en lenguaje sencillo, sin jerga técnica */
  explanation: string
  /** Nivel de severidad del indicador individual */
  severity: RiskLevel
}

/** Resultado completo del análisis de CyberGuard AI */
export interface AnalysisResult {
  /** Nivel de riesgo general del contenido */
  riskLevel: RiskLevel
  /** Score numérico 0–100 para el medidor visual */
  riskScore: number
  /** Párrafo explicativo en español, lenguaje sencillo */
  summary: string
  /** Lista de señales de phishing detectadas */
  indicators: AnalysisIndicator[]
  /** Lista de recomendaciones de seguridad (3–5 ítems) */
  recommendations: string[]
  /** Tipo de contenido analizado */
  analysisType: AnalysisType
  /** Timestamp ISO de cuando se realizó el análisis */
  analyzedAt: string
  /** Indica si el resultado viene del LLM o del análisis heurístico */
  source: 'llm' | 'heuristic'
}

/** Payload que el frontend envía a la API */
export interface AnalysisRequest {
  /** Contenido a analizar (mensaje, correo o URL) */
  content: string
  /** Tipo de análisis a realizar */
  type: AnalysisType
}

/** Ejemplo predefinido para demostración */
export interface DemoExample {
  /** Identificador único del ejemplo */
  id: string
  /** Etiqueta visible en el chip de selección */
  label: string
  /** Tipo de análisis del ejemplo */
  type: AnalysisType
  /** Contenido predefinido del ejemplo */
  content: string
  /** Nivel de riesgo esperado (para verificación) */
  expectedRisk: RiskLevel
}

/** Respuesta de la API (envuelve AnalysisResult) */
export interface ApiResponse {
  success: true
  result: AnalysisResult
}

/** Respuesta de error de la API */
export interface ApiErrorResponse {
  success: false
  error: string
}
