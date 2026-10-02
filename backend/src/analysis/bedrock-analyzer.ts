import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'
import type { AnalysisRequest, AnalysisResult } from '../types/index.js'
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts.js'
import { parseBedrockResponse } from '../schemas/analysis-result.js'

// ── Configuración ────────────────────────────────────────────────────────────

/**
 * IMPORTANTE: El model ID se lee SIEMPRE desde variable de entorno.
 * Nunca hardcodear un model ID específico en el código.
 *
 * Confirmar disponibilidad del modelo en la consola de Amazon Bedrock
 * (Model access) antes de desplegar. No todos los modelos están disponibles
 * en todas las regiones o cuentas.
 *
 * Modelos compatibles (familia Anthropic — mismo formato de payload):
 *   anthropic.claude-3-haiku-20240307-v1:0   ← recomendado
 *   anthropic.claude-3-sonnet-20240229-v1:0
 *
 * Si se usa Amazon Titan u otro proveedor, el formato del payload difiere.
 * Revisar la documentación del modelo seleccionado y actualizar buildPayload().
 */
const MODEL_ID = process.env.BEDROCK_MODEL_ID
const AWS_REGION = process.env.AWS_REGION ?? 'us-east-1'

/** Timeout interno para la llamada a Bedrock: 20 segundos */
const BEDROCK_TIMEOUT_MS = 20_000

// ── Cliente Bedrock ───────────────────────────────────────────────────────────

// El cliente se inicializa una vez fuera del handler (warm reuse en Lambda)
let _client: BedrockRuntimeClient | null = null

function getClient(): BedrockRuntimeClient {
  if (!_client) {
    _client = new BedrockRuntimeClient({ region: AWS_REGION })
  }
  return _client
}

// ── Payload ───────────────────────────────────────────────────────────────────

/**
 * Construye el payload para la Messages API de Anthropic en Bedrock.
 * Si se cambia a un modelo no-Anthropic, actualizar este objeto.
 */
function buildPayload(content: string, type: AnalysisRequest['type']): string {
  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1024,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(content, type),
      },
    ],
  }
  return JSON.stringify(payload)
}

// ── Analizador principal ──────────────────────────────────────────────────────

/**
 * Analiza el contenido usando Amazon Bedrock.
 *
 * Implementa un timeout de 20 segundos mediante Promise.race + AbortController.
 * Si Bedrock no responde en ese tiempo (o lanza cualquier error), esta función
 * lanza una excepción que el handler captura para activar el fallback heurístico.
 *
 * @throws Error si Bedrock no responde en 20s, devuelve respuesta inválida,
 *               BEDROCK_MODEL_ID no está configurado, o cualquier error de red/API.
 */
export async function analyzeWithBedrock(
  request: AnalysisRequest
): Promise<AnalysisResult> {
  if (!MODEL_ID) {
    throw new Error(
      'BEDROCK_MODEL_ID no está configurado. ' +
      'Configurar la variable de entorno en Lambda con el model ID ' +
      'confirmado disponible en la región de despliegue.'
    )
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Bedrock timeout: no respondió en ${BEDROCK_TIMEOUT_MS}ms`))
  }, BEDROCK_TIMEOUT_MS)

  try {
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: buildPayload(request.content, request.type),
    })

    // Promise.race entre la llamada real y un timeout explícito
    const response = await Promise.race([
      getClient().send(command, { abortSignal: controller.signal }),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(
            new Error(`Bedrock no respondió en ${BEDROCK_TIMEOUT_MS / 1000} segundos.`)
          )
        })
      }),
    ])

    // Decodificar el body de la respuesta
    const responseBody = new TextDecoder().decode(response.body)
    const responseJson = JSON.parse(responseBody) as {
      content?: Array<{ type: string; text: string }>
    }

    // Extraer el texto generado por el modelo
    const textContent = responseJson.content?.find((c) => c.type === 'text')
    if (!textContent?.text) {
      throw new Error('Bedrock devolvió una respuesta sin contenido de texto.')
    }

    return parseBedrockResponse(textContent.text, request.type)
  } finally {
    clearTimeout(timeoutId)
  }
}
