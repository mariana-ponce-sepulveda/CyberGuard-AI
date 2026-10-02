import { DEMO_EXAMPLES } from '@/lib/examples/demo-examples'
import type { AnalysisType, RiskLevel } from '@/types'

interface Props {
  onSelect: (content: string, type: AnalysisType) => void
  disabled?: boolean
}

// Color y texto de etiqueta por nivel de riesgo
const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; border: string }> = {
  alto:  { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)' },
  medio: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  bajo:  { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)'  },
}

export default function ExampleSelector({ onSelect, disabled = false }: Props) {
  return (
    <div>
      <p className="text-xs mb-2" style={{ color: '#4a5568' }}>
        Prueba con un ejemplo:
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Ejemplos de demostración"
      >
        {DEMO_EXAMPLES.map((example) => {
          const cfg = RISK_CONFIG[example.expectedRisk]
          return (
            <button
              key={example.id}
              onClick={() => !disabled && onSelect(example.content, example.type)}
              disabled={disabled}
              aria-label={`Cargar ejemplo: ${example.label}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.color,
              }}
              onMouseEnter={(e) => {
                if (disabled) return
                e.currentTarget.style.borderColor = '#00d4ff'
                e.currentTarget.style.background   = 'rgba(0,212,255,0.08)'
                e.currentTarget.style.color        = '#00d4ff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = cfg.border
                e.currentTarget.style.background  = cfg.bg
                e.currentTarget.style.color       = cfg.color
              }}
            >
              {example.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
