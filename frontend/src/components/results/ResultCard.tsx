import { motion } from 'framer-motion'
import { RotateCcw, Cpu, Brain } from 'lucide-react'
import type { AnalysisResult } from '@/types'
import RiskHeader         from './RiskHeader'
import RiskMeter          from './RiskMeter'
import ExplanationBlock   from './ExplanationBlock'
import IndicatorList      from './IndicatorList'
import RecommendationList from './RecommendationList'
import EducationalWarning from './EducationalWarning'

interface Props {
  result:   AnalysisResult
  onReset:  () => void
}

export default function ResultCard({ result, onReset }: Props) {
  return (
    <motion.div
      key="result-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{    opacity: 0, y: 16 }}
      transition={{ duration: 0.40, ease: 'easeOut' }}
    >
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          background:  '#0d1526',
          border:      '1px solid rgba(26,38,64,1)',
          boxShadow:   '0 4px 32px rgba(0,0,0,0.45)',
        }}
        role="region"
        aria-label="Resultado del análisis"
        aria-live="polite"
      >

        {/* ── Chip: fuente del análisis ──────────────────────── */}
        {result.source === 'heuristic' && (
          <div className="flex justify-end px-4 pt-3">
            <span
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(245,158,11,0.08)',
                border:     '1px solid rgba(245,158,11,0.22)',
                color:      '#f59e0b',
              }}
              title="El servicio de IA no estaba disponible. Se usó el análisis básico de respaldo."
            >
              <Cpu className="w-3 h-3" aria-hidden="true" />
              Análisis básico (modo sin IA)
            </span>
          </div>
        )}
        {result.source === 'llm' && (
          <div className="flex justify-end px-4 pt-3">
            <span
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(0,212,255,0.06)',
                border:     '1px solid rgba(0,212,255,0.15)',
                color:      '#00d4ff',
              }}
            >
              <Brain className="w-3 h-3" aria-hidden="true" />
              Análisis con IA
            </span>
          </div>
        )}

        {/* ── RiskHeader ─────────────────────────────────────── */}
        <RiskHeader riskLevel={result.riskLevel} riskScore={result.riskScore} />

        {/* ── RiskMeter ─────────────────────────────────────── */}
        <RiskMeter riskLevel={result.riskLevel} riskScore={result.riskScore} />

        {/* Divisor */}
        <div className="mx-5 sm:mx-6 h-px" style={{ background: 'rgba(26,38,64,0.8)' }} aria-hidden="true" />

        {/* ── Cuerpo de resultados ─────────────────────────── */}
        <div className="py-5 space-y-5">

          {/* Explicación */}
          <ExplanationBlock summary={result.summary} />

          <div className="mx-5 sm:mx-6 h-px" style={{ background: 'rgba(26,38,64,0.8)' }} aria-hidden="true" />

          {/* Indicadores */}
          <IndicatorList indicators={result.indicators} />

          <div className="mx-5 sm:mx-6 h-px" style={{ background: 'rgba(26,38,64,0.8)' }} aria-hidden="true" />

          {/* Recomendaciones */}
          <RecommendationList recommendations={result.recommendations} />

        </div>

        {/* ── Advertencia educativa ─────────────────────────── */}
        <div className="pb-4">
          <EducationalWarning />
        </div>

        {/* Divisor */}
        <div className="mx-5 sm:mx-6 h-px" style={{ background: 'rgba(26,38,64,0.8)' }} aria-hidden="true" />

        {/* ── Botón Nuevo análisis ──────────────────────────── */}
        <div className="px-5 sm:px-6 py-4">
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            style={{
              background:  'transparent',
              border:      '1px solid rgba(26,38,64,1)',
              color:       '#8892a4',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00d4ff'
              e.currentTarget.style.color       = '#00d4ff'
              e.currentTarget.style.background  = 'rgba(0,212,255,0.04)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(26,38,64,1)'
              e.currentTarget.style.color       = '#8892a4'
              e.currentTarget.style.background  = 'transparent'
            }}
            aria-label="Realizar un nuevo análisis"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Nuevo análisis
          </button>
        </div>
      </div>
    </motion.div>
  )
}
