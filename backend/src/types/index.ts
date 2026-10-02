// ─── Tipos del backend CyberGuard AI ────────────────────────────────────────
// Copia independiente de los tipos del frontend.
// Mantener sincronizados manualmente si se modifican.

export type AnalysisType = 'message' | 'url'

export type RiskLevel = 'bajo' | 'medio' | 'alto'

export interface AnalysisIndicator {
  id: string
  name: string
  explanation: string
  severity: RiskLevel
}

export interface AnalysisResult {
  riskLevel: RiskLevel
  riskScore: number
  summary: string
  indicators: AnalysisIndicator[]
  recommendations: string[]
  analysisType: AnalysisType
  analyzedAt: string
  source: 'llm' | 'heuristic'
}

export interface AnalysisRequest {
  content: string
  type: AnalysisType
}

/** Respuesta HTTP exitosa de la Lambda */
export interface SuccessResponse {
  success: true
  result: AnalysisResult
}

/** Respuesta HTTP de error de la Lambda */
export interface ErrorResponse {
  success: false
  error: string
}

export type LambdaApiResponse = SuccessResponse | ErrorResponse
