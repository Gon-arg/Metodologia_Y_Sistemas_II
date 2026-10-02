// Formatea un número como moneda argentina: $ 1.234,56
export function formatCurrency(valor) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(valor) || 0);
}
