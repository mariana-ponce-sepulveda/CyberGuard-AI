import { Link, AlertCircle } from 'lucide-react'
import type { AnalysisType } from '@/types'

interface Props {
  type: AnalysisType
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  hasError?: boolean
}

const PLACEHOLDERS: Record<AnalysisType, string> = {
  message: 'Pega aquí el mensaje o correo sospechoso…\n\nEjemplo: "Estimado cliente, su cuenta ha sido suspendida. Haga clic aquí para verificar sus datos..."',
  url: 'https://ejemplo-sospechoso.com/ruta',
}

const MAX_LENGTHS: Record<AnalysisType, number> = {
  message: 5000,
  url: 2048,
}

export default function InputArea({ type, value, onChange, disabled = false, hasError = false }: Props) {
  const maxLength = MAX_LENGTHS[type]
  const charCount = value.length
  const isNearLimit = charCount > maxLength * 0.85
  const isAtLimit = charCount >= maxLength

  // ── Estilos de borde compartidos ────────────────────────────
  const borderColor = hasError
    ? '#ef4444'
    : 'rgba(26,38,64,1)'  // bg-muted

  const focusStyle = hasError
    ? { outline: 'none', borderColor: '#ef4444', boxShadow: '0 0 0 2px rgba(239,68,68,0.20)' }
    : { outline: 'none', borderColor: '#00d4ff', boxShadow: '0 0 0 2px rgba(0,212,255,0.12)' }

  const baseInputStyle: React.CSSProperties = {
    background: '#121d35',
    border: `1px solid ${borderColor}`,
    color: '#f0f4ff',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
    borderRadius: '0.5rem',
  }

  // ── Textarea (modo mensaje) ──────────────────────────────────
  if (type === 'message') {
    return (
      <div className="space-y-1.5">
        <textarea
          id="input-message"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={PLACEHOLDERS.message}
          aria-label="Contenido a analizar"
          aria-describedby={hasError ? 'input-error' : 'input-hint'}
          aria-invalid={hasError}
          onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = borderColor
            e.currentTarget.style.boxShadow = 'none'
          }}
          style={{
            ...baseInputStyle,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '0.9375rem',
            lineHeight: '1.6',
            padding: '0.75rem',
            minHeight: '160px',
            maxHeight: '320px',
            resize: 'vertical',
            opacity: disabled ? 0.6 : 1,
          }}
        />
        <InputFooter
          charCount={charCount}
          maxLength={maxLength}
          isNearLimit={isNearLimit}
          isAtLimit={isAtLimit}
          hasError={hasError}
        />
      </div>
    )
  }

  // ── Input URL ────────────────────────────────────────────────
  return (
    <div className="space-y-1.5">
      <div className="relative">
        {/* Ícono prefijo */}
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        >
          <Link className="w-4 h-4" style={{ color: '#4a5568' }} />
        </div>

        <input
          id="input-url"
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={PLACEHOLDERS.url}
          aria-label="URL a analizar"
          aria-describedby={hasError ? 'input-error' : 'input-hint'}
          aria-invalid={hasError}
          autoComplete="off"
          spellCheck={false}
          onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = borderColor
            e.currentTarget.style.boxShadow = 'none'
          }}
          style={{
            ...baseInputStyle,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.875rem',
            padding: '0.625rem 0.75rem 0.625rem 2.25rem',
            height: '2.75rem',
            opacity: disabled ? 0.6 : 1,
          }}
        />
      </div>
      <InputFooter
        charCount={charCount}
        maxLength={maxLength}
        isNearLimit={isNearLimit}
        isAtLimit={isAtLimit}
        hasError={hasError}
      />
    </div>
  )
}

// ── Sub-componente: pie del input ────────────────────────────────

interface FooterProps {
  charCount: number
  maxLength: number
  isNearLimit: boolean
  isAtLimit: boolean
  hasError: boolean
}

function InputFooter({ charCount, maxLength, isNearLimit, isAtLimit, hasError }: FooterProps) {
  return (
    <div className="flex items-center justify-between min-h-[1.25rem]">
      {/* Mensaje de error */}
      {hasError && (
        <p
          id="input-error"
          className="flex items-center gap-1 text-xs"
          style={{ color: '#ef4444' }}
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          Por favor ingresa el contenido a analizar.
        </p>
      )}
      {!hasError && (
        <p id="input-hint" className="text-xs" style={{ color: '#4a5568' }}>
          {charCount === 0 ? 'El contenido no puede estar vacío.' : ' '}
        </p>
      )}

      {/* Contador de caracteres */}
      {charCount > 0 && (
        <p
          className="text-xs ml-auto"
          style={{
            color: isAtLimit ? '#ef4444' : isNearLimit ? '#f59e0b' : '#4a5568',
          }}
          aria-live="polite"
          aria-label={`${charCount} de ${maxLength} caracteres`}
        >
          {charCount.toLocaleString('es')} / {maxLength.toLocaleString('es')}
        </p>
      )}
    </div>
  )
}
