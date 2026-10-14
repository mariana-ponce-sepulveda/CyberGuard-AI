import type {
  AnalysisRequest,
  AnalysisResult,
  AnalysisIndicator,
  RiskLevel,
} from '../types/index.js'

// ── Definición de reglas ──────────────────────────────────────────────────────

type Weight = 'critical' | 'high' | 'medium' | 'low'

interface HeuristicRule {
  id: string
  name: string
  explanation: string
  weight: Weight
  severity: RiskLevel
  patterns: RegExp[]
}

/** Puntuación por peso — calibrada para alcanzar los tres niveles con claridad */
const WEIGHT_SCORE: Record<Weight, number> = {
  critical: 55,   // una sola señal crítica ya supera el umbral alto
  high:     35,
  medium:   18,
  low:       8,
}

/**
 * Reglas heurísticas para detección de phishing.
 * Clasificación de niveles:
 *   ALTO  (≥ 60): una señal crítica o combinación de señales serias
 *   MEDIO (25-59): una o dos señales de peso medio/alto
 *   BAJO  (< 25): sin señales o solo señales leves
 */
const RULES: HeuristicRule[] = [

  // ── CRÍTICAS — una sola activa RIESGO ALTO ─────────────────────────────────
  {
    id: 'credential_request',
    name: 'Solicitud de contraseña o PIN',
    explanation:
      'El mensaje pide directamente tu contraseña, PIN o clave de acceso. ' +
      'Ninguna entidad legítima solicita estas credenciales por mensaje o correo.',
    weight: 'critical',
    severity: 'alto',
    patterns: [
      /ingrese?\s+(su\s+)?(contrase[ñn]a|clave|pin)\b/i,
      /proporcione?\s+(su\s+)?(contrase[ñn]a|clave|pin)\b/i,
      /verify\s+(your\s+)?password/i,
      /enter\s+(your\s+)?password/i,
      /contrase[ñn]a\s+y\s+pin/i,
      /\bpin\b.{0,30}\bcontrase[ñn]a\b/i,
      // Patrones más amplios para capturar variantes
      /ingrese?.{0,20}\bpin\b/i,
      /proporcione?.{0,20}\bpin\b/i,
      /su\s+contrase[ñn]a\b/i,
      /su\s+clave\s+(de\s+acceso|bancaria|secreta)/i,
    ],
  },
  {
    id: 'fake_domain',
    name: 'Dominio falsificado',
    explanation:
      'La URL usa un nombre muy parecido al de una empresa conocida pero con letras ' +
      'cambiadas o números en lugar de letras. Es una técnica clásica para engañar.',
    weight: 'critical',
    severity: 'alto',
    patterns: [
      /paypa[l1][^a-z]/i,
      /ama[z2]on[^a-z]/i,
      /g[o0]{2}gle(?!\.[a-z]{2,})/i,  // g00gle pero NO google.com, google.es, etc.
      /faceb[o0][o0]k[^a-z]/i,
      /micros[o0]ft[^a-z]/i,
      /app[l1]e[^a-z]/i,
      /netfl[i1]x[^a-z]/i,
      /bancoseguro/i,
      /banco.{0,10}verificaci/i,
      /verificacion.{0,10}banco/i,
      /paypal.{0,5}\.tk\b/i,
      /paypal.{0,5}\.ml\b/i,
      /\.tk\/|\.ml\/|\.ga\/|\.cf\//i,
    ],
  },

  // ── ALTAS — dos o más activan RIESGO ALTO ─────────────────────────────────
  {
    id: 'urgency',
    name: 'Urgencia artificial',
    explanation:
      'El mensaje usa palabras de urgencia extrema para que actúes sin pensar. ' +
      'Los estafadores crean presión temporal para evitar que verifiques la información.',
    weight: 'high',
    severity: 'alto',
    patterns: [
      /urgente/i,
      /inmediatamente/i,
      /suspender[aá]/i,
      /\bsuspendid[ao]\b/i,
      /\bvence\b/i,
      /act[úu]a\s+ahora/i,
      /tiempo\s+limitado/i,
      /[úu]ltima\s+oportunidad/i,
      /24\s*h(oras?)?/i,
      /48\s*h(oras?)?/i,
      /cancelad[ao]\s+definitivamente/i,
      /cierre\s+(permanente|definitivo)/i,
    ],
  },
  {
    id: 'account_threat',
    name: 'Amenaza de bloqueo o cancelación',
    explanation:
      'El mensaje amenaza con bloquear, cancelar o suspender tu cuenta si no actúas. ' +
      'Esta táctica de miedo es característica del phishing.',
    weight: 'high',
    severity: 'alto',
    patterns: [
      /\bbloqueado\b/i,
      /\bcancelad[ao]\b/i,
      /cuenta\s+ser[aá]\s+(cancelada|bloqueada|suspendida|cerrada)/i,
      /perder[aá]s?\s+(el\s+)?acceso/i,
      /acceso\s+(ser[aá]\s+)?revocado/i,
      /acci[oó]n\s+legal/i,
      /\bdemanda\b/i,
    ],
  },

  // ── MEDIAS ─────────────────────────────────────────────────────────────────
  {
    id: 'sensitive_data',
    name: 'Solicitud de datos financieros',
    explanation:
      'El mensaje pide datos de tu cuenta bancaria, tarjeta o información financiera. ' +
      'Los bancos nunca solicitan estos datos por correo o mensaje.',
    weight: 'medium',
    severity: 'medio',
    patterns: [
      /cuenta\s+bancaria/i,
      /n[úu]mero\s+de\s+(cuenta|tarjeta)/i,
      /\bcvv\b/i,
      /c[oó]digo\s+de\s+seguridad/i,
      /datos\s+(bancarios|de\s+su\s+tarjeta)/i,
      /informaci[oó]n\s+(bancaria|financiera)/i,
      /tarjeta\s+de\s+cr[eé]dito/i,
      /tarjeta\s+de\s+d[eé]bito/i,
    ],
  },
  {
    id: 'suspicious_link',
    name: 'Enlace o URL sospechosa',
    explanation:
      'El mensaje contiene un enlace que no parece corresponder a un sitio legítimo ' +
      'o usa servicios de acortamiento que ocultan el destino real.',
    weight: 'high',   // peso alto para que una URL acortada sola alcance nivel MEDIO
    severity: 'medio',
    patterns: [
      /bit\.ly\//i,
      /tinyurl\.com\//i,
      /\bt\.co\//i,
      /ow\.ly\//i,
      /short\.io\//i,
      /rb\.gy\//i,
      /cutt\.ly\//i,
      /http:\/\/[^\s]{0,50}\.(tk|ml|ga|cf|gq)\//i,
      /verificacion-cuenta\./i,
      /secure-login\./i,
      /account-verify\./i,
    ],
  },
  {
    id: 'suspicious_offer',
    name: 'Oferta o premio inesperado',
    explanation:
      'El mensaje promete premios, dinero o regalos de forma inesperada. ' +
      'Si parece demasiado bueno para ser verdad, probablemente es un engaño.',
    weight: 'medium',
    severity: 'medio',
    patterns: [
      /\bganaste\b/i,
      /\bpremio\b/i,
      /\bgratis\b/i,
      /fuiste\s+seleccionado/i,
      /\bmillones?\b/i,
      /hered[ae]/i,
      /oferta\s+exclusiva/i,
      /felicitaciones.{0,30}ganad/i,
      /reward.{0,20}claim/i,
      /you\s+have\s+won/i,
    ],
  },

  // ── BAJAS ──────────────────────────────────────────────────────────────────
  {
    id: 'generic_greeting',
    name: 'Saludo genérico e impersonal',
    explanation:
      'El mensaje usa "Estimado usuario" o similar en lugar de tu nombre. ' +
      'Indica que fue enviado masivamente a muchas personas.',
    weight: 'low',
    severity: 'bajo',
    patterns: [
      /estimado\s+(cliente|usuario|se[ñn]or|miembro)/i,
      /dear\s+(customer|user|member|sir|madam)/i,
      /valued\s+customer/i,
      /dear\s+account\s+holder/i,
      /querido\s+(usuario|cliente)/i,
    ],
  },
  {
    id: 'urgent_click',
    name: 'Llamada urgente a hacer clic',
    explanation:
      'El mensaje te presiona a hacer clic en un enlace de inmediato, ' +
      'sin darte tiempo para verificar si es legítimo.',
    weight: 'low',
    severity: 'bajo',
    patterns: [
      /haz?\s+clic\s+aqu[ií]/i,
      /click\s+here/i,
      /accede\s+ahora/i,
      /ingresa\s+aqu[ií]/i,
      /entra\s+ahora/i,
      /visita\s+este\s+enlace/i,
      /toca\s+aqu[ií]/i,
    ],
  },
]

