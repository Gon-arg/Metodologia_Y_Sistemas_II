// guardProtectedPage() + trae movimientos del usuario -> pinta saldo, torta y total actual
import { guardProtectedPage } from '../utils/protectedPage.js';
guardProtectedPage(); // si no hay sesión, esto redirige a login.html y corta acá

import { getUsuario } from '../store/authStore.js';
import { renderNavbar } from '../components/navbar.js';
import { renderSidebar } from '../components/sidebar.js';
import * as movimientosApi from '../api/movimientos.js';
import * as categoriasApi from '../api/categorias.js';
import { formatCurrency } from '../utils/formatCurrency.js';

renderNavbar('navbar');
renderSidebar('sidebar');

const usuario = getUsuario();
const CATEGORIA_AJUSTE = 'Saldo general'; // el saldo que ingresa el usuario sin asignar a una categoría

document.getElementById('nombre-usuario').textContent = (usuario.nombre || '').split(' ')[0];

let grafico = null;
let balanceActual = 0;

async function cargarDashboard() {
  try {
    const [resMovimientos, resCategorias] = await Promise.all([
      movimientosApi.obtenerPorUsuario(),
      categoriasApi.obtenerTodas(),
    ]);
    pintarTotal(resMovimientos.movimientos);
    pintarTortaPorCategoria(resMovimientos.movimientos, resCategorias.categorias);
    actualizarFormSaldo(resMovimientos.movimientos, resCategorias.categorias);
  } catch (err) {
    alert('Error cargando el dashboard: ' + err.message);
  }
}

// El saldo se ingresa una sola vez: si ya hay un movimiento en "Saldo general", se oculta el formulario.
// Se deduce de los datos (no del navegador), así sigue oculto aunque cambies de dispositivo.
function actualizarFormSaldo(movimientos, categorias) {
  const cat = categorias.find((c) => c.nombre === CATEGORIA_AJUSTE);
  const yaIngresado = Boolean(cat) && movimientos.some((m) => Number(m.categoria_id) === Number(cat.id));
  document.getElementById('saldo-form').hidden = yaIngresado;
}

function pintarTotal(movimientos) {
  balanceActual = 0;
  for (const mov of movimientos) {
    const monto = Number(mov.monto); // el backend manda el DECIMAL como string
    balanceActual += mov.tipo === 'ingreso' ? monto : -monto;
  }
  document.getElementById('total-balance').textContent = formatCurrency(balanceActual);
  document.getElementById('saldo-input').placeholder = formatCurrency(balanceActual);
}

// Porcentaje de una porción respecto del total del gráfico (ej: "35%", o "<1%" si es muy chica)
function formatearPorcentaje(valor, total) {
  const p = (valor / total) * 100;
  return p < 1 ? '<1%' : `${Math.round(p)}%`;
}

// Dibuja el porcentaje dentro de cada porción de la torta (sin librerías extra)
const pluginPorcentajes = {
  id: 'porcentajes',
  afterDatasetsDraw(chart) {
    const datos = chart.data.datasets[0].data;
    const total = datos.reduce((a, b) => a + b, 0);
    if (!total) return;

    const ctx = chart.ctx;
    ctx.save();
    ctx.font = '700 13px Manrope, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'; // sombra suave para que se lea sobre colores claros
    ctx.shadowBlur = 3;

    chart.getDatasetMeta(0).data.forEach((arco, i) => {
      if (!chart.getDataVisibility(i)) return; // porción oculta desde la leyenda
      if ((datos[i] / total) * 100 < 4) return; // porciones muy chicas: el texto no entra
      const { x, y } = arco.tooltipPosition();
      ctx.fillText(formatearPorcentaje(datos[i], total), x, y);
    });
    ctx.restore();
  },
};

function pintarTortaPorCategoria(movimientos, categorias) {
  const nombrePorCategoria = {};
  for (const cat of categorias) nombrePorCategoria[cat.id] = cat.nombre;

  // Saldo por categoría = ingresos - gastos de esa categoría
  const saldos = {};
  for (const mov of movimientos) {
    const nombre = nombrePorCategoria[mov.categoria_id] || 'Sin categoría';
    const monto = Number(mov.monto);
    saldos[nombre] = (saldos[nombre] || 0) + (mov.tipo === 'ingreso' ? monto : -monto);
  }

  // Una torta solo puede mostrar porciones positivas
  const etiquetas = [];
  const valores = [];
  for (const [nombre, saldo] of Object.entries(saldos)) {
    if (saldo > 0) { etiquetas.push(nombre); valores.push(saldo); }
  }

  document.getElementById('sin-datos').hidden = valores.length > 0;

  const total = valores.reduce((a, b) => a + b, 0);

  if (grafico) grafico.destroy();
  grafico = new window.Chart(document.getElementById('grafico-saldo'), {
    type: 'pie',
    data: {
      labels: etiquetas,
      datasets: [{
        data: valores,
        backgroundColor: ['#0F5C4D', '#E8A33D', '#D1495B', '#3A7CA5', '#7A5C99', '#8AA29E', '#C97B2B', '#2F9E7A'],
        borderColor: '#fff',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            font: { family: 'Manrope' },
            // Una entrada por porción, con el porcentaje: "Alimentos (35%)"
            generateLabels: (chart) => {
              const dataset = chart.data.datasets[0];
              return chart.data.labels.map((etiqueta, i) => ({
                text: `${etiqueta} (${formatearPorcentaje(valores[i], total)})`,
                fillStyle: dataset.backgroundColor[i % dataset.backgroundColor.length],
                strokeStyle: dataset.borderColor,
                lineWidth: dataset.borderWidth,
                pointStyle: 'circle',
                hidden: !chart.getDataVisibility(i),
                index: i, // el clic en la leyenda usa este índice para ocultar la porción
              }));
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (c) => ` ${c.label}: ${formatCurrency(c.parsed)} (${formatearPorcentaje(c.parsed, total)})`,
          },
        },
      },
    },
    plugins: [pluginPorcentajes],
  });
}

// --- Saldo actual: guarda solo la diferencia como movimiento de "Saldo general" ---
async function obtenerCategoriaAjuste() {
  const res = await categoriasApi.obtenerTodas();
  const existente = res.categorias.find((c) => c.nombre === CATEGORIA_AJUSTE);
  if (existente) return existente.id;
  const creada = await categoriasApi.crear({ nombre: CATEGORIA_AJUSTE }); // { ok, categoria }
  return creada.categoria.id;
}

function avisoSaldo(texto, ok = true) {
  const el = document.getElementById('saldo-msg');
  el.textContent = texto;
  el.className = 'mt-2 text-sm ' + (ok ? 'text-verde' : 'text-coral');
  el.hidden = false;
}

document.getElementById('saldo-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = document.getElementById('saldo-input');
  if (input.value === '') return avisoSaldo('Ingresá un monto.', false);

  const diferencia = Number(input.value) - balanceActual;
  if (diferencia === 0) return avisoSaldo('Ese ya es tu saldo actual.');

  try {
    const categoria_id = await obtenerCategoriaAjuste();
    await movimientosApi.crear({
      usuario_id: usuario.id,
      categoria_id,
      tipo: diferencia > 0 ? 'ingreso' : 'gasto',
      monto: Math.abs(diferencia),
      descripcion: 'Saldo general',
      fecha: new Date().toISOString().slice(0, 10),
    });
    input.value = '';
    avisoSaldo('Saldo actualizado.');
    cargarDashboard();
  } catch (err) {
    avisoSaldo(err.message, false);
  }
});

cargarDashboard();