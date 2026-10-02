import { Shield, AlertTriangle } from 'lucide-react'

const VERSION = '0.1.0-mvp'

export default function Footer() {
  return (
    <footer
      className="mt-16 border-t"
      style={{ borderColor: 'rgba(0, 212, 255, 0.08)' }}
      aria-label="Pie de página"
    >
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* ── Aviso educativo ───────────────────────────────────── */}
        <div
          className="flex gap-3 p-4 rounded-lg mb-8"
          style={{
            background: 'rgba(245, 158, 11, 0.06)',
            border: '1px solid rgba(245, 158, 11, 0.15)',
          }}
          role="note"
          aria-label="Aviso educativo importante"
        >
          <AlertTriangle
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            style={{ color: '#f59e0b' }}
            aria-hidden="true"
          />
          <p className="text-xs leading-relaxed" style={{ color: '#8892a4' }}>
            <strong style={{ color: '#f0f4ff', fontWeight: 600 }}>
              Herramienta exclusivamente educativa.
            </strong>{' '}
            CyberGuard AI no garantiza que un mensaje o URL sea completamente
            seguro o malicioso. El análisis automatizado es un apoyo orientativo,
            no un diagnóstico profesional. Ante cualquier duda, consulta con un
            experto en seguridad.
          </p>
        </div>

        {/* ── Info inferior ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Marca compacta */}
          <div className="flex items-center gap-2">
            <Shield
              className="w-4 h-4"
              style={{ color: '#00d4ff' }}
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span className="text-sm font-semibold" style={{ color: '#f0f4ff' }}>
              CyberGuard <span style={{ color: '#00d4ff' }}>AI</span>
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded font-mono"
              style={{
                background: 'rgba(0, 212, 255, 0.08)',
                color: '#8892a4',
                border: '1px solid rgba(0, 212, 255, 0.12)',
              }}
            >
              v{VERSION}
            </span>
          </div>

          {/* Crédito AWS */}
          <p className="text-xs text-center sm:text-right" style={{ color: '#4a5568' }}>
            Análisis de IA mediante{' '}
            <span style={{ color: '#8892a4' }}>Amazon Bedrock</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
