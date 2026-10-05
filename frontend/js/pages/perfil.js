// Datos personales y claves y seguridad del usuario logueado.
import { guardProtectedPage } from '../utils/protectedPage.js';
guardProtectedPage();

import { getUsuario, getToken, setSession } from '../store/authStore.js';
import { renderNavbar } from '../components/navbar.js';
import { renderSidebar } from '../components/sidebar.js';
import { login } from '../api/auth.js';
import { actualizar } from '../api/usuarios.js';

renderNavbar('navbar');
renderSidebar('sidebar');

let usuario = getUsuario() || {};

const formDatos = document.getElementById('form-datos');
const formClave = document.getElementById('form-clave');
const inputNombre = document.getElementById('nombre');
const inputEmail = document.getElementById('email');

function iniciales(nombre = '') {
  const partes = nombre.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return partes.map((p) => p[0].toUpperCase()).join('') || 'U';
}

function pintarDatos() {
  inputNombre.value = usuario.nombre || '';
  inputEmail.value = usuario.email || '';
  document.getElementById('avatar-iniciales').textContent = iniciales(usuario.nombre);
  document.getElementById('perfil-nombre').textContent = usuario.nombre || '';
  document.getElementById('perfil-email').textContent = usuario.email || '';
}

// ---- Una sola sección a la vez, según el link: perfil.html#datos o perfil.html#seguridad ----
const SECCIONES = ['datos', 'seguridad'];

function mostrarSeccion() {
  const pedida = location.hash.replace('#', '');
  const activa = SECCIONES.includes(pedida) ? pedida : 'datos'; // por defecto, datos personales
  for (const id of SECCIONES) {
    document.getElementById(id).hidden = id !== activa;
  }
}

window.addEventListener('hashchange', mostrarSeccion);

function aviso(elementoId, texto, ok = true) {
  const el = document.getElementById(elementoId);
  el.textContent = texto;
  el.className = 'rounded-lg px-3 py-2 text-sm sm:col-span-2 ' +
    (ok ? 'bg-verde/10 text-verde' : 'bg-coral/10 text-coral');
  el.hidden = false;
}

// Deshabilita el botón mientras se guarda, para evitar doble envío
async function conBoton(form, accion) {
  const boton = form.querySelector('button[type="submit"]');
  boton.disabled = true;
  try {
    await accion();
  } finally {
    boton.disabled = false;
  }
}

// ---- Datos personales (nombre y email) ----
formDatos.addEventListener('submit', (event) => {
  event.preventDefault();

  const nombre = inputNombre.value.trim();
  const email = inputEmail.value.trim();

  if (!nombre) return aviso('datos-msg', 'El nombre no puede estar vacío.', false);
  if (!email) return aviso('datos-msg', 'El email no puede estar vacío.', false);
  if (nombre === usuario.nombre && email.toLowerCase() === usuario.email) {
    return aviso('datos-msg', 'No hay cambios para guardar.', false);
  }

  conBoton(formDatos, async () => {
    try {
      const res = await actualizar(usuario.id, { nombre, email });
      usuario = res.usuario;                 // { id, nombre, email, creado_en }
      setSession(getToken(), usuario);       // la sesión guarda el usuario actualizado
      pintarDatos();
      renderNavbar('navbar');                // refresca las iniciales de arriba
      aviso('datos-msg', 'Datos actualizados correctamente.');
    } catch (err) {
      aviso('datos-msg', err.message, false);
    }
  });
});

// ---- Claves y seguridad (contraseña) ----
formClave.addEventListener('submit', (event) => {
  event.preventDefault();

  const actual = document.getElementById('clave-actual').value;
  const nueva = document.getElementById('clave-nueva').value;
  const repetir = document.getElementById('clave-repetir').value;

  if (!actual || !nueva || !repetir) return aviso('clave-msg', 'Completá los tres campos.', false);
  if (nueva.length < 6) return aviso('clave-msg', 'La contraseña nueva debe tener al menos 6 caracteres.', false);
  if (nueva !== repetir) return aviso('clave-msg', 'Las contraseñas nuevas no coinciden.', false);
  if (nueva === actual) return aviso('clave-msg', 'La contraseña nueva tiene que ser distinta de la actual.', false);

  conBoton(formClave, async () => {
    // El backend no verifica la contraseña actual en el PUT, así que se comprueba con el login
    try {
      await login(usuario.email, actual);
    } catch {
      return aviso('clave-msg', 'La contraseña actual no es correcta.', false);
    }

    try {
      await actualizar(usuario.id, { password: nueva });
      formClave.reset();
      aviso('clave-msg', 'Contraseña cambiada correctamente.');
    } catch (err) {
      aviso('clave-msg', err.message, false);
    }
  });
});

pintarDatos();
mostrarSeccion();