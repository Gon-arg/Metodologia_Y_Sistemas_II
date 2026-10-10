// guardProtectedPage() + lista de metas del usuario usando metaCard.js, con detalle expandible y aportes

import { guardProtectedPage } from '../utils/protectedPage.js';
guardProtectedPage();

import { getUsuario } from '../store/authStore.js';
import * as metasApi from '../api/metasAhorro.js';
import * as aportesApi from '../api/aportesMetas.js';
import { renderNavbar } from '../components/navbar.js';
import { renderSidebar } from '../components/sidebar.js';

renderSidebar('sidebar');
renderNavbar('navbar');

const usuario = getUsuario();

let metas = [];
let metaExpandidaId = null;
let aportesPorMeta = {};

const form = document.getElementById('form-meta');
const lista = document.getElementById('lista-metas');

function calcularDiasRestantes(fechaLimite) {
    const hoy = new Date();
    const limite = new Date(fechaLimite);

    const hoyUTC = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const limiteUTC = Date.UTC(limite.getUTCFullYear(), limite.getUTCMonth(), limite.getUTCDate());

    const diferenciaMs = limiteUTC - hoyUTC;
    return Math.round(diferenciaMs / (1000 * 60 * 60 * 24));
}

function formatearFecha(fechaIso) {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString('es-AR', { timeZone: 'UTC' });
}

async function cargarMetas() {
    try {
        const respuesta = await metasApi.obtenerPorUsuario();
        metas = respuesta.metas;
        pintarLista();
    } catch (err) {
        lista.innerHTML = `<li class="text-coral text-sm">${err.message}</li>`;
    }
}

function pintarLista() {
    const html = metas.map((meta) => {
        const expandida = meta.id === metaExpandidaId;
        return expandida ? cardExpandida(meta) : cardResumida(meta);
    }).join('');

    lista.innerHTML = html;
}

function cardResumida(meta) {
    const montoActual = Number(meta.monto_actual);
    const montoObjetivo = Number(meta.monto_objetivo);
    const porcentaje = Math.min(Math.round((montoActual / montoObjetivo) * 100), 100);

    return `
    <li class="bg-white rounded-2xl ring-1 ring-tinta/10 p-4 cursor-pointer hover:ring-verde/40 transition-all btn-expandir" data-id="${meta.id}">
        <div class="flex justify-between items-center mb-2">
            <span class="font-bold text-tinta">${meta.nombre}</span>
            <span class="text-sm text-tinta/60">${porcentaje}%</span>
        </div>
        <div class="w-full bg-fondo rounded-full h-2 overflow-hidden">
            <div class="bg-verde h-2 rounded-full" style="width: ${porcentaje}%"></div>
        </div>
    </li>
    `;
}

