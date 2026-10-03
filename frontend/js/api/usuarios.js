// actualizar(id, datos) -> PUT /usuarios/:id
// Funciones contra /api/usuarios. Usan client.js, que ya agrega BASE_URL y el token.
import { put } from './client.js';

// datos puede llevar cualquiera de estos campos: { nombre, email, password }
// Devuelve { ok, mensaje, usuario }
export function actualizar(id, datos) {
    return put(`/usuarios/${id}`, datos);
}