// ── Textos de resultado por nivel ─────────────────────────────────────────────

const SUMMARIES: Record<RiskLevel, string> = {
  alto:
    'Este contenido presenta señales serias que son comunes en intentos de phishing. ' +
    'Te recomendamos no interactuar con él y verificar su origen por canales oficiales.',
  medio:
    'Este contenido tiene características sospechosas que merecen atención. ' +
    'Procede con cuidado y verifica la legitimidad antes de tomar cualquier acción.',
  bajo:
    'No encontramos señales claras de phishing en este contenido. ' +
    'De todas formas, mantén siempre precaución al interactuar con mensajes desconocidos.',
}

const RECOMMENDATIONS: Record<RiskLevel, string[]> = {
  alto: [
    'No hagas clic en ningún enlace del mensaje.',
    'No proporciones datos personales, contraseñas ni información bancaria.',
    'Contacta directamente a la empresa o institución por su sitio web oficial o teléfono conocido.',
    'Marca el mensaje como spam o phishing en tu cliente de correo.',
    'Si ya proporcionaste datos, cambia tus contraseñas inmediatamente y contacta a tu banco si es necesario.',
  ],
  medio: [
    'Verifica la identidad del remitente antes de responder o hacer clic.',
    'No ingreses datos personales hasta confirmar que el sitio o mensaje es legítimo.',
    'Busca el sitio web oficial de la organización directamente en tu navegador, no desde el enlace del mensaje.',
    'Ante la duda, contacta al soporte oficial de la empresa mencionada.',
  ],
  bajo: [
    'Siempre verifica el remitente antes de responder a mensajes inesperados.',
    'No compartas información personal o financiera por correo o mensajes.',
    'Si algo te parece sospechoso, no dudes en analizarlo de nuevo.',
  ],
}

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Analiza el contenido con reglas heurísticas.
 *
 * Umbrales de nivel de riesgo:
 *   ALTO  ≥ 60 puntos (una señal crítica = 55, dos altas = 70, etc.)
 *   MEDIO ≥ 25 puntos (una señal alta = 35, dos medias = 36, etc.)
 *   BAJO  < 25 puntos
 *
 * NUNCA lanza excepciones — siempre devuelve un AnalysisResult válido.
 */
