# CyberGuard AI — Requirements

## Descripción general

CyberGuard AI es una aplicación web educativa de ciberseguridad orientada a personas con pocos conocimientos técnicos. Permite al usuario analizar contenido sospechoso (mensajes, correos electrónicos y URLs) para identificar posibles indicadores de phishing y otros riesgos digitales, recibiendo explicaciones claras y recomendaciones de seguridad en lenguaje sencillo.

El objetivo principal es **educativo y defensivo**: ayudar a las personas a reconocer amenazas digitales y aprender buenas prácticas de seguridad, no realizar análisis forense ni operaciones ofensivas.

---

## Requisitos funcionales

### RF-01 — Entrada de contenido sospechoso

- El usuario puede ingresar o pegar texto libre (mensaje, correo electrónico o fragmento de texto sospechoso).
- El usuario puede ingresar una URL sospechosa.
- La interfaz permite seleccionar el tipo de análisis: **Mensaje / Correo** o **URL**.
- El campo de entrada acepta texto de hasta 5 000 caracteres para mensajes y hasta 2 048 caracteres para URLs.
- El campo valida que el contenido no esté vacío antes de permitir el análisis.

### RF-02 — Análisis de contenido

- Al presionar el botón "Analizar", la aplicación procesa el contenido ingresado.
- El análisis detecta indicadores de phishing asociados a los patrones más comunes:
  - Urgencia o presión temporal ("actúa ahora", "tu cuenta será suspendida").
  - Solicitud de información sensible (contraseñas, datos bancarios, documentos).
  - Remitente o dominio sospechoso o mal escrito.
  - URLs acortadas, dominios con errores tipográficos o subdominios engañosos.
  - Amenazas o consecuencias negativas para presionar al usuario.
  - Ofertas demasiado buenas para ser verdad.
  - Lenguaje genérico o impersonal ("Estimado usuario").
  - Solicitudes de hacer clic en un enlace externo urgente.
- El análisis es realizado por un modelo de lenguaje (LLM) mediante un prompt estructurado que evalúa el contenido y devuelve un resultado en formato JSON.
- El sistema incluye un mecanismo de análisis de respaldo (fallback) basado en reglas heurísticas en caso de que la llamada al LLM falle.

### RF-03 — Resultado del análisis

El resultado presentado al usuario debe contener obligatoriamente:

1. **Nivel de riesgo:** Bajo, Medio o Alto, con color diferenciado (verde, amarillo, rojo).
2. **Indicadores detectados:** Lista de señales encontradas, cada una con:
   - Nombre del indicador.
   - Explicación breve en lenguaje sencillo de por qué representa un riesgo.
3. **Resumen explicativo:** Párrafo corto que explique en lenguaje no técnico por qué el contenido analizado podría ser riesgoso.
4. **Recomendaciones de seguridad:** Lista de acciones concretas que el usuario debería tomar.
5. **Advertencia educativa:** Mensaje fijo que indique que el análisis es orientativo y no garantiza que el contenido sea completamente seguro o inseguro.

### RF-04 — Indicador de progreso durante el análisis

- Mientras se procesa el análisis, se muestra un indicador visual de carga (spinner o animación) con un mensaje como "Analizando contenido…".
- El botón "Analizar" se deshabilita durante el proceso para evitar envíos múltiples.

### RF-05 — Nuevo análisis

- El usuario puede borrar el contenido ingresado y los resultados para iniciar un análisis nuevo.
- Existe un botón o enlace visible para "Analizar otro contenido" o "Nuevo análisis".

### RF-06 — Ejemplos de demostración

- La aplicación incluye al menos tres ejemplos predefinidos que el usuario puede cargar con un clic para fines de demostración.
- Los ejemplos deben cubrir: un mensaje de phishing de nivel alto, una URL sospechosa de nivel medio, y un mensaje legítimo de nivel bajo.
- Los ejemplos están diseñados exclusivamente con contenido de prueba seguro.

### RF-07 — Sección informativa / Acerca de

- La página principal incluye una sección breve que explica qué es CyberGuard AI y su propósito educativo.
- Incluye una nota sobre las limitaciones del análisis automatizado.

---

