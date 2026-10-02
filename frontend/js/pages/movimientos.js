// guardProtectedPage() + lista movimientos del usuario con filtro gasto/ingreso
// el alta de movimientos se hace desde categorias.html aca solo se listan y filtran

import { guardProtectedPage } from '../utils/protectedPage.js';
guardProtectedPage();

import { getUsuario } from '../store/authStore.js';
import * as movimientosApi from '../api/movimientos.js';
import * as categoriasApi from '../api/categorias.js';
import { renderNavbar } from '../components/navbar.js';
import { renderSidebar } from '../components/sidebar.js';

renderSidebar('sidebar');
renderNavbar('navbar');

const usuario = getUsuario();

let movimientos = [];
let categorias = [];
let filtroActivo = null;

const lista = document.getElementById('lista-movimientos');
const menuFiltros = document.getElementById('menu-filtros');
const vistaLista = document.getElementById('vista-lista');
const botonesFiltro = document.querySelectorAll('[data-filtro]');
const botonVolver = document.getElementById('btn-volver');

async function iniciar() {
    const [resMovimientos, resCategorias] = await Promise.all([
        movimientosApi.obtenerPorUsuario(usuario.id),
        categoriasApi.obtenerTodas(),
    ]);

    movimientos = resMovimientos.movimientos;
    categorias = resCategorias.categorias;
}

function nombreCategoria(categoriaId) {
    const categoria = categorias.find((c) => c.id === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
}

function pintarLista() {
    const movimientosFiltrados = movimientos.filter((movimiento) => movimiento.tipo === filtroActivo);

    if (movimientosFiltrados.length === 0) {
        lista.innerHTML = `<li class="text-tinta/40 text-sm py-4 text-center">No hay movimientos para mostrar.</li>`;
        return;
    }

    const html = movimientosFiltrados.map((movimiento) => {
        const esGasto = movimiento.tipo === 'gasto';
        const signo = esGasto ? '-' : '+';
        const colorMonto = esGasto ? 'text-coral' : 'text-verde';

        return `
        <li class="flex justify-between items-center border-b border-tinta/10 py-2 text-sm">
            <span class="text-tinta/80">
                ${nombreCategoria(movimiento.categoria_id)} —
                <span class="${colorMonto} font-bold">${signo}$${movimiento.monto}</span>
                el ${movimiento.fecha.split('T')[0]}
                (${movimiento.descripcion || 'sin descripción'})
            </span>
            <button class="btn-eliminar text-coral hover:text-coral/70 text-xs font-semibold" data-id="${movimiento.id}">
                Eliminar
            </button>
        </li>
        `;
    }).join('');

    lista.innerHTML = html;
}

function mostrarMenu() {
    filtroActivo = null;
    menuFiltros.classList.remove('hidden');
    vistaLista.classList.add('hidden');
}

function mostrarLista(filtro) {
    filtroActivo = filtro;
    menuFiltros.classList.add('hidden');
    vistaLista.classList.remove('hidden');
    pintarLista();
}

botonesFiltro.forEach((boton) => {
    boton.addEventListener('click', () => {
        mostrarLista(boton.dataset.filtro);
    });
});

botonVolver.addEventListener('click', mostrarMenu);

lista.addEventListener('click', async (event) => {
    const boton = event.target.closest('.btn-eliminar');
    if (!boton) return;

    const id = Number(boton.dataset.id);
    await movimientosApi.eliminar(id);

    movimientos = movimientos.filter((movimiento) => movimiento.id !== id);
    pintarLista();
});

iniciar();
