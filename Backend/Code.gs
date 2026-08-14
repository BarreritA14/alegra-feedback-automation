/**
 * ============================================================
 * ALEGRA FEEDBACK - BACKEND
 * ============================================================
 *
 * Backend desarrollado con Google Apps Script.
 *
 * Responsabilidades principales:
 * - Recibir feedback desde el frontend mediante HTTP POST.
 * - Validar los datos recibidos.
 * - Generar un identificador único para cada feedback.
 * - Analizar el comentario utilizando Gemini API.
 * - Clasificar el sentimiento.
 * - Generar un resumen automático mediante IA.
 * - Guardar toda la información en Google Sheets.
 *
 * Flujo:
 *
 * Frontend
 *    ↓
 * HTTP POST
 *    ↓
 * doPost()
 *    ↓
 * saveFeedback()
 *    ↓
 * analyzeFeedbackWithGemini()
 *    ↓
 * Gemini API
 *    ↓
 * Google Sheets
 *
 * La API Key de Gemini NO se almacena directamente en el código.
 * Se obtiene de Script Properties mediante GEMINI_API_KEY.
 */


/**
 * Guarda un feedback en Google Sheets después de analizarlo
 * mediante Gemini.
 *
 * @param {string} product - Producto seleccionado por el usuario.
 * @param {string} comment - Comentario escrito por el usuario.
 * @param {string} userName - Nombre del usuario.
 */
function saveFeedback(product, comment, userName) {

  // Obtiene el archivo de Google Sheets asociado al proyecto.
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // Obtiene la hoja donde se almacenan los feedback.
  const sheet = spreadsheet.getSheetByName("Feedback");

  // Genera un identificador único para cada feedback.
  const id = "FB-" + Utilities.getUuid().substring(0, 8).toUpperCase();

  // Registra la fecha y hora actual.
  const timestamp = new Date();

  // Envía el comentario a Gemini para obtener:
  // - Clasificación del sentimiento.
  // - Resumen generado por IA.
  const analysis = analyzeFeedbackWithGemini(comment);

  // Guarda toda la información en Google Sheets.
  //
  // Orden de las columnas:
  // A → ID
  // B → Marca de Tiempo
  // C → Producto
  // D → Comentario
  // E → Nombre de Usuario
  // F → Categoría de Sentimiento
  // G → Resumen IA
  sheet.appendRow([
    id,
    timestamp,
    product,
    comment,
    userName,
    analysis.sentiment,
    analysis.summary
  ]);

  // Registra información útil para verificar la ejecución.
  Logger.log("Feedback analizado correctamente: " + id);
  Logger.log("Sentimiento: " + analysis.sentiment);
  Logger.log("Resumen IA: " + analysis.summary);
  Logger.log("Feedback guardado correctamente: " + id);
}


/**
 * Función utilizada para realizar una prueba manual
 * del proceso completo de almacenamiento y análisis.
 *
 * Esta función NO es utilizada directamente por el frontend.
 */
function testSaveFeedback() {

  saveFeedback(
    "Producto de prueba",
    "Comentario de prueba",
    "Andres"
  );
}


/**
 * Endpoint HTTP POST.
 *
 * Recibe los datos enviados desde el frontend,
 * valida la información y ejecuta el proceso de guardado.
 *
 * Datos esperados:
 *
 * {
 *   "product": "Alegra POS",
 *   "comment": "La aplicación es fácil de usar.",
 *   "userName": "Andres"
 * }
 *
 * @param {Object} e - Evento generado por la petición HTTP.
 * @returns {TextOutput} Respuesta JSON para el frontend.
 */
