import type {
  AnalysisRequest,
  AnalysisResult,
  AnalysisIndicator,
  RiskLevel,
} from '../types/index.js'

// ── Definición de reglas ──────────────────────────────────────────────────────

type Weight = 'high' | 'medium' | 'low'

interface HeuristicRule {
  id: string
  name: string
  explanation: string
  weight: Weight
  severity: RiskLevel
  patterns: RegExp[]
}

/** Puntuación por peso */
const WEIGHT_SCORE: Record<Weight, number> = {
  high:   40,
  medium: 20,
  low:    10,
}

/**
 * Las 8 reglas heurísticas definidas en design.md.
 * Búsqueda case-insensitive en todo el contenido.
 */
const RULES: HeuristicRule[] = [
  {
    id: 'urgency',
    name: 'Urgencia artificial',
    explanation:
      'El mensaje utiliza palabras de urgencia para presionarte a actuar rápido, sin darte tiempo a pensar con calma.',
    weight: 'high',
    severity: 'alto',
    patterns: [
      /urgente/i,
      /inmediatamente/i,
      /suspender[aá]/i,
      /\bvence\b/i,
      /act[úu]a\s+ahora/i,
      /tiempo\s+limitado/i,
      /[úu]ltima\s+oportunidad/i,
    ],
  },
  {
    id: 'sensitive_data',
    name: 'Solicitud de datos sensibles',
    explanation:
      'El mensaje te pide información personal o financiera confidencial, como contraseñas, PINs o datos de tarjetas.',
    weight: 'high',
    severity: 'alto',
    patterns: [
      /contrase[ñn]a/i,
      /\bclave\b/i,
      /\bpin\b/i,
      /cuenta\s+bancaria/i,
      /n[úu]mero\s+de\s+tarjeta/i,
      /\bcvv\b/i,
      /datos\s+(bancarios|personales|de\s+acceso)/i,
      /verificar?\s+(sus?\s+)?(datos|identidad|cuenta)/i,
    ],
  },
  {
    id: 'threat',
    name: 'Amenaza o consecuencia negativa',
    explanation:
      'El mensaje amenaza con consecuencias graves (bloqueo, cancelación, acciones legales) si no actúas de inmediato.',
    weight: 'medium',
    severity: 'medio',
    patterns: [
      /bloqueado/i,
      /cancelad[ao]/i,
      /\bsuspendid[ao]\b/i,
      /\bdemanda\b/i,
      /acci[oó]n\s+legal/i,
      /cierre\s+(permanente|definitivo)/i,
      /perder[aá]s?\s+(el\s+)?acceso/i,
    ],
  },
  {
    id: 'suspicious_offer',
    name: 'Oferta sospechosa',
    explanation:
      'El mensaje promete premios, dinero o regalos de forma inesperada, algo que suele ser una trampa.',
    weight: 'medium',
    severity: 'medio',
    patterns: [
      /ganaste/i,
      /\bpremio\b/i,
      /\bgratis\b/i,
      /fuiste\s+seleccionado/i,
      /\bmillones\b/i,
      /hered[ae]/i,
      /oferta\s+exclusiva/i,
      /felicitaciones.{0,30}ganad/i,
    ],
  },
  {
    id: 'shortened_url',
    name: 'URL acortada',
    explanation:
      'El mensaje contiene un enlace acortado que oculta el destino real. Los estafadores los usan para esconder sitios maliciosos.',
    weight: 'medium',
    severity: 'medio',
    patterns: [
      /bit\.ly\//i,
      /tinyurl\.com\//i,
      /\bt\.co\//i,
      /ow\.ly\//i,
      /goo\.gl\//i,
      /short\.io\//i,
      /rb\.gy\//i,
      /cutt\.ly\//i,
    ],
  },
  {
    id: 'fake_domain',
    name: 'Dominio falsificado',
    explanation:
      'La URL contiene un nombre muy parecido al de una empresa conocida pero con letras cambiadas, lo que es una señal clara de engaño.',
    weight: 'high',
    severity: 'alto',
    patterns: [
      /paypa[l1][^a-z]/i,
      /ama[z2]on[^a-z]/i,
      /g[o0][o0]gle[^a-z]/i,
      /faceb[o0][o0]k[^a-z]/i,
      /micros[o0]ft[^a-z]/i,
      /app[l1]e[^a-z]/i,
      /[^\w]arnazon[^a-z]/i,
      /netfl[i1]x[^a-z]/i,
    ],
  },
  {
    id: 'generic_greeting',
    name: 'Saludo genérico',
    explanation:
      'El mensaje usa un saludo impersonal como "Estimado usuario" en lugar de tu nombre, lo que indica que fue enviado masivamente.',
    weight: 'low',
    severity: 'bajo',
    patterns: [
      /estimado\s+(cliente|usuario|se[ñn]or|miembro)/i,
      /dear\s+(customer|user|member|sir|madam)/i,
      /valued\s+customer/i,
      /dear\s+account\s+holder/i,
    ],
  },
  {
    id: 'urgent_click',
    name: 'Llamada urgente a hacer clic',
    explanation:
      'El mensaje te presiona a hacer clic en un enlace de inmediato, sin darte tiempo a verificar si es legítimo.',
    weight: 'low',
    severity: 'bajo',
    patterns: [
      /haz?\s+clic\s+aqu[ií]/i,
      /click\s+here/i,
      /accede\s+ahora/i,
      /ingresa\s+aqu[ií]/i,
      /entra\s+ahora/i,
      /visita\s+este\s+enlace/i,
    ],
  },
]

// ── Textos predefinidos por nivel de riesgo ───────────────────────────────────

const SUMMARIES: Record<RiskLevel, string> = {
  alto:
    'Este contenido presenta varias señales serias que son comunes en intentos de phishing. ' +
    'Te recomendamos no interactuar con él y verificar su origen por canales oficiales.',
  medio:
    'Este contenido tiene algunas características sospechosas que merecen atención. ' +
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
    'Si algo te parece sospechoso, consulta directamente con la organización involucrada.',
  ],
}

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Analiza el contenido usando reglas heurísticas predefinidas.
 *
 * Esta función es el fallback cuando Bedrock no está disponible.
 * NUNCA lanza excepciones — siempre devuelve un AnalysisResult válido.
 * En el caso completamente improbable de un error interno, devuelve
 * un resultado conservador de riesgo bajo con un indicador de error.
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

    // Normalizar el score a 0–100
    // Score máximo teórico: sum(WEIGHT_SCORE) × reglas = 40×3 + 20×3 + 10×2 = 200
    const MAX_RAW_SCORE = 200
    const riskScore = Math.min(100, Math.round((rawScore / MAX_RAW_SCORE) * 100))

    // Calcular nivel de riesgo según umbrales del design.md
    let riskLevel: RiskLevel
    if (riskScore <= 33) {
      riskLevel = 'bajo'
    } else if (riskScore <= 66) {
      riskLevel = 'medio'
    } else {
      riskLevel = 'alto'
    }

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
    // Caso excepcional: error interno en el propio analizador heurístico.
    // Devolver resultado conservador en lugar de propagar el error.
    return {
      riskLevel:    'bajo',
      riskScore:    0,
      summary:      'No se pudo completar el análisis automático. Te recomendamos proceder con precaución.',
      indicators:   [],
      recommendations: RECOMMENDATIONS['bajo'],
      analysisType: request.type,
      analyzedAt:   new Date().toISOString(),
      source:       'heuristic',
    }
  }
}
