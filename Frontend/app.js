/* =========================================================
   CONFIGURACIÓN DE LA API
   ========================================================= */

/*
 * URL pública del Web App desarrollado con Google Apps Script.
 * El frontend utiliza esta URL para enviar los feedback
 * al backend mediante una petición HTTP POST.
 */
const API_URL = "https://script.google.com/macros/s/AKfycbwPlxLeoCsKT_mvqS5nGWC9ZBkI2H4wFevHrXqc9OVkC8mg5FYgL2Xx0OLtX3OkyQoCrw/exec";


/* =========================================================
   REFERENCIAS DEL DOM
   ========================================================= */

/*
 * Obtiene las referencias de los elementos principales
 * de la interfaz para poder interactuar con ellos mediante JavaScript.
 */
const feedbackForm = document.getElementById("feedbackForm");
const submitButton = document.getElementById("submitButton");
const message = document.getElementById("message");


/* =========================================================
   ENVÍO DEL FORMULARIO
   ========================================================= */

/*
 * Escucha el evento submit del formulario.
 *
 * async permite realizar la petición HTTP al backend
 * utilizando await.
 */
feedbackForm.addEventListener("submit", async (event) => {

    /*
     * Evita el comportamiento predeterminado del formulario,
     * que provocaría una recarga de la página.
     */
    event.preventDefault();


    /* =====================================================
       OBTENCIÓN DE DATOS
       ===================================================== */

    /*
     * Obtiene los valores introducidos o seleccionados
     * por el usuario y elimina espacios innecesarios.
     *
     * El nombre es opcional.
     */
    const userName = document.getElementById("userName").value.trim();

    /*
     * Obtiene el producto seleccionado en el <select>.
     */
    const product = document.getElementById("product").value.trim();

    /*
     * Obtiene el comentario escrito por el usuario.
     */
    const comment = document.getElementById("comment").value.trim();


    /* =====================================================
       VALIDACIÓN
       ===================================================== */

    /*
     * Producto y comentario son obligatorios.
     *
     * El nombre NO se valida porque es un campo opcional.
     */
    if (!product || !comment) {
        message.textContent =
            "Por favor selecciona un producto y escribe un comentario.";
        return;
    }


    /* =====================================================
       ESTADO DE ENVÍO
       ===================================================== */

    /*
     * Deshabilita el botón para evitar que el usuario
     * envíe el mismo feedback varias veces.
     */
    submitButton.disabled = true;

    /*
     * Informa visualmente al usuario que el sistema
     * está procesando la solicitud.
     */
    submitButton.textContent = "Enviando...";

    /*
     * Limpia mensajes anteriores.
     */
    message.textContent = "";


    /* =====================================================
       COMUNICACIÓN CON EL BACKEND
       ===================================================== */

    try {

        /*
         * Envía los datos al Web App de Google Apps Script
         * mediante una petición HTTP POST.
         */
        const response = await fetch(API_URL, {

            method: "POST",

            /*
             * Google Apps Script puede realizar una redirección
             * al procesar el Web App.
             */
            redirect: "follow",

            /*
             * Se utiliza text/plain para facilitar el envío
             * del JSON hacia Google Apps Script.
             */
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            /*
             * Convierte los datos del formulario a JSON
             * antes de enviarlos al backend.
             */
            body: JSON.stringify({
                product: product,
                comment: comment,
                userName: userName
            })
        });


        /* =================================================
           PROCESAMIENTO DE LA RESPUESTA
           ================================================= */

        /*
         * Obtiene la respuesta del servidor como texto.
         */
        const rawResponse = await response.text();


        /*
         * Información de depuración útil durante
         * el desarrollo y las pruebas.
         */
        console.log("HTTP status:", response.status);
        console.log("Response URL:", response.url);
        console.log("Respuesta del servidor:", rawResponse);


        let data;


        try {

            /*
             * Convierte la respuesta JSON del backend
             * en un objeto JavaScript.
             */
            data = JSON.parse(rawResponse);

        } catch (parseError) {

            /*
             * Si el backend no devuelve JSON válido,
             * se genera un error descriptivo.
             */
            throw new Error(
                "El servidor no devolvió JSON. Respuesta recibida: " +
                rawResponse.substring(0, 200)
            );
        }


        /* =================================================
           VALIDACIÓN DE LA RESPUESTA DEL BACKEND
           ================================================= */

        /*
         * Comprueba:
         *
         * 1. Que la respuesta HTTP sea correcta.
         * 2. Que el backend indique que la operación fue exitosa.
         */
        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "No se pudo guardar el feedback."
            );
        }


        /* =================================================
           RESPUESTA EXITOSA
           ================================================= */

        /*
         * Informa al usuario que el feedback fue registrado
         * correctamente.
         */
        message.textContent = "Feedback guardado correctamente.";

        /*
         * Limpia todos los campos después de un envío exitoso.
         */
        feedbackForm.reset();


    } catch (error) {

        /* =================================================
           MANEJO DE ERRORES
           ================================================= */

        /*
         * Registra el error en la consola para facilitar
         * el diagnóstico durante el desarrollo.
         */
        console.error("Error al enviar feedback:", error);

        /*
         * Muestra un mensaje de error al usuario.
         */
        message.textContent = "Error: " + error.message;


    } finally {

        /* =================================================
           RESTAURACIÓN DEL ESTADO
           ================================================= */

        /*
         * Reactiva el botón independientemente de si
         * la operación terminó correctamente o con error.
         */
        submitButton.disabled = false;

        /*
         * Restaura el texto original del botón.
         */
        submitButton.textContent = "Enviar feedback";
    }
});