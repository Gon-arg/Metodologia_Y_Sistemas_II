// BASE_URL de la API. En local usa el backend de Docker; en cualquier otro dominio usa el backend publicado.
const esLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_BASE_URL = esLocal
  ? 'http://localhost:3000/api'
  : 'https://finanzas-deploy-test.onrender.com/api';