function doPost(e) {

  try {

    // Verifica que exista información enviada en la petición.
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No se recibieron datos en la petición.");
    }

    // Convierte el cuerpo de la petición JSON en un objeto JavaScript.
    const data = JSON.parse(e.postData.contents);

    // Obtiene los campos enviados desde el frontend.
    const product = data.product;
    const comment = data.comment;
    const userName = data.userName;

    // Valida que los campos obligatorios tengan información.
    if (!product || !comment || !userName) {
      throw new Error("Faltan datos obligatorios.");
    }

    // Procesa y guarda el feedback.
    saveFeedback(product, comment, userName);

    // Devuelve una respuesta exitosa al frontend.
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: "Feedback guardado correctamente."
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {

    // Registra el error para facilitar el diagnóstico.
    Logger.log("Error en doPost: " + error.message);

    // Devuelve una respuesta de error al frontend.
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


/**
 * Endpoint HTTP GET.
 *
 * Se utiliza para comprobar que la Web App
 * está disponible y funcionando correctamente.
 *
 * @returns {TextOutput} Respuesta JSON de estado.
 */
function doGet() {

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: "Web App funcionando correctamente."
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/**
 * Realiza una prueba de integración con Gemini.
 *
 * Esta función permite comprobar:
 * - Existencia de la API Key.
 * - Comunicación con Gemini.
 * - Código HTTP de respuesta.
 * - Existencia de contenido en la respuesta.
 *
 * La API Key se obtiene desde Script Properties.
 */
function testGemini() {

  // Obtiene la API Key almacenada de forma segura
  // en las propiedades del proyecto.
  const rawApiKey =
    PropertiesService
      .getScriptProperties()
      .getProperty("GEMINI_API_KEY");

  // Verifica que la API Key exista.
  if (!rawApiKey) {
    throw new Error(
      "Configuración inválida: La clave 'GEMINI_API_KEY' no existe en ScriptProperties."
    );
  }

  // Elimina espacios innecesarios.
  const apiKey = rawApiKey.trim();

  // Endpoint utilizado para realizar la prueba con Gemini.
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

  // Datos enviados a Gemini.
  const payload = {
    contents: [
      {
        parts: [
          {
            text:
              "Analiza este comentario de cliente y responde únicamente con una palabra: Positivo, Neutro o Negativo. Comentario: El producto funciona muy bien y estoy satisfecho."
          }
        ]
      }
    ]
  };

  // Configuración de la petición HTTP.
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  // Envía la petición a Gemini.
  const response = UrlFetchApp.fetch(url, options);

  // Obtiene el código HTTP y el contenido de la respuesta.
  const statusCode = response.getResponseCode();
  const responseText = response.getContentText();

  Logger.log(`HTTP Status: ${statusCode}`);

  // Verifica que Gemini haya respondido correctamente.
  if (statusCode !== 200) {
    throw new Error(
      `Gemini API Error [HTTP ${statusCode}]: ${responseText}`
    );
  }

  // Convierte la respuesta JSON en un objeto.
  const result = JSON.parse(responseText);

  // Extrae el texto generado por Gemini.
  const text =
    result.candidates?.[0]?.content?.parts?.[0]?.text;

  // Verifica que exista contenido.
  if (!text) {
    throw new Error(
      "Respuesta malformada: No se encontró contenido."
    );
  }

  Logger.log(`Resultado Gemini: ${text.trim()}`);

  return text.trim();
}


/**
 * Lista los modelos de Gemini disponibles para la API Key configurada.
 *
 * Esta función fue utilizada durante el desarrollo
 * para verificar qué modelos podían utilizarse.
 */
function listarModelos() {

  const apiKey =
    PropertiesService
      .getScriptProperties()
      .getProperty("GEMINI_API_KEY")
      .trim();

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  const response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true
  });

  const data = JSON.parse(response.getContentText());

  if (data.models) {

    Logger.log("--- TUS MODELOS DISPONIBLES ---");

    data.models.forEach(m => {

      if (
        m.supportedGenerationMethods &&
        m.supportedGenerationMethods.includes("generateContent")
      ) {
        Logger.log(m.name);
      }

    });

  } else {

    Logger.log(
      "Error al obtener modelos: " +
      response.getContentText()
    );
  }
}


/**
 * Analiza un comentario utilizando Gemini.
 *
 * Gemini devuelve dos resultados:
 *
 * 1. sentiment
 *    - Positivo
 *    - Neutro
 *    - Negativo
 *
 * 2. summary
 *    Resumen breve y profesional del comentario.
 *
 * @param {string} comment - Comentario del cliente.
 * @returns {Object} Objeto con sentimiento y resumen.
 */
function analyzeFeedbackWithGemini(comment) {

  // Obtiene la API Key desde Script Properties.
  const apiKey =
    PropertiesService
      .getScriptProperties()
      .getProperty("GEMINI_API_KEY")
      .trim();

  // Verifica que exista la API Key.
  if (!apiKey) {
    throw new Error("No se encontró GEMINI_API_KEY.");
  }

  // Endpoint de Gemini utilizado para el análisis.
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

  /**
   * Prompt utilizado para controlar la respuesta de Gemini.
   *
   * Se solicita una respuesta estructurada en JSON
   * para facilitar el procesamiento desde JavaScript.
   */
  const prompt = `
Analiza el siguiente comentario de un cliente de Alegra.

Necesito exactamente dos datos:

1. sentiment:
Debe ser únicamente una de estas opciones:
Positivo
Neutro
Negativo

2. summary:
Debe ser un resumen breve y profesional del comentario, máximo 20 palabras.

Responde ÚNICAMENTE en formato JSON válido, sin markdown y sin texto adicional.

Formato obligatorio:
{
  "sentiment": "Positivo",
  "summary": "Resumen breve del comentario."
}

Comentario:
${comment}
`;

  // Construye el cuerpo de la petición.
  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]
  };

  // Configuración de la petición HTTP hacia Gemini.
  const response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-goog-api-key": apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  // Obtiene el estado HTTP y la respuesta.
  const statusCode = response.getResponseCode();
  const responseText = response.getContentText();

  Logger.log("HTTP Status: " + statusCode);

  // Verifica que la petición haya sido exitosa.
  if (statusCode !== 200) {
    throw new Error(
      "Gemini respondió con HTTP " +
      statusCode +
      ": " +
      responseText
    );
  }

  // Convierte la respuesta de Gemini a objeto JavaScript.
  const result = JSON.parse(responseText);

  // Extrae el contenido generado.
  const text =
    result.candidates?.[0]?.content?.parts?.[0]?.text;

  // Verifica que Gemini haya devuelto información.
  if (!text) {
    throw new Error("Gemini no devolvió un resultado.");
  }

  Logger.log("Respuesta Gemini: " + text);

  // Elimina posibles bloques Markdown
  // por si Gemini devuelve ```json ... ```.
  const cleanText = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let analysis;

  // Convierte la respuesta limpia en un objeto JSON.
  try {

    analysis = JSON.parse(cleanText);

  } catch (error) {

    throw new Error(
      "Gemini no devolvió un JSON válido: " +
      cleanText
    );
  }

  // Valida que el sentimiento corresponda
  // a una de las categorías permitidas.
  if (
    !analysis.sentiment ||
    !["Positivo", "Neutro", "Negativo"]
      .includes(analysis.sentiment)
  ) {

    throw new Error(
      "Gemini devolvió un sentimiento inválido: " +
      analysis.sentiment
    );
  }

  // Verifica que Gemini haya generado el resumen.
  if (!analysis.summary) {
    throw new Error(
      "Gemini no devolvió el resumen IA."
    );
  }

  // Devuelve únicamente los datos necesarios
  // para guardar en Google Sheets.
  return {
    sentiment: analysis.sentiment,
    summary: analysis.summary
  };
}


/**
 * Prueba específica del análisis de sentimiento y resumen.
 *
 * Esta función permite verificar manualmente
 * la integración entre Apps Script y Gemini.
 */
function testAnalyzeFeedback() {

  const result = analyzeFeedbackWithGemini(
    "El producto llegó tarde y estoy muy decepcionado."
  );

  Logger.log("Sentimiento: " + result.sentiment);
  Logger.log("Resumen IA: " + result.summary);
}