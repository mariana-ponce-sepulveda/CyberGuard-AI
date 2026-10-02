import type { AnalysisResult } from '@/types'

/**
 * Resultados simulados para revisión visual de la Fase 6.
 * NO usar en producción. Se reemplaza por la API real en la Fase 7.
 *
 * ⚠️ Todos los dominios y URLs son completamente ficticios,
 * creados únicamente para demostración segura.
 */

export const MOCK_RESULT_HIGH: AnalysisResult = {
  riskLevel:    'alto',
  riskScore:    88,
  analysisType: 'message',
  source:       'llm',
  analyzedAt:   new Date().toISOString(),
  summary:
    'Este mensaje contiene múltiples señales clásicas de phishing. ' +
    'Te presiona para actuar con urgencia, solicita datos confidenciales ' +
    'y utiliza un enlace que no corresponde a ninguna entidad bancaria legítima.',
  indicators: [
    {
      id:          'urgency',
      name:        'Urgencia artificial',
      explanation: 'El mensaje te dice que tienes solo 24 horas para actuar, lo que te impide pensar con calma y verificar si es real.',
      severity:    'alto',
    },
    {
      id:          'sensitive_data',
      name:        'Solicitud de datos sensibles',
      explanation: 'Te piden tu número de cuenta, contraseña y PIN. Ningún banco legítimo solicita estos datos por correo electrónico.',
      severity:    'alto',
    },
    {
      id:          'fake_domain',
      name:        'Dominio sospechoso',
      explanation: 'El enlace usa un dominio ficticio que intenta parecerse al de un banco real, pero no lo es.',
      severity:    'alto',
    },
    {
      id:          'threat',
      name:        'Amenaza de cancelación',
      explanation: 'El mensaje amenaza con cancelar tu cuenta permanentemente si no actúas, lo que crea pánico para que no pienses bien.',
      severity:    'medio',
    },
    {
      id:          'generic_greeting',
      name:        'Saludo genérico',
      explanation: '"Estimado cliente" en lugar de tu nombre indica que el mensaje se envió masivamente a muchas personas.',
      severity:    'bajo',
    },
  ],
  recommendations: [
    'No hagas clic en ningún enlace del mensaje.',
    'No proporciones tu contraseña, PIN ni datos bancarios por correo.',
    'Contacta a tu banco directamente desde su sitio web oficial o por teléfono.',
    'Marca el mensaje como spam o phishing en tu cliente de correo.',
    'Si ya ingresaste tus datos, cambia tu contraseña de inmediato y llama a tu banco.',
  ],
}

export const MOCK_RESULT_MEDIUM: AnalysisResult = {
  riskLevel:    'medio',
  riskScore:    52,
  analysisType: 'url',
  source:       'heuristic',
  analyzedAt:   new Date().toISOString(),
  summary:
    'Esta URL contiene elementos que merecen atención. ' +
    'El dominio tiene un nombre inusual y utiliza una extensión poco común. ' +
    'No podemos confirmar que sea segura sin más información.',
  indicators: [
    {
      id:          'fake_domain',
      name:        'Nombre de dominio engañoso',
      explanation: 'La URL usa un nombre muy parecido al de un servicio conocido pero con letras cambiadas, lo que es una técnica común de engaño.',
      severity:    'medio',
    },
    {
      id:          'urgent_click',
      name:        'Parámetros de redirección sospechosos',
      explanation: 'La URL contiene parámetros que podrían redirigirte a otro sitio sin que te des cuenta.',
      severity:    'bajo',
    },
  ],
  recommendations: [
    'No hagas clic en este enlace sin verificar primero el sitio web oficial.',
    'Busca el nombre de la organización directamente en tu navegador.',
    'Si necesitas acceder al servicio, escribe la URL oficial manualmente.',
    'Consulta con alguien de confianza si tienes dudas sobre este enlace.',
  ],
}

export const MOCK_RESULT_LOW: AnalysisResult = {
  riskLevel:    'bajo',
  riskScore:    8,
  analysisType: 'message',
  source:       'llm',
  analyzedAt:   new Date().toISOString(),
  summary:
    'No encontramos señales claras de phishing en este mensaje. ' +
    'El contenido parece ser una comunicación normal y no solicita ' +
    'información sensible ni contiene enlaces sospechosos.',
  indicators: [],
  recommendations: [
    'Siempre verifica el remitente antes de responder a mensajes inesperados.',
    'No compartas información personal o financiera por correo o mensajes.',
    'Si algo te parece sospechoso en el futuro, no dudes en analizarlo aquí.',
  ],
}

/** Los tres mocks disponibles para selección en la UI */
export const MOCK_RESULTS: Record<'alto' | 'medio' | 'bajo', AnalysisResult> = {
  alto:  MOCK_RESULT_HIGH,
  medio: MOCK_RESULT_MEDIUM,
  bajo:  MOCK_RESULT_LOW,
}
