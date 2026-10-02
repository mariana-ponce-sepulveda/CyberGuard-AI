import { z } from 'zod'
import type { AnalysisRequest } from '@/types'

/** Límites de longitud del contenido según el tipo */
const CONTENT_LIMITS = {
  message: 5000,
  url: 2048,
} as const

/** Schema Zod para validar el request de análisis en el cliente */
export const analysisRequestSchema = z.object({
  content: z
    .string()
    .min(1, 'El contenido no puede estar vacío.')
    .max(5000, 'El contenido supera el límite permitido.'),
  type: z.enum(['message', 'url'], {
    errorMap: () => ({ message: 'Tipo de análisis inválido.' }),
  }),
}).superRefine((data, ctx) => {
  const limit = CONTENT_LIMITS[data.type]
  if (data.content.length > limit) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_big,
      maximum: limit,
      type: 'string',
      inclusive: true,
      message: `El contenido supera los ${limit} caracteres permitidos para este tipo de análisis.`,
      path: ['content'],
    })
  }
})

export type AnalysisRequestInput = z.infer<typeof analysisRequestSchema>

/**
 * Valida un request de análisis. Devuelve el objeto validado o lanza un error
 * con el primer mensaje de validación encontrado.
 */
export function validateAnalysisRequest(data: unknown): AnalysisRequest {
  const result = analysisRequestSchema.safeParse(data)
  if (!result.success) {
    const firstError = result.error.errors[0]
    throw new Error(firstError?.message ?? 'Datos de análisis inválidos.')
  }
  return result.data
}
