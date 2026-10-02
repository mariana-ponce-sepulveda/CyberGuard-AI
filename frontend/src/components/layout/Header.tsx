import { Shield } from 'lucide-react'

/**
 * Header sticky con glassmorphism.
 * Tagline oculta en móvil (< 640px).
 */
export default function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(13, 21, 38, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.10)',
      }}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Marca ─────────────────────────────────────────── */}
          <a
            href="/"
            className="flex items-center gap-3 group"
            aria-label="CyberGuard AI — Inicio"
          >
            {/* Ícono de escudo con resplandor en hover */}
            <div
              className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 group-hover:shadow-glow-cyan"
              style={{ background: 'rgba(0, 212, 255, 0.08)', border: '1px solid rgba(0, 212, 255, 0.20)' }}
            >
              <Shield
                className="w-5 h-5 transition-colors duration-300 group-hover:text-accent-primary"
                style={{ color: '#00d4ff' }}
                strokeWidth={1.5}
                aria-hidden="true"
              />
              {/* Punto de estado — IA activa */}
              <span
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-risk-low"
                aria-hidden="true"
                title="Sistema activo"
              />
            </div>

            {/* Nombre + tagline */}
            <div className="flex flex-col leading-none">
              <span
                className="text-base font-bold tracking-tight"
                style={{ color: '#f0f4ff' }}
              >
                CyberGuard{' '}
                <span style={{ color: '#00d4ff' }}>AI</span>
              </span>
              {/* Tagline visible solo en sm+ */}
              <span
                className="hidden sm:block text-xs mt-0.5 font-normal"
                style={{ color: '#8892a4' }}
              >
                Análisis de phishing con inteligencia artificial
              </span>
            </div>
          </a>

          {/* ── Badge educativo ───────────────────────────────── */}
          <div
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: 'rgba(0, 212, 255, 0.08)',
              border: '1px solid rgba(0, 212, 255, 0.18)',
              color: '#00d4ff',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" aria-hidden="true" />
            Herramienta educativa
          </div>
        </div>
      </div>
    </header>
  )
}
