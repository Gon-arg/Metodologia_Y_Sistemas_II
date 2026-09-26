// Convierte una fecha ISO ("2026-08-01") a formato legible ("01/08/2026").
export function formatDate(fechaISO) {
    if (!fechaISO) return '';
  // Cortamos el string en vez de usar new Date(), para evitar corrimientos
  // de zona horaria (new Date('2026-08-01') puede mostrar el 31/07 según el huso).
    const [anio, mes, dia] = fechaISO.split('T')[0].split('-');
    return `${dia}/${mes}/${anio}`;
}