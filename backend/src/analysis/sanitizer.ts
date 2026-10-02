import type { AnalysisType } from '../types/index.js'

const CONTENT_LIMITS: Record<AnalysisType, number> = {
  message: 5000,
  url: 2048,
}

/**
 * Patrones de prompt injection obvios que se eliminan antes de enviar a Bedrock.
 * Se buscan de forma case-insensitive.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /ignora\s+(las?\s+)?instrucciones\s+(anteriores?|previas?|del\s+sistema)/gi,
  /olvida\s+(las?\s+)?instrucciones/gi,
  /olvida\s+el\s+(sistema\s+)?prompt/gi,
  /actúa\s+como\s+(si\s+fueras?|un\s+nuevo)/gi,
  /nuevo\s+(rol|modo|comportamiento|sistema)/gi,
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
  /forget\s+(all\s+)?instructions/gi,
  /you\s+are\s+now\s+a/gi,
  /system\s*:\s*you\s+are/gi,
  /<\/?system>/gi,
  /\[INST\]/gi,
  /<<SYS>>/gi,
]

/**
 * Sanitiza el contenido ingresado por el usuario antes de enviarlo a Bedrock.
 *
 * Operaciones aplicadas:
 * 1. Elimina caracteres de control excepto \n, \r y \t.
 * 2. Normaliza saltos de línea a \n.
 * 3. Neutraliza patrones obvios de prompt injection.
 * 4. Trunca al límite de caracteres según el tipo de análisis.
 *
 * @param content - Texto ingresado por el usuario.
 * @param type    - Tipo de análisis ('message' | 'url').
 * @returns       - Contenido sanitizado y truncado.
 */
export function sanitizeInput(content: string, type: AnalysisType): string {
  // 1. Eliminar caracteres de control (0x00–0x1F y 0x7F) excepto \n \r \t
  let sanitized = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // 2. Normalizar saltos de línea
  sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // 3. Neutralizar patrones de prompt injection
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[contenido eliminado]')
  }

  // 4. Truncar al límite del tipo de análisis
  const limit = CONTENT_LIMITS[type]
  if (sanitized.length > limit) {
    sanitized = sanitized.slice(0, limit)
  }

  return sanitized.trim()
}
