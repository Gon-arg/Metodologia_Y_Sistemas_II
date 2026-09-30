// guardProtectedPage() + lee ?id= de la URL, trae la meta y sus aportes, form para nuevo aporte

import { guardProtectedPage } from '../utils/protectedPage.js';
guardProtectedPage();

import * as metasApi from '../api/metasAhorro.js';
import * as aportesApi from '../api/aportesMetas.js';

// Leemos el "id" desde la URL, ej: meta-detalle.html?id=5
const parametros = new URLSearchParams(window.location.search);
const metaId = Number(parametros.get('id'));

let meta = null;
let aportes = [];

const tituloMeta = document.getElementById('nombre-meta-titulo');
const montoObjetivoMeta = document.getElementById('monto-objetivo-meta');
const fechaInicioMeta = document.getElementById('fecha-inicio-meta');
const fechaLimiteMeta = document.getElementById('fecha-limite-meta');
const barraProgreso = document.getElementById('barra-progreso');
const tiempoRestanteMeta = document.getElementById('tiempo-restante-meta');
const montoObjetivoEstado = document.getElementById('monto-objetivo-estado');
const montoActualEstado = document.getElementById('monto-actual-estado');
const form = document.getElementById('form-aporte');
const lista = document.getElementById('lista-aportes');

// Calcula cuantos dias faltan hasta fecha_limite
function calcularDiasRestantes(fechaLimite) {
    const hoy = new Date();
    const limite = new Date(fechaLimite);

    const hoyUTC = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const limiteUTC = Date.UTC(limite.getUTCFullYear(), limite.getUTCMonth(), limite.getUTCDate());

    const diferenciaMs = limiteUTC - hoyUTC;
    return Math.round(diferenciaMs / (1000 * 60 * 60 * 24));
}

// Formatea una fecha ISO a formato legible (ej: "11/02/2027")
function formatearFecha(fechaIso) {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString('es-AR', { timeZone: 'UTC' });
}

async function iniciar() {
    const [resMeta, resAportes] = await Promise.all([
        metasApi.obtenerPorId(metaId),
        aportesApi.obtenerPorMeta(metaId),
    ]);

    meta = resMeta.meta;
    aportes = resAportes.aportes;

    pintarResumen();
    pintarAportes();
}

function pintarResumen() {
    const montoActual = Number(meta.monto_actual);
    const montoObjetivo = Number(meta.monto_objetivo);
    const porcentaje = Math.min(Math.round((montoActual / montoObjetivo) * 100), 100);
    const diasRestantes = calcularDiasRestantes(meta.fecha_limite);

    tituloMeta.textContent = meta.nombre;
    montoObjetivoMeta.textContent = `Objetivo: $${montoObjetivo.toFixed(2)}`;

    fechaInicioMeta.textContent = `Inicio: ${formatearFecha(meta.creado_en)}`;
    fechaLimiteMeta.textContent = `Límite: ${formatearFecha(meta.fecha_limite)}`;

    barraProgreso.style.width = `${porcentaje}%`;

    tiempoRestanteMeta.textContent = diasRestantes >= 0
        ? `${porcentaje}% completado — ${diasRestantes} días restantes`
        : `${porcentaje}% completado — Vencida hace ${Math.abs(diasRestantes)} días`;

    montoObjetivoEstado.textContent = `$${montoObjetivo.toFixed(2)}`;
    montoActualEstado.textContent = `$${montoActual.toFixed(2)}`;
}

function pintarAportes() {
    const html = aportes.map((aporte) => {
        return `
        <li class="flex justify-between items-center border-b border-gray-100 py-2 text-sm">
            <span class="text-gray-700">
                $${aporte.monto} el ${aporte.fecha.split('T')[0]} (${aporte.descripcion || 'sin descripción'})
            </span>
            <button
                class="btn-eliminar text-red-500 hover:text-red-700 text-xs font-medium"
                data-id="${aporte.id}"
            >
                Eliminar
            </button>
        </li>
        `;
    }).join('');

    lista.innerHTML = html;
}

// Crear aporte
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const datos = {
        meta_id: metaId,
        monto: Number(document.getElementById('monto-aporte').value),
        descripcion: document.getElementById('descripcion-aporte').value,
    };

    await aportesApi.crear(datos);

    // Volvemos a pedir todo (meta + aportes) porque el monto_actual de la
    // meta cambio solo en el backend (por el trigger de PostgreSQL) y
    // necesitamos traer ese valor actualizado, no lo podemos calcular aca.
    await iniciar();

    form.reset();
});

// Eliminar aporte
lista.addEventListener('click', async (event) => {
    const boton = event.target.closest('.btn-eliminar');
    if (!boton) return;

    const id = Number(boton.dataset.id);
    await aportesApi.eliminar(id);

    await iniciar(); // mismo motivo: el monto_actual cambia solo
});

iniciar();