import { Info } from 'lucide-react'

export default function EducationalWarning() {
  return (
    <div
      className="mx-5 sm:mx-6 rounded-lg px-4 py-3 flex gap-3"
      style={{
        background: 'rgba(74,85,104,0.12)',
        border:     '1px solid rgba(74,85,104,0.25)',
      }}
      role="note"
      aria-label="Advertencia educativa"
    >
      <Info
        className="w-4 h-4 mt-0.5 flex-shrink-0"
        style={{ color: '#4a5568' }}
        aria-hidden="true"
      />
      <p className="text-xs leading-relaxed" style={{ color: '#4a5568' }}>
        <strong style={{ color: '#8892a4', fontWeight: 500 }}>
          Análisis orientativo.
        </strong>{' '}
        Este resultado es educativo y no garantiza que el contenido sea
        completamente seguro o malicioso. Las herramientas automatizadas
        pueden cometer errores. Ante cualquier duda, consulta con un experto
        en seguridad o contacta directamente a la organización involucrada.
      </p>
    </div>
  )
}
