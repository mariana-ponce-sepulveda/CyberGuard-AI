import { useEffect, useRef, useState } from 'react'
import type { RiskLevel } from '@/types'
import { RISK_COLORS } from '@/lib/risk-config'

interface Props {
  riskScore: number   // 0–100
  riskLevel: RiskLevel
}

export default function RiskMeter({ riskScore, riskLevel }: Props) {
  const cfg = RISK_COLORS[riskLevel]

  // Animación: arranca en 0 y llega al score real en ~600ms
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const DURATION = 600 // ms — respeta prefers-reduced-motion

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (prefersReduced) {
      setDisplayed(riskScore)
      return
    }

    startRef.current = null
    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(elapsed / DURATION, 1)
      // ease-out cuadrático
      const eased = 1 - (1 - progress) * (1 - progress)
      setDisplayed(Math.round(eased * riskScore))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [riskScore, prefersReduced])

  const pct = Math.min(100, Math.max(0, displayed))

  return (
    <div className="px-5 sm:px-6 py-4 space-y-2">
      {/* Etiqueta + valor numérico */}
      <div className="flex items-center justify-between text-xs" style={{ color: '#8892a4' }}>
        <span className="font-medium" style={{ color: '#f0f4ff' }}>
          Puntaje de riesgo estimado
        </span>
        <span
          className="font-mono font-semibold"
          style={{ color: cfg.solid }}
          aria-live="polite"
          aria-label={`${displayed} de 100`}
        >
          {displayed}
        </span>
      </div>

      {/* Barra de progreso */}
      <div
        className="relative h-2.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(26,38,64,1)' }}
        role="progressbar"
        aria-valuenow={riskScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Nivel de riesgo: ${riskScore} de 100`}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-none"
          style={{
            width:      `${pct}%`,
            background: cfg.solid,
            boxShadow:  `0 0 8px ${cfg.glow}`,
          }}
        />
      </div>

      {/* Labels de referencia */}
      <div className="flex justify-between text-xs" style={{ color: '#4a5568' }}>
        <span>Bajo</span>
        <span>Medio</span>
        <span>Alto</span>
      </div>
    </div>
  )
}
