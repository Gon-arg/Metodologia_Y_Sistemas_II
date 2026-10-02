// Datos personales y claves y seguridad del usuario logueado.
import { guardProtectedPage } from '../utils/protectedPage.js';
guardProtectedPage();

import { getUsuario } from '../store/authStore.js';
import { renderNavbar } from '../components/navbar.js';
import { renderSidebar } from '../components/sidebar.js';

renderNavbar('navbar');
renderSidebar('sidebar');

const usuario = getUsuario() || {};
document.getElementById('nombre').value = usuario.nombre || '';
document.getElementById('email').value = usuario.email || '';
document.getElementById('avatar-iniciales').textContent =
  (usuario.nombre || 'U').trim().split(/\s+/).slice(0, 2).map((p) => p[0].toUpperCase()).join('');

// TODO: conectar los formularios con js/api/usuarios.js (PUT /usuarios/:id) cuando esté implementado.
document.getElementById('form-datos').addEventListener('submit', (e) => e.preventDefault());
document.getElementById('form-clave').addEventListener('submit', (e) => e.preventDefault());