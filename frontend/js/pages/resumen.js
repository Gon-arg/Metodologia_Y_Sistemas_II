import { guardProtectedPage } from '../utils/protectedPage.js';
guardProtectedPage();

import { getUsuario } from '../store/authStore.js';
import * as movimientosApi from '../api/movimientos.js';
import * as categoriasApi from '../api/categorias.js';
import * as metasApi from '../api/metasAhorro.js';
import { renderNavbar } from '../components/navbar.js';
import { renderSidebar } from '../components/sidebar.js';

renderSidebar('sidebar');
renderNavbar('navbar');

const usuario = getUsuario();

let movimientos = [];
let categorias = [];
let metas = [];

async function cargarDatos() {
    const [resMovimientos, resCategorias, resMetas] = await Promise.all([
        movimientosApi.obtenerPorUsuario(usuario.id),
        categoriasApi.obtenerTodas(),
        metasApi.obtenerPorUsuario(usuario.id),
    ]);

    movimientos = resMovimientos.movimientos;
    categorias = resCategorias.categorias;
    metas = resMetas.metas;
    }

    // Cada boton despliega su propia respuesta (toggle), sin tocar las demas
    function toggleRespuesta(idDiv, texto) {
    const div = document.getElementById(idDiv);
    const yaEstabaAbierto = !div.classList.contains('hidden');

    if (yaEstabaAbierto) {
        div.classList.add('hidden');
        return;
    }

    div.textContent = texto;
    div.classList.remove('hidden');
    }

    function mesDe(fechaISO) {
    return fechaISO.split('T')[0].slice(0, 7);
    }
    function mesActual() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    return `${hoy.getFullYear()}-${mes}`;
    }

    function mesAnterior() {
    const hoy = new Date();
    hoy.setMonth(hoy.getMonth() - 1);
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    return `${hoy.getFullYear()}-${mes}`;
    }

    function totalGastosDelMes(mesBuscado) {
    return movimientos
        .filter((m) => m.tipo === 'gasto' && mesDe(m.fecha) === mesBuscado)
        .reduce((suma, m) => suma + Number(m.monto), 0);
    }

    document.getElementById('btn-gasto-mes').addEventListener('click', () => {
    const total = totalGastosDelMes(mesActual());
    toggleRespuesta('resp-gasto-mes', `Este mes gastaste $${total.toFixed(2)}.`);
    });

    document.getElementById('btn-categoria-top').addEventListener('click', () => {
    const gastosDelMes = movimientos.filter(
        (m) => m.tipo === 'gasto' && mesDe(m.fecha) === mesActual()
    );

    if (gastosDelMes.length === 0) {
        toggleRespuesta('resp-categoria-top', 'Todavía no cargaste gastos este mes.');
        return;
    }

    const totalesPorCategoria = {};
    gastosDelMes.forEach((m) => {
        totalesPorCategoria[m.categoria_id] = (totalesPorCategoria[m.categoria_id] || 0) + Number(m.monto);
    });

    let categoriaTopId = null;
    let montoTop = 0;
    for (const [categoriaId, monto] of Object.entries(totalesPorCategoria)) {
        if (monto > montoTop) {
        montoTop = monto;
        categoriaTopId = Number(categoriaId);
        }
    }

    const categoria = categorias.find((c) => c.id === categoriaTopId);
    const nombre = categoria ? categoria.nombre : 'Sin categoría';

    toggleRespuesta('resp-categoria-top', `Este mes gastaste más en "${nombre}": $${montoTop.toFixed(2)}.`);
    });

    document.getElementById('btn-comparacion').addEventListener('click', () => {
    const totalActual = totalGastosDelMes(mesActual());
    const totalAnterior = totalGastosDelMes(mesAnterior());

    if (totalAnterior === 0) {
        toggleRespuesta(
        'resp-comparacion',
        `Este mes gastaste $${totalActual.toFixed(2)}. No hay datos del mes anterior para comparar.`
        );
        return;
    }

    const diferencia = ((totalActual - totalAnterior) / totalAnterior) * 100;
    const palabra = diferencia >= 0 ? 'más' : 'menos';

    toggleRespuesta(
        'resp-comparacion',
        `Gastaste ${Math.abs(diferencia).toFixed(0)}% ${palabra} que el mes pasado ` +
        `($${totalActual.toFixed(2)} vs $${totalAnterior.toFixed(2)}).`
    );
    });

    document.getElementById('btn-metas').addEventListener('click', () => {
    if (metas.length === 0) {
        toggleRespuesta('resp-metas', 'Todavía no creaste ninguna meta de ahorro.');
        return;
    }

    const texto = metas
        .map((meta) => {
        const porcentaje = Math.round((meta.monto_actual / meta.monto_objetivo) * 100);
        return `"${meta.nombre}": ${porcentaje}% completada`;
        })
        .join(' · ');

    toggleRespuesta('resp-metas', texto);
    });

cargarDatos();