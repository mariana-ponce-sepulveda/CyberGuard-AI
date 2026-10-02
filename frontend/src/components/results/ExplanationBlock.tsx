import { MessageSquare } from 'lucide-react'

interface Props {
  summary: string
}

export default function ExplanationBlock({ summary }: Props) {
  return (
    <div className="px-5 sm:px-6">
      {/* Título de sección */}
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare
          className="w-4 h-4 flex-shrink-0"
          style={{ color: '#00d4ff' }}
          aria-hidden="true"
        />
        <h4 className="text-sm font-semibold" style={{ color: '#f0f4ff' }}>
          ¿Qué encontramos?
        </h4>
      </div>

      {/* Bloque de texto con borde izquierdo cian */}
      <div
        className="rounded-r-md px-4 py-3"
        style={{
          borderLeft:  '3px solid #00d4ff',
          background:  'rgba(0,212,255,0.04)',
        }}
      >
        <p
          className="text-sm leading-relaxed"
          style={{ color: '#8892a4' }}
        >
          {summary}
        </p>
      </div>
    </div>
  )
}
