// lee token de la URL (viene del link del mail) api/auth.restablecerPassword()
import { restablecerPassword } from '../api/auth.js';

const parametros = new URLSearchParams(window.location.search);
const token = parametros.get('token');

const form = document.getElementById('restablecer-form');
const errorEl = document.getElementById('restablecer-error');
const exitoEl = document.getElementById('restablecer-exito');
const btnRestablecer = document.getElementById('btn-restablecer');

// si no hay token en la URL, el link esta roto o incompleto: avisamos y no dejamos enviar
if (!token) {
    errorEl.textContent = 'El link no es válido. Pedí uno nuevo desde "¿Olvidaste tu contraseña?".';
    errorEl.hidden = false;
    form.querySelector('button').disabled = true;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    errorEl.hidden = true;
    exitoEl.hidden = true;

    const nuevaPassword = document.getElementById('nueva-password').value;

    btnRestablecer.disabled = true;
    btnRestablecer.textContent = 'Guardando...';

    try {
        await restablecerPassword(token, nuevaPassword);
        exitoEl.textContent = 'Contraseña actualizada. Ingresá con tu nueva contraseña. Te estamos llevando a iniciar sesión...';
        exitoEl.hidden = false;
        form.reset();

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.hidden = false;
        btnRestablecer.disabled = false;
        btnRestablecer.textContent = 'Guardar contraseña';
    }
});