## Requisitos no funcionales

### RNF-01 — Idioma

- Toda la interfaz, mensajes, resultados y textos de la aplicación deben estar en **español**.
- Los términos técnicos de ciberseguridad que sean necesarios deben ir acompañados de una explicación breve.

### RNF-02 — Usabilidad

- La interfaz debe poder ser utilizada sin instrucciones previas por personas sin conocimientos técnicos.
- El flujo principal (ingresar → analizar → ver resultado) debe completarse en máximo 3 pasos visibles.
- Los resultados deben ser comprensibles sin necesidad de conocimientos de ciberseguridad.

### RNF-03 — Diseño visual ⚠️ PRIORIDAD DEL MVP

La experiencia visual es una prioridad igual o superior a la cantidad de funcionalidades. El MVP debe tener un nivel de acabado apto para una presentación en Demo Day. Se prefiere hacer menos cosas pero hacerlas con excelente presentación visual, antes que incluir más funciones con una interfaz genérica.

- La interfaz debe transmitir la identidad propia de una herramienta moderna de ciberseguridad: profesional, tecnológica, elegante y accesible para principiantes. No debe parecer un formulario genérico.
- La página principal debe tener una jerarquía visual clara con secciones bien diferenciadas: bienvenida/hero, área de análisis y resultados.
- La sección hero debe comunicar inmediatamente qué es CyberGuard AI y generar confianza visual.
- El área de análisis debe ser el elemento más destacado de la página, no un componente secundario.
- Las tarjetas de resultados deben estar visualmente diferenciadas del área de entrada y ser inmediatamente reconocibles como el "veredicto" del análisis.
- Los indicadores de riesgo (Bajo / Medio / Alto) deben ser visualmente distintos, con color, ícono y tipografía que comuniquen el nivel de amenaza sin necesidad de leer el texto.
- La interfaz debe incluir microinteracciones sutiles: animación de entrada de resultados, transición del estado de carga, estados hover en botones e indicadores.
- El estado de análisis (cargando) debe ser visualmente atractivo, no solo un spinner básico.
- Se debe utilizar una paleta de colores coherente con la identidad de CyberGuard AI (oscura, tecnológica, con acentos en cian/azul).
- La tipografía debe ser legible en todos los tamaños de pantalla.
- El diseño debe ser responsive: funcionar correctamente en escritorio (1280px+), tablet (768px) y móvil (375px), sin saturar la pantalla de elementos.
- El diseño en móvil debe ser tan cuidado como en escritorio, con jerarquía adaptada correctamente.
- Evitar saturar la interfaz: espaciado generoso, elementos con propósito claro, sin ruido visual innecesario.

### RNF-04 — Rendimiento

- El tiempo de respuesta del análisis (desde que el usuario presiona "Analizar" hasta que se muestran los resultados) no debe superar los 15 segundos en condiciones normales de red.
- La interfaz debe responder a interacciones del usuario (clics, escritura) en menos de 100ms.

### RNF-05 — Seguridad de la aplicación

- La aplicación no ejecuta ningún archivo cargado por el usuario ni realiza acciones en sistemas externos.
- Las claves de API del LLM se gestionan exclusivamente en el servidor (variables de entorno); nunca se exponen al cliente.
- El contenido ingresado por el usuario se envía únicamente al LLM configurado y no se almacena de forma persistente en el servidor.
- Se aplica sanitización básica del input antes de enviarlo al LLM para evitar prompt injection obvio.

### RNF-06 — Mantenibilidad

- El código debe separar claramente: interfaz (frontend), lógica de análisis (backend/Lambda) y configuración del LLM.
- El proyecto debe seguir una estructura de carpetas coherente y documentada.
- Los prompts del LLM deben estar en archivos o constantes separadas para facilitar su actualización.

### RNF-07 — Disponibilidad del análisis

- Si la llamada al LLM falla o supera el tiempo de espera, la aplicación debe mostrar el resultado del análisis heurístico de respaldo en lugar de un error genérico.
- Si ambos métodos fallan, se muestra un mensaje de error amigable que indica al usuario que vuelva a intentarlo.

### RNF-08 — Arquitectura cloud AWS ⚠️ REQUISITO DE INFRAESTRUCTURA

