import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Search } from 'lucide-react'
import type { AnalysisIndicator } from '@/types'
import IndicatorItem from './IndicatorItem'

interface Props {
  indicators: AnalysisIndicator[]
}

export default function IndicatorList({ indicators }: Props) {
  return (
    <div className="px-5 sm:px-6">
      {/* Título de sección */}
      <div className="flex items-center gap-2 mb-3">
        <Search
          className="w-4 h-4 flex-shrink-0"
          style={{ color: '#00d4ff' }}
          aria-hidden="true"
        />
        <h4 className="text-sm font-semibold" style={{ color: '#f0f4ff' }}>
          Señales detectadas
          {indicators.length > 0 && (
            <span
              className="ml-2 text-xs font-mono px-1.5 py-0.5 rounded"
              style={{
                background: 'rgba(0,212,255,0.08)',
                color:      '#00d4ff',
                border:     '1px solid rgba(0,212,255,0.15)',
              }}
            >
              {indicators.length}
            </span>
          )}
        </h4>
      </div>

      {/* Estado vacío: ninguna señal encontrada */}
      {indicators.length === 0 && (
        <div
          className="flex items-center gap-3 rounded-lg px-4 py-3"
          style={{
            background: 'rgba(34,197,94,0.06)',
            border:     '1px solid rgba(34,197,94,0.20)',
          }}
          role="status"
          aria-live="polite"
        >
          <ShieldCheck
            className="w-5 h-5 flex-shrink-0"
            style={{ color: '#22c55e' }}
            aria-hidden="true"
          />
          <p className="text-sm" style={{ color: '#22c55e' }}>
            No encontramos señales de riesgo en este contenido.
          </p>
        </div>
      )}

      {/* Lista con stagger animation */}
      <AnimatePresence>
        {indicators.length > 0 && (
          <ul className="space-y-2.5" aria-label="Lista de señales detectadas">
            {indicators.map((indicator, index) => (
              <motion.div
                key={indicator.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay:    index * 0.08,   // 80ms de stagger entre ítems
                  ease:     'easeOut',
                }}
              >
                <IndicatorItem indicator={indicator} />
              </motion.div>
            ))}
          </ul>
        )}
      </AnimatePresence>
    </div>
  )
}
