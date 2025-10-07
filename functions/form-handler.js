exports.handler = async (event) => {
    // ... Código de manejo de POST y parsing (el mismo que tienes) ...

    try {
        // --- Bloqueamos Bots (Honeypot) ---
        if (data['bot-field']) { // Asume que 'data' es tu objeto de parsing
            console.log("Bot bloqueado por Honeypot.");
            return { statusCode: 303, headers: { Location: '/lead-fallido.html' } };
        }

        // --- Intentamos enviar a Brevo (Si falla, va al catch) ---
        await sendToBrevo(contact); 
        
    } catch (error) {
        // Si Brevo falla, lo registramos, pero el usuario no lo ve.
        console.error("Error al enviar a Brevo, pero continuamos con la venta:", error);
    } 
    
    // --- PASO FINAL: ÉXITO Y VENTA (Se ejecuta SIEMPRE, incluso si Brevo falló) ---
    // Esto asegura que el usuario vea la página de ventas /gracias.html
    return {
        statusCode: 303, 
        headers: { 
            Location: '/gracias.html' 
        } 
    };
};