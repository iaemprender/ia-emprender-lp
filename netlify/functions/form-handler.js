const axios = require('axios');
const querystring = require('querystring'); 

// ----------------------------------------------------------------------
// FUNCIÓN 1: Validar el Email usando EmailListVerify (ELV)
// ----------------------------------------------------------------------
async function validateEmail(email) {
    // La clave se inyecta desde Netlify (process.env.ELV_API_KEY)
    const apiKey = process.env.ELV_API_KEY;
    const apiUrl = `https://api.emaillistverify.com/v1/verify`; 

    try {
        const response = await axios.get(apiUrl, {
            params: {
                secret: apiKey, 
                email: email
            }
        });

        const status = response.data.status;
        
        // SOLO aceptamos 'ok' como lead limpio y seguro.
        const acceptableStatuses = ['ok']; 

        return { 
            isValid: acceptableStatuses.includes(status), 
            status: status 
        };

    } catch (error) {
        // En caso de fallo de la API de validación, permitimos el lead 
        // para no bloquear a un usuario real por un error de servidor.
        console.error("Error al llamar a ELV, permitiendo el lead:", error.message);
        return { isValid: true, status: 'api_error' }; 
    }
}


// ----------------------------------------------------------------------
// FUNCIÓN 2: Sincronizar el Contacto con Brevo (Plantilla Modular)
// ----------------------------------------------------------------------
async function sendToBrevo(contact) {
    // La clave se inyecta desde Netlify (process.env.BREVO_API_KEY)
    const apiKey = process.env.BREVO_API_KEY;
    const brevoUrl = 'https://api.sendinblue.com/v3/contacts'; 
    const listId = 2; // <<--- ¡RECUERDA CAMBIAR ESTE ID por el de tu lista en Brevo!

    const brevoPayload = {
        email: contact.email,
        updateEnabled: true, // Si el contacto ya existe, actualiza los datos
        listIds: [listId],
        attributes: {
            // Se mapean los campos del formulario a los campos de Brevo
            'FIRSTNAME': contact.first_name, 
        }
    };

    try {
        await axios.post(brevoUrl, brevoPayload, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });
        console.log(`Contacto ${contact.email} enviado a Brevo con éxito.`);
        return { success: true };

    } catch (error) {
        console.error("Error al enviar a Brevo:", error.message);
        return { success: false, error: error.message }; 
    }
}


// ----------------------------------------------------------------------
// FUNCIÓN PRINCIPAL (El Handler que Netlify llama)
// ----------------------------------------------------------------------
exports.handler = async (event) => {
    // Bloquear cualquier método que no sea POST (seguridad básica)
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Método no permitido' };
    }

    // Parsea los datos del formulario que vienen codificados (URL-Encoded)
    const data = querystring.parse(event.body); 
    const contact = {
        first_name: data.first_name,
        email: data.email
    };

    try {
        // --- PASO 1: FIREWALL DE LEADS (Validación) ---
        const validationResult = await validateEmail(contact.email);

        if (!validationResult.isValid) {
            console.log(`Lead bloqueado por ELV: ${contact.email} - Status: ${validationResult.status}`);
            // Redirige al usuario a la página de fallo (sin añadir a Brevo)
            return {
                statusCode: 302,
                headers: { Location: '/lead-fallido.html' } 
            };
        }

        // --- PASO 2: SINCRONIZACIÓN (Brevo) ---
        await sendToBrevo(contact);

        // --- PASO 3: ÉXITO Y REDIRECCIÓN ---
        // Redirige a la página donde entregamos el lead magnet
        return {
            statusCode: 302,
            headers: { Location: '/gracias.html' } 
        };

    } catch (error) {
        console.error("Error general en el handler:", error);
        // En caso de error inesperado, aún redirigimos al éxito para no frustrar al usuario
        return {
            statusCode: 302,
            headers: { Location: '/gracias.html' } 
        };
    }
};