import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'
import type { RiskLevel } from '@/types'
import { RISK_COLORS, RISK_LABELS, RISK_SUBTEXTS } from '@/lib/risk-config'

interface Props {
  riskLevel: RiskLevel
  riskScore: number
}

const RISK_ICONS: Record<RiskLevel, React.ReactNode> = {
  bajo:  <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} aria-hidden="true" />,
  medio: <ShieldAlert  className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} aria-hidden="true" />,
  alto:  <ShieldX      className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} aria-hidden="true" />,
}

export default function RiskHeader({ riskLevel, riskScore }: Props) {
  const cfg = RISK_COLORS[riskLevel]

  return (
    <div
      className="px-5 py-5 sm:px-6"
      style={{
        background:  cfg.bg,
        borderTop:   `3px solid ${cfg.solid}`,
      }}
      role="region"
      aria-label={`Nivel de riesgo: ${RISK_LABELS[riskLevel]}`}
    >
      <div className="flex items-center gap-4">
        {/* Ícono */}
        <div style={{ color: cfg.solid }} className="flex-shrink-0">
          {RISK_ICONS[riskLevel]}
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3
              className="text-xl sm:text-2xl font-bold tracking-wide"
              style={{ color: cfg.solid }}
            >
              {RISK_LABELS[riskLevel]}
            </h3>
            {/* Score pill */}
            <span
              className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: cfg.bg,
                border:     `1px solid ${cfg.border}`,
                color:      cfg.solid,
              }}
              aria-label={`Puntaje estimado: ${riskScore} de 100`}
            >
              {riskScore}/100
            </span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: '#8892a4' }}>
            {RISK_SUBTEXTS[riskLevel]}
          </p>
        </div>
      </div>
    </div>
  )
}
