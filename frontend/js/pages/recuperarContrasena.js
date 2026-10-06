// Escucha submit del form de recuperar-contrasena.html -> api/auth.recuperarPassword()
// Pide el mail de recuperacion. No requiere sesion.
import { recuperarPassword } from '../api/auth.js';

const form = document.getElementById('recuperar-form');
const errorEl = document.getElementById('recuperar-error');
const exitoEl = document.getElementById('recuperar-exito');
const btnEnviar = document.getElementById('btn-enviar');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    errorEl.hidden = true;
    exitoEl.hidden = true;

    const email = document.getElementById('email').value;

    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Enviando...';

    try {
        await recuperarPassword(email);
        exitoEl.textContent = 'Listo, revisá tu email para continuar con la recuperación.';
        exitoEl.hidden = false;
        form.reset();
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.hidden = false;
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Enviar link';
    }
    });