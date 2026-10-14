import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import type { LambdaApiResponse, AnalysisResult } from './types/index.js'
import { parseRequest } from './schemas/analysis-request.js'
import { sanitizeInput } from './analysis/sanitizer.js'
import { analyzeWithHeuristics } from './analysis/heuristic-analyzer.js'

// ── CORS ──────────────────────────────────────────────────────────────────────

/**
 * Origen permitido para CORS.
 * En producción: dominio exacto de Amplify (ej. https://main.abc123.amplifyapp.com).
 * Durante desarrollo y MVP: se puede usar '*' pero se recomienda restringir.
 */
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? '*'

function buildCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin':  ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type':                 'application/json',
  }
}

// ── Helpers de respuesta ─────────────────────────────────────────────────────

function successResponse(result: AnalysisResult) {
  const body: LambdaApiResponse = { success: true, result }
  return {
    statusCode: 200,
    headers: buildCorsHeaders(),
    body: JSON.stringify(body),
  }
}

function errorResponse(statusCode: number, message: string) {
  const body: LambdaApiResponse = { success: false, error: message }
  return {
    statusCode,
    headers: buildCorsHeaders(),
    body: JSON.stringify(body),
  }
}

// ── Handler principal ────────────────────────────────────────────────────────

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const startTime = Date.now()

  // Preflight CORS — API Gateway HTTP API lo gestiona, pero por si acaso
  if (event.requestContext.http.method === 'OPTIONS') {
    return { statusCode: 204, headers: buildCorsHeaders(), body: '' }
  }

  // Solo aceptar POST
  if (event.requestContext.http.method !== 'POST') {
    return errorResponse(405, 'Método no permitido.')
  }

  // ── 1. Parsear y validar el body ─────────────────────────────────────────
  let request
  try {
    request = parseRequest(event.body)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Solicitud inválida.'
    console.error('[CyberGuard] Request validation error:', message)
    return errorResponse(400, message)
  }

  // ── 2. Sanitizar el input ────────────────────────────────────────────────
  const sanitizedContent = sanitizeInput(request.content, request.type)
  const sanitizedRequest = { ...request, content: sanitizedContent }

  // IMPORTANTE: No loguear el contenido del usuario.
  // Solo loguear metadatos técnicos.
  console.info('[CyberGuard] Analysis started:', {
    type: sanitizedRequest.type,
    contentLength: sanitizedContent.length,
    requestId: event.requestContext.requestId,
  })

  // ── 3. Análisis heurístico directo ──────────────────────────────
  let result: AnalysisResult
  let analysisSource: 'llm' | 'heuristic' = 'heuristic'

  try {
    result = analyzeWithHeuristics(sanitizedRequest)
  } catch (heuristicError) {
    console.error('[CyberGuard] Heuristic analyzer failed:', {
      heuristicError: heuristicError instanceof Error
        ? heuristicError.message
        : 'Error desconocido',
      requestId: event.requestContext.requestId,
    })
    return errorResponse(
      500,
      'No se pudo completar el análisis. Por favor, inténtalo de nuevo.'
    )
  }

  const duration = Date.now() - startTime

  // ── 4. Loguear resultado (sin contenido del usuario) ─────────────────────
  console.info('[CyberGuard] Analysis completed:', {
    type:        result.analysisType,
    riskLevel:   result.riskLevel,
    riskScore:   result.riskScore,
    indicators:  result.indicators.length,
    source:      analysisSource,
    durationMs:  duration,
    requestId:   event.requestContext.requestId,
  })

  return successResponse(result)
}