function cardExpandida(meta) {
    const montoActual = Number(meta.monto_actual);
    const montoObjetivo = Number(meta.monto_objetivo);
    const porcentaje = Math.min(Math.round((montoActual / montoObjetivo) * 100), 100);
    const diasRestantes = calcularDiasRestantes(meta.fecha_limite);
    const aportes = aportesPorMeta[meta.id] || [];

    const textoTiempo = diasRestantes >= 0
        ? `${diasRestantes} días restantes`
        : `Vencida hace ${Math.abs(diasRestantes)} días`;

    const htmlAportes = aportes.length === 0
        ? `<li class="text-tinta/40 text-sm py-2 text-center">Todavía no hay aportes.</li>`
        : aportes.map((aporte) => `
            <li class="flex justify-between items-center border-b border-tinta/10 py-2 text-sm">
                <span class="text-tinta/80">
                    $${aporte.monto} el ${aporte.fecha.split('T')[0]} (${aporte.descripcion || 'sin descripción'})
                </span>
                <button class="btn-eliminar-aporte text-coral hover:text-coral/70 text-xs font-semibold" data-id="${aporte.id}" data-meta-id="${meta.id}">
                    Eliminar
                </button>
            </li>
        `).join('');

    return `
    <li class="bg-white rounded-2xl ring-1 ring-tinta/10 p-6">
        <div class="flex justify-between items-center mb-4 cursor-pointer btn-colapsar" data-id="${meta.id}">
            <h2 class="text-xl font-extrabold text-tinta">${meta.nombre}</h2>
            <span class="text-tinta/40 text-sm">✕ Cerrar</span>
        </div>

        <p class="text-tinta/70 mb-1">Objetivo: $${montoObjetivo.toFixed(2)}</p>

        <div class="flex justify-between text-sm text-tinta/50 mb-4">
            <span>Inicio: ${formatearFecha(meta.creado_en)}</span>
            <span>Límite: ${formatearFecha(meta.fecha_limite)}</span>
        </div>

        <div class="w-full bg-fondo rounded-full h-4 mb-1 overflow-hidden">
            <div class="bg-verde h-4 rounded-full" style="width: ${porcentaje}%"></div>
        </div>
        <p class="text-sm text-tinta/50 mb-4">${porcentaje}% completado — ${textoTiempo}</p>

        <div class="flex justify-between items-center border-t border-tinta/10 pt-4 mb-4">
            <div>
                <p class="text-xs text-tinta/40 uppercase font-semibold">Objetivo</p>
                <p class="text-lg font-bold text-tinta">$${montoObjetivo.toFixed(2)}</p>
            </div>
            <div class="text-right">
                <p class="text-xs text-tinta/40 uppercase font-semibold">Recaudado</p>
                <p class="text-lg font-bold text-verde">$${montoActual.toFixed(2)}</p>
            </div>
        </div>

        <form class="form-aporte flex flex-col gap-2 mb-4" data-meta-id="${meta.id}">
            <input type="number" class="input-monto-aporte border border-tinta/15 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-verde" placeholder="Monto del aporte" step="0.01" required />
            <input type="text" class="input-descripcion-aporte border border-tinta/15 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-verde" placeholder="Descripción (opcional)" />
            <button type="submit" class="rounded-lg bg-verde hover:bg-verde-osc text-white font-bold px-4 py-2.5 transition-colors">
                Agregar aporte
            </button>
        </form>

        <ul class="flex flex-col gap-1">${htmlAportes}</ul>

        <button class="btn-eliminar-meta text-coral hover:text-coral/70 text-xs font-semibold mt-4" data-id="${meta.id}">
            Eliminar meta
        </button>
    </li>
    `;
}

lista.addEventListener('click', async (event) => {
    const botonExpandir = event.target.closest('.btn-expandir');
    const botonColapsar = event.target.closest('.btn-colapsar');
    const botonEliminarMeta = event.target.closest('.btn-eliminar-meta');
    const botonEliminarAporte = event.target.closest('.btn-eliminar-aporte');

    if (botonExpandir) {
        const id = Number(botonExpandir.dataset.id);
        metaExpandidaId = id;

        if (!aportesPorMeta[id]) {
            const respuesta = await aportesApi.obtenerPorMeta(id);
            aportesPorMeta[id] = respuesta.aportes;
        }

        pintarLista();
        return;
    }

    if (botonColapsar) {
        metaExpandidaId = null;
        pintarLista();
        return;
    }

    if (botonEliminarMeta) {
        const id = Number(botonEliminarMeta.dataset.id);
        await metasApi.eliminar(id);
        metas = metas.filter((meta) => meta.id !== id);
        metaExpandidaId = null;
        pintarLista();
        return;
    }

    if (botonEliminarAporte) {
        const aporteId = Number(botonEliminarAporte.dataset.id);
        const metaId = Number(botonEliminarAporte.dataset.metaId);
        await aportesApi.eliminar(aporteId);
        await refrescarMeta(metaId);
        return;
    }
});

async function refrescarMeta(metaId) {
    const [resMeta, resAportes] = await Promise.all([
        metasApi.obtenerPorId(metaId),
        aportesApi.obtenerPorMeta(metaId),
    ]);

    const index = metas.findIndex((meta) => meta.id === metaId);
    metas[index] = resMeta.meta;
    aportesPorMeta[metaId] = resAportes.aportes;

    pintarLista();
}

lista.addEventListener('submit', async (event) => {
    const formAporte = event.target.closest('.form-aporte');
    if (!formAporte) return;

    event.preventDefault();

    const metaId = Number(formAporte.dataset.metaId);
    const monto = Number(formAporte.querySelector('.input-monto-aporte').value);
    const descripcion = formAporte.querySelector('.input-descripcion-aporte').value;

    await aportesApi.crear({ meta_id: metaId, monto, descripcion });

    await refrescarMeta(metaId);
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const datos = {
        usuario_id: usuario.id,
        nombre: document.getElementById('nombre-meta').value,
        monto_objetivo: Number(document.getElementById('monto-objetivo').value),
        fecha_limite: document.getElementById('fecha-limite').value || null,
    };

    const respuesta = await metasApi.crear(datos);
    metas.push(respuesta.meta);
    pintarLista();

    form.reset();
});

cargarMetas();