import { z } from 'zod'
import type { AnalysisResult } from '../types/index.js'

const riskLevelSchema = z.enum(['bajo', 'medio', 'alto'])

const analysisIndicatorSchema = z.object({
  id:          z.string().default('unknown'),
  name:        z.string().min(1),
  explanation: z.string().min(1),
  severity:    riskLevelSchema,
})

/**
 * Schema Zod para parsear y validar la respuesta JSON de Bedrock.
 * Usa .default() en campos opcionales para ser tolerante ante respuestas
 * ligeramente incompletas del modelo.
 */
export const analysisResultSchema = z.object({
  riskLevel:       riskLevelSchema,
  riskScore:       z.number().min(0).max(100),
  summary:         z.string().min(1),
  indicators:      z.array(analysisIndicatorSchema).default([]),
  recommendations: z.array(z.string()).min(1),
})

export type BedrockAnalysisOutput = z.infer<typeof analysisResultSchema>

/**
 * Parsea el texto de la respuesta de Bedrock como JSON y lo valida.
 * Lanza un error descriptivo si no cumple el schema.
 */
export function parseBedrockResponse(
  rawText: string,
  analysisType: AnalysisResult['analysisType']
): AnalysisResult {
  // Extraer el JSON si viene envuelto en markdown code fences
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) 
  const jsonText = jsonMatch ? jsonMatch[1].trim() : rawText.trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error(`Bedrock devolvió texto no parseable como JSON: ${jsonText.slice(0, 200)}`)
  }

  const result = analysisResultSchema.safeParse(parsed)
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    throw new Error(`Respuesta de Bedrock no cumple el schema esperado: ${errors}`)
  }

  return {
    ...result.data,
    analysisType,
    analyzedAt: new Date().toISOString(),
    source: 'llm',
  }
}
