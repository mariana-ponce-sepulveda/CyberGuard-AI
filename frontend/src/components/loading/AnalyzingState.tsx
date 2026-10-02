import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

export default function AnalyzingState() {
  return (
    <motion.div
      key="analyzing-state"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{    opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl overflow-hidden py-12 px-6 text-center"
      style={{
        background: '#0d1526',
        border:     '1px solid rgba(26,38,64,1)',
        boxShadow:  '0 4px 24px rgba(0,0,0,0.40)',
      }}
      role="status"
      aria-live="polite"
      aria-label="Analizando el contenido, por favor espera"
    >
      {/* Ícono con pulso */}
      <div className="flex justify-center mb-5">
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(0,212,255,0.08)',
            border:     '1px solid rgba(0,212,255,0.20)',
          }}
        >
          <Shield
            className="w-8 h-8"
            style={{ color: '#00d4ff' }}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </motion.div>
      </div>

      {/* Texto */}
      <p className="text-base font-medium mb-1" style={{ color: '#f0f4ff' }}>
        Analizando el contenido…
      </p>
      <p className="text-sm mb-6" style={{ color: '#4a5568' }}>
        Identificando señales de riesgo
      </p>

      {/* Barra de progreso indeterminada */}
      <div
        className="mx-auto h-1 rounded-full overflow-hidden"
        style={{
          maxWidth:   '240px',
          background: 'rgba(26,38,64,1)',
        }}
        aria-hidden="true"
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
            width:      '50%',
          }}
          animate={{ x: ['-100%', '300%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  )
}
