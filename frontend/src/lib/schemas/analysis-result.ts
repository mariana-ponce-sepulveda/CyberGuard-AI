import { z } from 'zod'
import type { AnalysisResult } from '@/types'

const riskLevelSchema = z.enum(['bajo', 'medio', 'alto'])

const analysisIndicatorSchema = z.object({
  id:          z.string().default('unknown'),
  name:        z.string().min(1),
  explanation: z.string().min(1),
  severity:    riskLevelSchema,
})

/** Schema Zod para validar y parsear la respuesta de la API */
export const analysisResultSchema = z.object({
  riskLevel:       riskLevelSchema,
  riskScore:       z.number().min(0).max(100),
  summary:         z.string().min(1),
  indicators:      z.array(analysisIndicatorSchema).default([]),
  recommendations: z.array(z.string()).min(1),
  analysisType:    z.enum(['message', 'url']),
  analyzedAt:      z.string(),
  source:          z.enum(['llm', 'heuristic']),
})

export const apiResponseSchema = z.object({
  success: z.literal(true),
  result:  analysisResultSchema,
})

export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  error:   z.string(),
})

/**
 * Parsea y valida la respuesta cruda de la API.
 * Lanza un error descriptivo si la estructura no es válida.
 */
export function parseApiResponse(data: unknown): AnalysisResult {
  const result = apiResponseSchema.safeParse(data)
  if (!result.success) {
    console.error('API response validation failed:', result.error.errors)
    throw new Error('La respuesta del servidor no tiene el formato esperado.')
  }
  return result.data.result
}
