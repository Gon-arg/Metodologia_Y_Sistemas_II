// guardProtectedPage() + categorías básicas siempre visibles + "+" para crear otras
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

// Categorías básicas: siempre aparecen como botones. Se crean en la base
// recién la primera vez que se usan, así no hay que escribir el nombre.
const BASICAS = ['Comida', 'Transporte', 'Viaje', 'Servicios', 'Salud', 'Ocio', 'Ropa', 'Sueldo'];

const listaEl = document.getElementById('lista-categorias');
const nuevaForm = document.getElementById('form-categoria');
const movForm = document.getElementById('movimiento-form');
const elegidaEl = document.getElementById('categoria-elegida');
const msgEl = document.getElementById('movimiento-msg');

let categorias = [];      // categorías que existen en la base
let seleccionada = null;  // { nombre, id }  (id es null si es básica y todavía no existe)

const clave = (nombre) => nombre.trim().toLowerCase();
const buscarExistente = (nombre) => categorias.find((c) => clave(c.nombre) === clave(nombre));

function aviso(texto, ok = true) {
  msgEl.textContent = texto;
  msgEl.className = 'rounded-lg px-3 py-2 text-sm ' + (ok ? 'bg-verde/10 text-verde' : 'bg-coral/10 text-coral');
  msgEl.hidden = false;
}

// Básicas primero (existan o no) y después las que creó el usuario
function itemsVisibles() {
  const basicas = BASICAS.map((nombre) => ({ nombre, id: buscarExistente(nombre)?.id ?? null }));
  const claves = new Set(BASICAS.map(clave));
  const propias = categorias
    .filter((c) => !claves.has(clave(c.nombre)))
    .map((c) => ({ nombre: c.nombre, id: c.id }));
  return [...basicas, ...propias];
}

function pintarCategorias() {
  listaEl.innerHTML = '';

  for (const item of itemsVisibles()) {
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
  pintarCategorias(); // aunque falle la API se ven las básicas
}

// Crear categoría propia con el "+"
nuevaForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = document.getElementById('nombre-categoria');
  const nombre = input.value.trim();
  if (!nombre) return;

  // Si ya existe (básica o propia), solo se elige
  const existente = itemsVisibles().find((i) => clave(i.nombre) === clave(nombre));
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
    // Si es una básica que todavía no existe en la base, se crea ahora
    let categoriaId = seleccionada.id;
    if (categoriaId === null) {
      const respuesta = await categoriasApi.crear({ nombre: seleccionada.nombre });
      categoriaId = respuesta.categoria.id;
      seleccionada = { nombre: seleccionada.nombre, id: categoriaId };
      await cargarCategorias();
    }

    await movimientosApi.crear({
      usuario_id: usuario.id,
      categoria_id: categoriaId,
      tipo,
      monto,
      descripcion: '',
      fecha: new Date().toISOString().slice(0, 10),
    });

    document.getElementById('monto').value = '';
    aviso(`${tipo === 'gasto' ? 'Gasto' : 'Ingreso'} guardado en ${seleccionada.nombre}. Ya figura en el dashboard.`);
  } catch (err) {
    aviso(err.message, false);
  }
});

cargarCategorias();