// Barra superior: ícono redondo con iniciales; al tocarlo baja un desplegable
// con el nombre del usuario y las opciones "Datos personales" / "Claves y seguridad".
// Uso: renderNavbar('navbar')  (id del contenedor)
import { getUsuario } from '../store/authStore.js';

function iniciales(nombre = '') {
  const partes = nombre.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return partes.map((p) => p[0].toUpperCase()).join('') || 'U';
}

function escapar(texto = '') {
  const d = document.createElement('div');
  d.textContent = texto;
  return d.innerHTML;
}

export function renderNavbar(containerId) {
  const contenedor = document.getElementById(containerId);
  if (!contenedor) return;

  const usuario = getUsuario() || {};

  contenedor.innerHTML = `
    <header class="flex justify-end px-6 md:px-10 py-5">
      <div class="relative">
        <button id="btn-avatar" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Menú de usuario"
          class="h-11 w-11 rounded-full bg-ambar text-tinta font-extrabold grid place-items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-verde">
          ${iniciales(usuario.nombre)}
        </button>
        <div id="menu-avatar" role="menu" hidden
          class="absolute right-0 mt-2 w-60 rounded-xl bg-white shadow-lg ring-1 ring-tinta/10 py-1 z-20">
          <div class="px-4 py-3 border-b border-tinta/10">
            <p class="font-bold truncate">${escapar(usuario.nombre)}</p>
            <p class="text-xs text-tinta/60 truncate">${escapar(usuario.email)}</p>
          </div>
          <a href="perfil.html#datos" role="menuitem" class="block px-4 py-2.5 text-sm hover:bg-fondo">Datos personales</a>
          <a href="perfil.html#seguridad" role="menuitem" class="block px-4 py-2.5 text-sm hover:bg-fondo">Claves y seguridad</a>
          <button id="btn-logout" type="button" role="menuitem"
            class="w-full text-left px-4 py-2.5 text-sm text-coral hover:bg-fondo border-t border-tinta/10">Cerrar sesión</button>
        </div>
      </div>
    </header>`;

  const btn = document.getElementById('btn-avatar');
  const menu = document.getElementById('menu-avatar');
  const cerrar = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };

  btn.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    btn.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) cerrar();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
  // Si ya estás en Perfil, el link solo cambia el # y la página no se recarga: se cierra el menú a mano
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) cerrar(); });

  document.getElementById('btn-logout').addEventListener('click', () => {
    // Si authStore ya tiene función de logout, usala acá.
    localStorage.removeItem('finanzas_token');
    localStorage.removeItem('finanzas_usuario');
    window.location.href = 'login.html';
  });
}