export function analyzeWithHeuristics(request: AnalysisRequest): AnalysisResult {
  try {
    const text = request.content.toLowerCase()
    const detectedIndicators: AnalysisIndicator[] = []
    let rawScore = 0

    for (const rule of RULES) {
      const matched = rule.patterns.some((pattern) => pattern.test(text))
      if (matched) {
        rawScore += WEIGHT_SCORE[rule.weight]
        detectedIndicators.push({
          id:          rule.id,
          name:        rule.name,
          explanation: rule.explanation,
          severity:    rule.severity,
        })
      }
    }

    // Calcular nivel de riesgo
    let riskLevel: RiskLevel
    let riskScore: number

    if (rawScore >= 50) {
      riskLevel = 'alto'
      // Mapear rawScore ≥ 50 al rango 67–100
      riskScore = Math.min(100, 67 + Math.round((rawScore - 50) / 4))
    } else if (rawScore >= 25) {
      riskLevel = 'medio'
      // Mapear rawScore 25–59 al rango 34–66
      riskScore = 34 + Math.round(((rawScore - 25) / 35) * 32)
    } else {
      riskLevel = 'bajo'
      // Mapear rawScore 0–24 al rango 0–33
      riskScore = rawScore === 0 ? 0 : Math.round((rawScore / 25) * 33)
    }

    riskScore = Math.min(100, Math.max(0, riskScore))

    return {
      riskLevel,
      riskScore,
      summary:         SUMMARIES[riskLevel],
      indicators:      detectedIndicators,
      recommendations: RECOMMENDATIONS[riskLevel],
      analysisType:    request.type,
      analyzedAt:      new Date().toISOString(),
      source:          'heuristic',
    }
  } catch {
    return {
      riskLevel:       'bajo',
      riskScore:       0,
      summary:         'No se pudo completar el análisis. Te recomendamos proceder con precaución.',
      indicators:      [],
      recommendations: RECOMMENDATIONS['bajo'],
      analysisType:    request.type,
      analyzedAt:      new Date().toISOString(),
      source:          'heuristic',
    }
  }
}
