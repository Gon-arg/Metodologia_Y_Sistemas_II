// Configuración de Tailwind compartida por todas las páginas.
// Se carga como script común (NO como módulo), justo después del script de Tailwind:
//   <script src="https://cdn.tailwindcss.com"></script>
//   <script src="js/tailwind-config.js"></script>
// Para cambiar un color o la tipografía de toda la app, se edita solo acá.
tailwind.config = {
  theme: {
    extend: {
      colors: {
        fondo: '#F3F6F2',                          // fondo general
        tinta: '#1B2B27',                          // texto
        verde: { DEFAULT: '#0F5C4D', osc: '#0A4136' }, // color principal
        ambar: '#E8A33D',                          // avatar
        coral: '#D1495B',                          // gastos / errores
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
};
