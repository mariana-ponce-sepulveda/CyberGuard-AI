import { z } from 'zod'
import type { AnalysisRequest } from '../types/index.js'

const CONTENT_LIMITS = {
  message: 5000,
  url: 2048,
} as const

/**
 * Schema Zod para validar el body del evento Lambda.
 * Aplica límites de longitud según el tipo de análisis.
 */
export const analysisRequestSchema = z
  .object({
    content: z.string().min(1, 'El contenido no puede estar vacío.').max(5000),
    type: z.enum(['message', 'url'], {
      errorMap: () => ({ message: 'El tipo debe ser "message" o "url".' }),
    }),
  })
  .superRefine((data, ctx) => {
    const limit = CONTENT_LIMITS[data.type]
    if (data.content.length > limit) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: limit,
        type: 'string',
        inclusive: true,
        message: `El contenido supera los ${limit} caracteres permitidos para este tipo.`,
        path: ['content'],
      })
    }
  })

export type AnalysisRequestInput = z.infer<typeof analysisRequestSchema>

/**
 * Parsea y valida el body de la request Lambda.
 * Lanza ZodError si el body no es válido.
 */
export function parseRequest(body: string | null | undefined): AnalysisRequest {
  if (!body) {
    throw new Error('El cuerpo de la solicitud está vacío.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(body)
  } catch {
    throw new Error('El cuerpo de la solicitud no es JSON válido.')
  }

  const result = analysisRequestSchema.safeParse(parsed)
  if (!result.success) {
    const first = result.error.errors[0]
    throw new Error(first?.message ?? 'Datos de solicitud inválidos.')
  }

  return result.data
}
