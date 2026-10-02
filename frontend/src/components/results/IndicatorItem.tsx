import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import type { AnalysisIndicator } from '@/types'
import { RISK_COLORS } from '@/lib/risk-config'

interface Props {
  indicator: AnalysisIndicator
}

const SEVERITY_ICONS = {
  alto:  <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />,
  medio: <AlertCircle   className="w-4 h-4 flex-shrink-0" aria-hidden="true" />,
  bajo:  <Info          className="w-4 h-4 flex-shrink-0" aria-hidden="true" />,
}

const SEVERITY_LABELS = {
  alto:  'Alta',
  medio: 'Media',
  bajo:  'Baja',
}

export default function IndicatorItem({ indicator }: Props) {
  const cfg = RISK_COLORS[indicator.severity]

  return (
    <li
      className="rounded-lg px-4 py-3"
      style={{
        background:  '#121d35',
        borderLeft:  `3px solid ${cfg.solid}`,
        border:      `1px solid rgba(26,38,64,1)`,
        borderLeftWidth: '3px',
        borderLeftColor: cfg.solid,
      }}
    >
      {/* Nombre + badge de severidad */}
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span style={{ color: cfg.solid }}>{SEVERITY_ICONS[indicator.severity]}</span>
          <span
            className="text-sm font-semibold leading-tight"
            style={{ color: '#f0f4ff' }}
          >
            {indicator.name}
          </span>
        </div>

        {/* Badge de severidad */}
        <span
          className="flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            background: cfg.bg,
            border:     `1px solid ${cfg.border}`,
            color:      cfg.solid,
          }}
          aria-label={`Severidad: ${SEVERITY_LABELS[indicator.severity]}`}
        >
          {SEVERITY_LABELS[indicator.severity]}
        </span>
      </div>

      {/* Explicación */}
      <p className="text-xs leading-relaxed pl-6" style={{ color: '#8892a4' }}>
        {indicator.explanation}
      </p>
    </li>
  )
}
