import { Mail, Link } from 'lucide-react'
import type { AnalysisType } from '@/types'

interface Props {
  value: AnalysisType
  onChange: (type: AnalysisType) => void
  disabled?: boolean
}

interface Tab {
  type: AnalysisType
  label: string
  icon: React.ReactNode
  description: string
}

const TABS: Tab[] = [
  {
    type: 'message',
    label: 'Mensaje / Correo',
    icon: <Mail className="w-4 h-4" aria-hidden="true" />,
    description: 'Analiza un mensaje de texto, correo electrónico o fragmento sospechoso',
  },
  {
    type: 'url',
    label: 'URL',
    icon: <Link className="w-4 h-4" aria-hidden="true" />,
    description: 'Analiza un enlace o dirección web sospechosa',
  },
]

export default function AnalysisTypeSelector({ value, onChange, disabled = false }: Props) {
  return (
    <div role="tablist" aria-label="Tipo de análisis">
      {/* Tabs */}
      <div
        className="flex border-b"
        style={{ borderColor: 'rgba(0,212,255,0.12)' }}
      >
        {TABS.map((tab) => {
          const isActive = tab.type === value
          return (
            <button
              key={tab.type}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.type}`}
              id={`tab-${tab.type}`}
              onClick={() => !disabled && onChange(tab.type)}
              disabled={disabled}
              className="relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded-t-md disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                color: isActive ? '#00d4ff' : '#8892a4',
                background: isActive ? 'rgba(0,212,255,0.06)' : 'transparent',
                borderBottom: isActive ? '2px solid #00d4ff' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              <span
                style={{ color: isActive ? '#00d4ff' : '#8892a4' }}
                className="transition-colors duration-200"
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Descripción del tab activo — ayuda contextual */}
      <div className="pt-3 pb-1" aria-live="polite">
        {TABS.map((tab) =>
          tab.type === value ? (
            <p
              key={tab.type}
              id={`tabpanel-${tab.type}`}
              role="tabpanel"
              aria-labelledby={`tab-${tab.type}`}
              className="text-xs"
              style={{ color: '#4a5568' }}
            >
              {tab.description}
            </p>
          ) : null
        )}
      </div>
    </div>
  )
}
