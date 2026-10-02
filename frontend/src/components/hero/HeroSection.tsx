import { ChevronDown, Brain, GraduationCap, Globe } from 'lucide-react'

interface StatChip {
  icon: React.ReactNode
  label: string
}

const CHIPS: StatChip[] = [
  {
    icon: <Brain className="w-3.5 h-3.5" aria-hidden="true" />,
    label: 'Análisis con IA',
  },
  {
    icon: <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />,
    label: '100% Educativo',
  },
  {
    icon: <Globe className="w-3.5 h-3.5" aria-hidden="true" />,
    label: 'En Español',
  },
]

export default function HeroSection() {
  const handleScrollToAnalyzer = () => {
    const el = document.getElementById('analizador')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section
      className="relative min-h-[92vh] flex flex-col items-center justify-center pt-16 pb-12 px-4 overflow-hidden"
      aria-label="Presentación de CyberGuard AI"
    >
      {/* ── Fondo: grid tecnológico ───────────────────────────── */}
      <div
        className="absolute inset-0 bg-tech-grid"
        aria-hidden="true"
      />

      {/* ── Resplandor central difuso ─────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 40%, rgba(0,212,255,0.07) 0%, transparent 70%)',
        }}
      />

      {/* ── Contenido ─────────────────────────────────────────── */}
      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">

        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(0, 212, 255, 0.08)',
            border: '1px solid rgba(0, 212, 255, 0.20)',
            color: '#00d4ff',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" aria-hidden="true" />
          Herramienta educativa de ciberseguridad
        </div>

        {/* Headline principal */}
        <div className="space-y-4">
          <h1
            className="font-bold leading-tight tracking-tight"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              color: '#f0f4ff',
            }}
          >
            Detecta amenazas digitales{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00d4ff, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              antes de que sea tarde
            </span>
          </h1>

          {/* Subtítulo */}
          <p
            className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto"
            style={{ color: '#8892a4' }}
          >
            Pega un mensaje, correo o URL sospechosa y CyberGuard AI
            analizará el contenido para ayudarte a identificar posibles
            intentos de phishing, explicándolo en lenguaje sencillo.
          </p>
        </div>

        {/* Stat chips */}
        <div
          className="flex flex-wrap justify-center gap-2 sm:gap-3"
          role="list"
          aria-label="Características principales"
        >
          {CHIPS.map((chip) => (
            <div
              key={chip.label}
              role="listitem"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(13, 21, 38, 0.80)',
                border: '1px solid rgba(0, 212, 255, 0.15)',
                color: '#8892a4',
              }}
            >
              <span style={{ color: '#00d4ff' }}>{chip.icon}</span>
              {chip.label}
            </div>
          ))}
        </div>

        {/* CTA — scroll al analizador */}
        <div className="pt-2">
          <button
            onClick={handleScrollToAnalyzer}
            className="inline-flex flex-col items-center gap-1 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded-lg p-2"
            aria-label="Ir al analizador"
          >
            <span
              className="text-sm font-medium transition-colors duration-200 group-hover:text-accent-primary"
              style={{ color: '#8892a4' }}
            >
              Comenzar análisis
            </span>
            <ChevronDown
              className="w-5 h-5 animate-bounce transition-colors duration-200 group-hover:text-accent-primary"
              style={{ color: '#8892a4' }}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* ── Línea divisoria degradada ─────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(0,212,255,0.20), transparent)',
        }}
      />
    </section>
  )
}
