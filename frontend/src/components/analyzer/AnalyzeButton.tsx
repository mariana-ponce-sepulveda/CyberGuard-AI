import { Shield, Loader2 } from 'lucide-react'

interface Props {
  onClick: () => void
  loading?: boolean
  disabled?: boolean
}

export default function AnalyzeButton({ onClick, loading = false, disabled = false }: Props) {
  const isDisabled = disabled || loading

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      aria-label={loading ? 'Analizando contenido, por favor espera' : 'Analizar contenido'}
      className="relative w-full flex items-center justify-center gap-2.5 h-12 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface disabled:cursor-not-allowed"
      style={{
        background: isDisabled
          ? 'rgba(0,212,255,0.15)'
          : 'linear-gradient(135deg, #00d4ff, #3b82f6)',
        color: isDisabled ? 'rgba(240,244,255,0.4)' : '#080d1a',
        fontWeight: 600,
        boxShadow: isDisabled ? 'none' : '0 0 16px rgba(0,212,255,0.20)',
      }}
      onMouseEnter={(e) => {
        if (isDisabled) return
        e.currentTarget.style.boxShadow = '0 0 28px rgba(0,212,255,0.40)'
        e.currentTarget.style.transform = 'scale(1.015)'
      }}
      onMouseLeave={(e) => {
        if (isDisabled) return
        e.currentTarget.style.boxShadow = '0 0 16px rgba(0,212,255,0.20)'
        e.currentTarget.style.transform = 'scale(1)'
      }}
      onMouseDown={(e) => {
        if (isDisabled) return
        e.currentTarget.style.transform = 'scale(0.985)'
      }}
      onMouseUp={(e) => {
        if (isDisabled) return
        e.currentTarget.style.transform = 'scale(1.015)'
      }}
    >
      {loading ? (
        <>
          <Loader2
            className="w-4 h-4 animate-spin flex-shrink-0"
            aria-hidden="true"
          />
          <span>Analizando…</span>
        </>
      ) : (
        <>
          <Shield className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>Analizar</span>
        </>
      )}
    </button>
  )
}
