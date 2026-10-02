import type { AnalysisRequest, AnalysisResult } from '@/types'
import { parseApiResponse } from '@/lib/schemas/analysis-result'

/** Timeout para la llamada a la API: 30 segundos */
const API_TIMEOUT_MS = 30_000

/**
 * Envía el contenido al endpoint de análisis y devuelve el resultado validado.
 *
 * El endpoint se lee desde la variable de entorno VITE_API_ENDPOINT,
 * que en producción apunta al HTTP API de Amazon API Gateway.
 * Nunca se hardcodea la URL ni se incluyen credenciales AWS en el frontend.
 *
 * @throws Error con mensaje en español si:
 *   - VITE_API_ENDPOINT no está configurada
 *   - La red falla o el servidor no responde en 30s
 *   - La respuesta tiene success: false (error del backend)
 *   - La respuesta no cumple el schema esperado
 */
export async function analyzeContent(
  request: AnalysisRequest
): Promise<AnalysisResult> {
  const endpoint = import.meta.env.VITE_API_ENDPOINT as string | undefined

  if (!endpoint) {
    throw new Error(
      'El servicio de análisis no está configurado. ' +
      'Configura VITE_API_ENDPOINT en el archivo .env.local.'
    )
  }

  const controller = new AbortController()
  const timeoutId  = setTimeout(
    () => controller.abort(new Error(`La solicitud superó los ${API_TIMEOUT_MS / 1000} segundos.`)),
    API_TIMEOUT_MS
  )

  try {
    const response = await fetch(endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(request),
      signal:  controller.signal,
    })

    // Parsear el body como JSON en todos los casos (éxito y error)
    let body: unknown
    try {
      body = await response.json()
    } catch {
      throw new Error(
        'El servidor devolvió una respuesta que no se pudo leer. ' +
        'Por favor, inténtalo de nuevo.'
      )
    }

    // Respuesta HTTP de error (4xx, 5xx)
    if (!response.ok) {
      const msg =
        body &&
        typeof body === 'object' &&
        'error' in body &&
        typeof (body as Record<string, unknown>).error === 'string'
          ? ((body as unknown) as { error: string }).error
          : `Error del servidor (${response.status}). Inténtalo de nuevo.`
      throw new Error(msg)
    }

    // Respuesta HTTP 200 pero con success: false
    if (
      body &&
      typeof body === 'object' &&
      'success' in body &&
      (body as Record<string, unknown>).success === false
    ) {
      const msg =
        typeof (body as Record<string, unknown>).error === 'string'
          ? ((body as unknown) as { error: string }).error
          : 'El análisis no pudo completarse. Inténtalo de nuevo.'
      throw new Error(msg)
    }

    // Validar y parsear con Zod — lanza si la estructura no coincide
    return parseApiResponse(body)
  } catch (err) {
    // AbortController disparó el timeout
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        'El análisis tardó demasiado en responder. ' +
        'Verifica tu conexión e inténtalo de nuevo.'
      )
    }
    // Re-lanzar errores ya formateados
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}