La aplicación debe estar diseñada y desplegada sobre AWS, utilizando únicamente los servicios necesarios para el MVP. La arquitectura debe ser simple, segura y demostrable en un Demo Day.

- **AWS Amplify** es la plataforma principal de hosting y despliegue del frontend. El código del frontend (React/Next.js estático o SSR) se despliega y gestiona desde Amplify.
- **Amazon Bedrock** es el proveedor del modelo de lenguaje para el análisis de contenido. El frontend nunca llama a Bedrock directamente; toda comunicación con Bedrock ocurre en el backend (Lambda).
- **AWS Lambda** contiene toda la lógica de análisis del backend: recibe la solicitud, sanitiza el input, llama a Bedrock y devuelve el resultado. Las credenciales y permisos de Bedrock nunca abandonan el entorno Lambda.
- **Amazon API Gateway** expone el endpoint HTTP que el frontend consume. Actúa como puerta de entrada segura entre el cliente y Lambda.
- **AWS IAM** gestiona los permisos entre servicios siguiendo el principio de mínimo privilegio: Lambda solo tiene permiso para invocar el modelo de Bedrock necesario; no tiene permisos adicionales.
- **Amazon CloudWatch** registra los errores técnicos y métricas de Lambda necesarios para operar y depurar la aplicación. No se registra el contenido ingresado por los usuarios.
- No se deben agregar servicios AWS adicionales que no sean necesarios para el MVP (sin RDS, sin S3, sin Cognito, sin DynamoDB en esta etapa).
- Las credenciales, permisos y configuración sensible deben permanecer en el backend (Lambda/IAM) y nunca exponerse al frontend ni al cliente del navegador.
- El contenido ingresado por el usuario no debe almacenarse en ningún servicio AWS (ni en logs de CloudWatch ni en ninguna base de datos).

---

## Alcance del MVP

### Incluido en el MVP

- Análisis de mensajes/correos de texto.
- Análisis de URLs.
- Resultado con nivel de riesgo, indicadores, explicación y recomendaciones.
- Interfaz web responsive de una sola página (SPA o similar).
- Ejemplos de demostración predefinidos.
- Análisis heurístico de respaldo.

### Fuera del alcance del MVP (etapas posteriores)

- Análisis de archivos adjuntos.
- Historial de análisis del usuario.
- Autenticación y cuentas de usuario.
- Panel de estadísticas o reportes.
- Integración con APIs externas de reputación de URLs (VirusTotal, Safe Browsing, etc.).
- Modo multilenguaje.

---

## Restricciones del proyecto

- El análisis es **exclusivamente educativo** y no debe presentarse como una solución de seguridad profesional o empresarial.
- Todo contenido de demostración debe ser seguro, controlado y no debe incluir URLs o archivos realmente maliciosos.
- La aplicación no debe almacenar ni registrar el contenido ingresado por los usuarios.

---

## Criterios de aceptación principales

| ID | Criterio |
|----|----------|
| CA-01 | El usuario puede pegar un texto y obtener un resultado de análisis en menos de 15 segundos. |
| CA-02 | El resultado muestra claramente el nivel de riesgo con color diferenciado. |
| CA-03 | Los indicadores detectados se explican en lenguaje comprensible para no técnicos. |
| CA-04 | La interfaz funciona correctamente en móvil (375px) y escritorio (1280px+). |
| CA-05 | Los ejemplos de demostración se cargan con un clic y producen resultados coherentes. |
| CA-06 | La clave de API nunca aparece en el código fuente del cliente ni en las respuestas HTTP. |
| CA-07 | Si el LLM no responde, el análisis heurístico de respaldo produce un resultado válido. |
| CA-08 | La advertencia educativa es visible en todos los resultados. |
| CA-09 | La interfaz no parece un formulario genérico: tiene hero section, identidad visual propia y microinteracciones. |
| CA-10 | El estado de carga es visualmente atractivo (no un spinner básico). |
| CA-11 | Las tarjetas de resultado están claramente diferenciadas del área de entrada. |
| CA-12 | El diseño en móvil (375px) mantiene la jerarquía visual y es completamente funcional. |
