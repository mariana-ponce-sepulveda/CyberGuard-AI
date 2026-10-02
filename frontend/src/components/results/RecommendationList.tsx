import { Shield, CheckCircle2 } from 'lucide-react'

interface Props {
  recommendations: string[]
}

export default function RecommendationList({ recommendations }: Props) {
  if (recommendations.length === 0) return null

  return (
    <div className="px-5 sm:px-6">
      {/* Título de sección */}
      <div className="flex items-center gap-2 mb-3">
        <Shield
          className="w-4 h-4 flex-shrink-0"
          style={{ color: '#00d4ff' }}
          aria-hidden="true"
        />
        <h4 className="text-sm font-semibold" style={{ color: '#f0f4ff' }}>
          Qué debes hacer
        </h4>
      </div>

      {/* Lista de recomendaciones */}
      <ul
        className="space-y-2"
        aria-label="Recomendaciones de seguridad"
      >
        {recommendations.map((rec, index) => (
          <li
            key={index}
            className="flex items-start gap-3 rounded-lg px-3 py-2.5"
            style={{
              background: 'rgba(0,212,255,0.03)',
              border:     '1px solid rgba(26,38,64,1)',
            }}
          >
            <CheckCircle2
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              style={{ color: '#22c55e' }}
              aria-hidden="true"
            />
            <span className="text-sm leading-relaxed" style={{ color: '#8892a4' }}>
              {rec}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
