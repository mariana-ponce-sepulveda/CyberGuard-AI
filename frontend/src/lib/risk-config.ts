import type { RiskLevel } from '@/types'

export interface RiskColors {
  solid: string      // color sólido del nivel
  bg: string         // fondo tenue
  border: string     // borde sutil
  glow: string       // sombra glow
}

export const RISK_COLORS: Record<RiskLevel, RiskColors> = {
  bajo: {
    solid:  '#22c55e',
    bg:     'rgba(34,197,94,0.10)',
    border: 'rgba(34,197,94,0.25)',
    glow:   'rgba(34,197,94,0.20)',
  },
  medio: {
    solid:  '#f59e0b',
    bg:     'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.25)',
    glow:   'rgba(245,158,11,0.20)',
  },
  alto: {
    solid:  '#ef4444',
    bg:     'rgba(239,68,68,0.10)',
    border: 'rgba(239,68,68,0.25)',
    glow:   'rgba(239,68,68,0.20)',
  },
}

export const RISK_LABELS: Record<RiskLevel, string> = {
  bajo:  'RIESGO BAJO',
  medio: 'RIESGO MEDIO',
  alto:  'RIESGO ALTO',
}

export const RISK_SUBTEXTS: Record<RiskLevel, string> = {
  bajo:  'No se encontraron señales claras de phishing.',
  medio: 'Se detectaron algunas señales sospechosas. Procede con precaución.',
  alto:  'Este contenido presenta señales serias de phishing.',
}
