import { useState, useCallback } from 'react'
import type { AnalysisResult, AnalysisType, DemoExample } from '@/types'
import { validateAnalysisRequest } from '@/lib/schemas/analysis-request'
import { analyzeContent } from '@/lib/api-client'

export interface UseAnalyzerState {
  content:      string
  analysisType: AnalysisType
  result:       AnalysisResult | null
  loading:      boolean
  error:        string | null
}

export interface UseAnalyzerActions {
  setContent:      (value: string) => void
  setAnalysisType: (type: AnalysisType) => void
  analyze:         () => Promise<void>
  reset:           () => void
  loadExample:     (example: DemoExample) => void
}

export type UseAnalyzerReturn = UseAnalyzerState & UseAnalyzerActions

/**
 * Hook central que gestiona todo el ciclo de vida del análisis:
 * entrada del usuario → validación → llamada a la API → resultado/error → reset.
 *
 * El contenido nunca se almacena más allá del estado React de la sesión activa.
 * Al hacer reset() se limpia completamente.
 */
export function useAnalyzer(): UseAnalyzerReturn {
  const [content,      setContent]      = useState('')
  const [analysisType, setAnalysisType] = useState<AnalysisType>('message')
  const [result,       setResult]       = useState<AnalysisResult | null>(null)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState<string | null>(null)

  /** Ejecuta el análisis completo: valida → llama a la API → actualiza estado */
  const analyze = useCallback(async () => {
    // 1. Validación client-side con Zod antes de llamar a la API
    let validated
    try {
      validated = validateAnalysisRequest({ content: content.trim(), type: analysisType })
    } catch (validationError) {
      setError(
        validationError instanceof Error
          ? validationError.message
          : 'El contenido ingresado no es válido.'
      )
      return
    }

    // 2. Iniciar estado de carga
    setLoading(true)
    setError(null)
    setResult(null)

    // 3. Llamar a la API
    try {
      const analysisResult = await analyzeContent(validated)
      setResult(analysisResult)
    } catch (apiError) {
      setError(
        apiError instanceof Error
          ? apiError.message
          : 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.'
      )
    } finally {
      setLoading(false)
    }
  }, [content, analysisType])

  /** Limpia el contenido, el resultado y el error para comenzar de nuevo */
  const reset = useCallback(() => {
    setContent('')
    setAnalysisType('message')
    setResult(null)
    setError(null)
    setLoading(false)
  }, [])

  /** Carga el contenido y tipo de un ejemplo predefinido */
  const loadExample = useCallback((example: DemoExample) => {
    setContent(example.content)
    setAnalysisType(example.type)
    setResult(null)
    setError(null)
  }, [])

  return {
    content,
    analysisType,
    result,
    loading,
    error,
    setContent,
    setAnalysisType,
    analyze,
    reset,
    loadExample,
  }
}
