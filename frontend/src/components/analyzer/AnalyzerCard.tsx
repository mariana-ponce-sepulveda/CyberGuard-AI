import { useState, useCallback } from 'react'
import AnalysisTypeSelector from './AnalysisTypeSelector'
import InputArea from './InputArea'
import ExampleSelector from './ExampleSelector'
import AnalyzeButton from './AnalyzeButton'
import type { AnalysisType } from '@/types'

interface Props {
  /** Callback llamado al presionar Analizar con el contenido y tipo válidos */
  onAnalyze?: (content: string, type: AnalysisType) => void
  /** Si el análisis está en proceso (controla loading del botón) */
  loading?: boolean
  /** Estado controlado externamente (opcional — para integración con useAnalyzer) */
  controlled?: {
    content:      string
    analysisType: AnalysisType
    onContentChange:      (value: string) => void
    onAnalysisTypeChange: (type: AnalysisType) => void
  }
}

export default function AnalyzerCard({ onAnalyze, loading = false, controlled }: Props) {
  // Estado interno (usado solo si no se pasa `controlled`)
  const [internalType,    setInternalType]    = useState<AnalysisType>('message')
  const [internalContent, setInternalContent] = useState('')
  const [hasError, setHasError] = useState(false)

  // Resolver fuente de estado: controlado externo tiene prioridad
  const analysisType = controlled ? controlled.analysisType : internalType
  const content      = controlled ? controlled.content      : internalContent

  const handleTypeChange = useCallback((type: AnalysisType) => {
    if (controlled) {
      controlled.onAnalysisTypeChange(type)
      controlled.onContentChange('')
    } else {
      setInternalType(type)
      setInternalContent('')
    }
    setHasError(false)
  }, [controlled])

  const handleContentChange = useCallback((value: string) => {
    if (controlled) {
      controlled.onContentChange(value)
    } else {
      setInternalContent(value)
    }
    if (value.trim().length > 0) setHasError(false)
  }, [controlled])

  const handleSelectExample = useCallback((exContent: string, exType: AnalysisType) => {
    if (controlled) {
      controlled.onAnalysisTypeChange(exType)
      controlled.onContentChange(exContent)
    } else {
      setInternalType(exType)
      setInternalContent(exContent)
    }
    setHasError(false)
  }, [controlled])

  const handleAnalyze = () => {
    if (!content.trim()) {
      setHasError(true)
      return
    }
    setHasError(false)
    onAnalyze?.(content.trim(), analysisType)
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        background: '#0d1526',
        border: '1px solid rgba(26,38,64,1)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.40)',
      }}
    >
      {/* ── Borde superior degradado ────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        aria-hidden="true"
        style={{ background: 'linear-gradient(135deg, #00d4ff, #3b82f6)' }}
      />

      {/* ── Cuerpo ──────────────────────────────────────────── */}
      <div className="p-4 sm:p-6 space-y-5 pt-6">

        {/* Encabezado de la tarjeta */}
        <div>
          <h2
            className="text-base font-semibold mb-0.5"
            style={{ color: '#f0f4ff' }}
          >
            Analiza un contenido sospechoso
          </h2>
          <p className="text-xs" style={{ color: '#4a5568' }}>
            Pega un mensaje, correo o URL y obtén un análisis de riesgo en segundos.
          </p>
        </div>

        {/* Selector de tipo */}
        <AnalysisTypeSelector
          value={analysisType}
          onChange={handleTypeChange}
          disabled={loading}
        />

        {/* Área de entrada */}
        <InputArea
          type={analysisType}
          value={content}
          onChange={handleContentChange}
          disabled={loading}
          hasError={hasError}
        />

        {/* Separador */}
        <div
          className="h-px"
          aria-hidden="true"
          style={{ background: 'rgba(26,38,64,0.8)' }}
        />

        {/* Ejemplos de demostración */}
        <ExampleSelector
          onSelect={handleSelectExample}
          disabled={loading}
        />

        {/* Botón principal */}
        <AnalyzeButton
          onClick={handleAnalyze}
          loading={loading}
          disabled={loading}
        />
      </div>
    </div>
  )
}
