const transporter = require('../config/conexion-email')

const enviarEmail = async (destinatario, asunto, contenido) => {

    // En la nube (Render): si hay API key de Brevo, se envía por su API
    if (process.env.BREVO_API_KEY) {
        const respuesta = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'api-key': process.env.BREVO_API_KEY
            },
            body: JSON.stringify({
                sender: { name: 'Finanzas', email: process.env.BREVO_SENDER_EMAIL },
                to: [{ email: destinatario }],
                subject: asunto,
                htmlContent: contenido
            })
        })

        if (!respuesta.ok) {
            const detalle = await respuesta.text()
            throw new Error(`Error al enviar email (${respuesta.status}): ${detalle}`)
        }
        return
    }

    // En local (Docker): se mantiene el envío por SMTP
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: destinatario,
        subject: asunto,
        html: contenido
    })
}

module.exports = {enviarEmail}