// Barra lateral: botones CATEGORÍAS / MOVIMIENTOS / METAS AHORRO / RESUMEN.
// Uso: renderSidebar('sidebar')  (id del contenedor)
const LINKS = [
  { href: 'categorias.html',  texto: 'Categorías' },
  { href: 'movimientos.html', texto: 'Movimientos' },
  { href: 'metas.html',       texto: 'Metas ahorro' },
  { href: 'dashboard.html',   texto: 'Resumen' },
];

export function renderSidebar(containerId) {
  const contenedor = document.getElementById(containerId);
  if (!contenedor) return;

  const actual = location.pathname.split('/').pop() || 'dashboard.html';

  const botones = LINKS.map(({ href, texto }) => {
    const activo = href === actual || (actual === 'meta-detalle.html' && href === 'metas.html');
    const clases = activo
      ? 'bg-white text-verde border-white'
      : 'text-white border-white/40 hover:bg-white/10';
    return `<a href="${href}" ${activo ? 'aria-current="page"' : ''}
      class="block whitespace-nowrap rounded-lg border px-4 py-3 text-sm font-bold uppercase tracking-wide text-center transition-colors ${clases}">${texto}</a>`;
  }).join('');

  contenedor.innerHTML = `
    <aside class="bg-verde text-white md:min-h-screen">
      <a href="dashboard.html" class="block px-6 py-5 text-xl font-extrabold tracking-tight">Finanzas</a>
      <nav aria-label="Principal" class="flex md:flex-col gap-2 px-4 pb-4 overflow-x-auto">${botones}</nav>
    </aside>`;
}