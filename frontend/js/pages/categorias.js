// guardProtectedPage() + categorías cargadas desde el backend + "+" para crear otras
// + formulario de movimiento (gasto/ingreso + monto) que alimenta el gráfico del dashboard.
import { guardProtectedPage } from '../utils/protectedPage.js';
guardProtectedPage();

import { getUsuario } from '../store/authStore.js';
import { renderNavbar } from '../components/navbar.js';
import { renderSidebar } from '../components/sidebar.js';
import * as categoriasApi from '../api/categorias.js';
import * as movimientosApi from '../api/movimientos.js';

renderNavbar('navbar');
renderSidebar('sidebar');

const usuario = getUsuario();
const CATEGORIA_AJUSTE = 'Saldo general'; // categoría interna del dashboard, no se muestra acá

const listaEl = document.getElementById('lista-categorias');
const nuevaForm = document.getElementById('form-categoria');
const movForm = document.getElementById('movimiento-form');
const elegidaEl = document.getElementById('categoria-elegida');
const msgEl = document.getElementById('movimiento-msg');

let categorias = [];
let seleccionada = null;

const clave = (nombre) => nombre.trim().toLowerCase();

function aviso(texto, ok = true) {
  msgEl.textContent = texto;
  msgEl.className = 'rounded-lg px-3 py-2 text-sm ' + (ok ? 'bg-verde/10 text-verde' : 'bg-coral/10 text-coral');
  msgEl.hidden = false;
}

function pintarCategorias() {
  listaEl.innerHTML = '';

  for (const item of categorias) {
    const activo = seleccionada && clave(seleccionada.nombre) === clave(item.nombre);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = item.nombre; // textContent: evita inyectar HTML
    btn.setAttribute('aria-pressed', String(Boolean(activo)));
    btn.className = 'rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-verde ' +
      (activo ? 'border-verde bg-verde text-white' : 'border-tinta/20 bg-white hover:border-verde');
    btn.addEventListener('click', () => {
      seleccionada = item;
      elegidaEl.textContent = item.nombre;
      pintarCategorias();
    });
    listaEl.appendChild(btn);
  }

  // Botón "+" para agregar una categoría nueva
  const mas = document.createElement('button');
  mas.type = 'button';
  mas.textContent = '+';
  mas.setAttribute('aria-label', 'Agregar categoría nueva');
  mas.setAttribute('aria-expanded', String(!nuevaForm.hidden));
  mas.className = 'h-10 w-10 rounded-full border border-dashed border-verde text-xl font-bold text-verde hover:bg-verde hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-verde';
  mas.addEventListener('click', () => {
    nuevaForm.hidden = !nuevaForm.hidden;
    mas.setAttribute('aria-expanded', String(!nuevaForm.hidden));
    if (!nuevaForm.hidden) document.getElementById('nombre-categoria').focus();
  });
  listaEl.appendChild(mas);
}

async function cargarCategorias() {
  try {
    const res = await categoriasApi.obtenerTodas();
    categorias = res.categorias.filter((c) => c.nombre !== CATEGORIA_AJUSTE);
  } catch (err) {
    aviso('No se pudieron cargar las categorías: ' + err.message, false);
  }
  pintarCategorias();
}

// Crear categoría propia con el "+"
nuevaForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = document.getElementById('nombre-categoria');
  const nombre = input.value.trim();
  if (!nombre) return;

  // Si ya existe, solo se elige
  const existente = categorias.find((i) => clave(i.nombre) === clave(nombre));
  if (existente) {
    seleccionada = existente;
    elegidaEl.textContent = existente.nombre;
    input.value = '';
    nuevaForm.hidden = true;
    pintarCategorias();
    return;
  }

  try {
    const respuesta = await categoriasApi.crear({ nombre }); // { ok, categoria }
    const cat = respuesta.categoria;
    input.value = '';
    nuevaForm.hidden = true;
    await cargarCategorias();
    seleccionada = { nombre: cat.nombre, id: cat.id }; // queda elegida
    elegidaEl.textContent = cat.nombre;
    pintarCategorias();
  } catch (err) {
    aviso(err.message, false);
  }
});

// Guardar movimiento
movForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const tipo = movForm.elements['tipo'].value;
  const monto = Number(document.getElementById('monto').value);

  if (!seleccionada) return aviso('Elegí una categoría.', false);
  if (!(monto > 0)) return aviso('Ingresá un monto mayor a 0.', false);

  try {
    await movimientosApi.crear({
      usuario_id: usuario.id,
      categoria_id: seleccionada.id,
      tipo,
      monto,
      descripcion: '',
      fecha: new Date().toISOString().slice(0, 10),
    });

    document.getElementById('monto').value = '';

    // El mensaje solo aparece para ingresos; con un gasto se limpia cualquier aviso anterior
    if (tipo === 'ingreso') {
      aviso(`Ingreso guardado en ${seleccionada.nombre}. Ya figura en el dashboard.`);
    } else {
      msgEl.hidden = true;
    }
  } catch (err) {
    aviso(err.message, false);
  }
});

cargarCategorias();