import type { DemoExample } from '@/types'

/**
 * Ejemplos predefinidos para Demo Day.
 *
 * ⚠️ AVISO DE SEGURIDAD: Todos los dominios, URLs y direcciones de correo
 * utilizados aquí son COMPLETAMENTE FICTICIOS y creados únicamente para
 * demostración segura. No existen como sitios reales, no deben visitarse,
 * y no deben utilizarse fuera del contexto educativo de esta aplicación.
 * Nunca usar dominios realmente maliciosos ni URLs de phishing activas.
 */
export const DEMO_EXAMPLES: DemoExample[] = [
  {
    id: 'phishing-bank',
    label: '🔴 Correo bancario falso',
    type: 'message',
    expectedRisk: 'alto',
    // Dominio ficticio creado solo para demostración. No existe ni debe visitarse.
    content: `De: soporte@bancoseguro-alertas.com
Asunto: URGENTE: Su cuenta ha sido suspendida

Estimado cliente,

Hemos detectado actividad inusual en su cuenta. Su acceso ha sido SUSPENDIDO por seguridad.

Para reactivarlo INMEDIATAMENTE y evitar el cierre permanente, verifique sus datos:
http://bancoseguro-verificacion.tk/reactivar?token=ABC123

Deberá ingresar su número de cuenta, contraseña y PIN.
Tiene 24 HORAS o su cuenta será CANCELADA definitivamente.

Departamento de Seguridad — Banco Seguro S.A.`,
  },
  {
    id: 'suspicious-url',
    label: '🟡 URL sospechosa',
    type: 'url',
    expectedRisk: 'medio',
    // URL ficticia creada solo para demostración. No existe ni debe visitarse.
    content: 'http://paypa1-secure-login.verificacion-cuenta.tk/signin',
  },
  {
    id: 'safe-message',
    label: '🟢 Mensaje legítimo',
    type: 'message',
    expectedRisk: 'bajo',
    content: `Hola,

Te recuerdo que mañana tenemos reunión de equipo a las 10:00 AM en la sala del tercer piso.

Si no puedes asistir, avísame para coordinar con el equipo.

¡Nos vemos mañana!
María`,
  },
]
