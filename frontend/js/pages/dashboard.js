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
      movimientosApi.obtenerPorUsuario(usuario.id),
      categoriasApi.obtenerTodas(),
    ]);
    pintarTotal(resMovimientos.movimientos);
    pintarTortaPorCategoria(resMovimientos.movimientos, resCategorias.categorias);
  } catch (err) {
    alert('Error cargando el dashboard: ' + err.message);
  }
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

  // Categorías en negativo (gastaste más de lo que ingresó): se avisa debajo del gráfico
  const negativas = Object.entries(saldos).filter(([, v]) => v < 0).map(([n]) => n);
  const avisoEl = document.getElementById('aviso-negativas');
  avisoEl.textContent = negativas.length
    ? `En ${negativas.join(', ')} gastaste más de lo que ingresó, por eso no aparece en el gráfico.`
    : '';
  avisoEl.hidden = negativas.length === 0;

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
        legend: { position: 'bottom', labels: { usePointStyle: true, font: { family: 'Manrope' } } },
        tooltip: { callbacks: { label: (c) => ` ${c.label}: ${formatCurrency(c.parsed)}` } },
      },
    },
  });
}

// --- Saldo actual: guarda solo la diferencia como movimiento de "Ajuste de saldo" ---
async function obtenerCategoriaAjuste() {
  const res = await categoriasApi.obtenerTodas();
  const existente = res.categorias.find((c) => c.nombre === CATEGORIA_AJUSTE);
  if (existente) return existente.id;
  const creada = await categoriasApi.crear({ nombre: CATEGORIA_AJUSTE }); // TODO: ajustar al nombre/forma real de tu API
  return (creada.categoria || creada).id;
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
    await movimientosApi.crear({ // TODO: ajustar al nombre real de tu función
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