import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, RefreshCw } from 'lucide-react'

import Header         from '@/components/layout/Header'
import Footer         from '@/components/layout/Footer'
import HeroSection    from '@/components/hero/HeroSection'
import AnalyzerCard   from '@/components/analyzer/AnalyzerCard'
import AnalyzingState from '@/components/loading/AnalyzingState'
import ResultCard     from '@/components/results/ResultCard'

import { useAnalyzer } from '@/hooks/useAnalyzer'

export default function App() {
  const {
    content,
    analysisType,
    result,
    loading,
    error,
    setContent,
    setAnalysisType,
    analyze,
    reset,
  } = useAnalyzer()

  // Scroll suave a resultados cuando llega un resultado o error
  useEffect(() => {
    if (result || error) {
      setTimeout(() => {
        document.getElementById('resultados')?.scrollIntoView({
          behavior: 'smooth',
          block:    'start',
        })
      }, 150)
    }
  }, [result, error])

  const handleReset = () => {
    reset()
    document.getElementById('analizador')?.scrollIntoView({
      behavior: 'smooth',
      block:    'start',
    })
  }

  // Estado de la vista: qué mostrar en la sección de resultados
  const showLoading = loading
  const showResult  = !loading && result !== null
  const showError   = !loading && error  !== null && result === null

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">

      {/* ── Header sticky ─────────────────────────────────────── */}
      <Header />

      {/* ── Contenido principal ───────────────────────────────── */}
      <main>

        {/* Sección 1: Hero */}
        <HeroSection />

        {/* Sección 2: Analizador */}
        <section
          id="analizador"
          className="py-16 px-4"
          aria-labelledby="analyzer-heading"
        >
          <h2 id="analyzer-heading" className="sr-only">
            Analizador de contenido sospechoso
          </h2>
          <div className="max-w-2xl mx-auto">
            <AnalyzerCard
              onAnalyze={analyze}
              loading={loading}
              controlled={{
                content,
                analysisType,
                onContentChange:      setContent,
                onAnalysisTypeChange: setAnalysisType,
              }}
            />
          </div>
        </section>

        {/* Sección 3: Carga / Resultado / Error */}
        <section
          id="resultados"
          className="pb-16 px-4"
          aria-label="Resultados del análisis"
        >
          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">

              {/* Estado de carga */}
              {showLoading && <AnalyzingState key="loading" />}

              {/* Resultado exitoso */}
              {showResult && result && (
                <ResultCard key="result" result={result} onReset={handleReset} />
              )}

              {/* Error amigable */}
              {showError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{    opacity: 0, y: 8  }}
                  transition={{ duration: 0.30, ease: 'easeOut' }}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: '#0d1526',
                    border:     '1px solid rgba(239,68,68,0.25)',
                    boxShadow:  '0 4px 24px rgba(0,0,0,0.40)',
                  }}
                  role="alert"
                  aria-live="assertive"
                >
                  {/* Borde superior rojo */}
                  <div
                    className="h-0.5 w-full"
                    style={{ background: '#ef4444' }}
                    aria-hidden="true"
                  />

                  <div className="p-6 space-y-4">
                    {/* Ícono + mensaje */}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}
                      >
                        <AlertTriangle
                          className="w-4 h-4"
                          style={{ color: '#ef4444' }}
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold mb-1" style={{ color: '#f0f4ff' }}>
                          No se pudo completar el análisis
                        </h3>
                        <p className="text-sm leading-relaxed" style={{ color: '#8892a4' }}>
                          {error}
                        </p>
                      </div>
                    </div>

                    {/* Botón reintentar */}
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                      style={{
                        background: 'rgba(239,68,68,0.08)',
                        border:     '1px solid rgba(239,68,68,0.25)',
                        color:      '#ef4444',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.14)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
                      }}
                    >
                      <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                      Intentar de nuevo
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </section>

      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <Footer />
    </div>
  )
}
