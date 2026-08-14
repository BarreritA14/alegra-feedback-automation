# Alegra Feedback Automation

Aplicación web para registrar feedback de usuarios sobre productos de Alegra, almacenar la información en Google Sheets y analizar automáticamente el sentimiento mediante Gemini.

## Descripción

El proyecto permite:

- Registrar nombre, producto y comentario.
- Enviar el feedback desde una interfaz web.
- Procesar la información mediante Google Apps Script.
- Clasificar automáticamente el sentimiento como **Positivo, Neutro o Negativo**.
- Generar un resumen profesional del comentario mediante IA.
- Guardar los resultados en Google Sheets.
- Visualizar los datos mediante Google Data Studio / Looker Studio.

## Arquitectura

```text
Usuario
  ↓
Frontend (HTML + CSS + JavaScript)
  ↓ HTTP POST / JSON
Google Apps Script
  ├── Validación
  ├── Gemini API
  └── Google Sheets
          ↓
Google Data Studio / Looker Studio
```

## Estructura del proyecto

```text
alegra-feedback/
├── index.html
├── styles.css
├── app.js
└── README.md
```

### index.html

Contiene la estructura de la interfaz y el formulario de feedback.

### styles.css

Contiene los estilos visuales y el diseño responsive del formulario.

### app.js

Gestiona la validación del formulario, el envío HTTP mediante `fetch()`, el procesamiento de la respuesta JSON y los mensajes al usuario.

## Backend

El backend utiliza **Google Apps Script**.

Sus funciones principales son:

1. Recibir la petición HTTP POST.
2. Validar los datos.
3. Generar un ID único.
4. Analizar el comentario con Gemini.
5. Obtener sentimiento y resumen IA.
6. Guardar los resultados en Google Sheets.
7. Responder al frontend mediante JSON.

## Estructura de Google Sheets

La hoja `Feedback` utiliza:

| Columna | Campo |
|---|---|
| A | ID |
| B | Marca de Tiempo |
| C | Producto |
| D | Comentario |
| E | Nombre de Usuario |
| F | Categoría de Sentimiento |
| G | Resumen IA |

## Integración con Gemini

Gemini analiza cada comentario y devuelve:

```json
{
  "sentiment": "Positivo",
  "summary": "Resumen breve del comentario."
}
```

Los valores permitidos para `sentiment` son:

- `Positivo`
- `Neutro`
- `Negativo`

El resumen generado debe ser breve y profesional, con máximo 20 palabras.

## Configuración de la API Key

La clave de Gemini se almacena en **Script Properties** de Google Apps Script con el nombre:

```text
GEMINI_API_KEY
```

La clave no debe escribirse directamente en el código ni publicarse en GitHub.

## Configuración del frontend

En `app.js` se configura la URL del Web App de Google Apps Script:

```javascript
const API_URL = "URL_DEL_WEB_APP";
```

Debe utilizarse la URL correspondiente al despliegue activo.

## Ejemplo de petición

```json
{
  "product": "Alegra Nómina",
  "comment": "Estoy muy satisfecho con el producto.",
  "userName": "Fernando"
}
```

## Ejemplo de respuesta

```json
{
  "success": true,
  "message": "Feedback guardado correctamente."
}
```

## Dashboard

Google Sheets se conecta con **Data Studio / Looker Studio** para visualizar:

- Total de feedback.
- Feedback por producto.
- Distribución por sentimiento.
- Registros por fecha.
- Filtros por producto.
- Filtros por categoría de sentimiento.
- Filtros por fecha.

## Pruebas realizadas

Se verificó:

- Guardado correcto del feedback.
- Comunicación HTTP POST.
- Validación de campos obligatorios.
- Integración con Gemini.
- Clasificación de sentimiento.
- Generación del resumen IA.
- Registro de todos los campos en Google Sheets.
- Actualización de los datos utilizados por el dashboard.
- Visualización mediante Data Studio / Looker Studio.

## Ejecución

### Frontend

Abrir `index.html` en un navegador o ejecutarlo mediante un servidor local.

### Backend

El backend se ejecuta como Web App desde Google Apps Script.

La función principal es:

```javascript
doPost(e)
```

También se dispone de:

```javascript
doGet()
```

para comprobar que el Web App está funcionando.

## Seguridad

- La API Key de Gemini se almacena mediante `PropertiesService`.
- No se incluyen credenciales en el frontend.
- No se debe publicar la API Key en GitHub.
- El backend valida los datos recibidos.
- La comunicación con el Web App utiliza HTTPS.

## Tecnologías

- HTML5
- CSS3
- JavaScript
- Google Apps Script
- Google Sheets
- Gemini API
- Google Data Studio / Looker Studio
- Fetch API
- JSON
- HTTP POST

## Flujo completo

```text
Formulario
    ↓
Validación
    ↓
HTTP POST
    ↓
Google Apps Script
    ↓
Gemini
    ↓
Sentimiento + Resumen IA
    ↓
Google Sheets
    ↓
Data Studio / Looker Studio
```

## Estado del proyecto

**Finalizado y funcional.**

El proyecto fue desarrollado como reto técnico para el proceso de selección de **Alegra**.

## Autor

CARLOS ANDRES BARRERA
Proyecto desarrollado para el reto técnico de Alegra.