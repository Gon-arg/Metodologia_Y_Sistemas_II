// obtenerTodas, obtenerPorId, crear, actualizar, eliminar -> /categorias
// Funciones contra /api/categorias.
import { get, post, put, del } from './client.js';

export function obtenerTodas() {
    return get('/categorias');
}

export function obtenerPorId(id) {
    return get(`/categorias/${id}`);
}

// { nombre }
export function crear(datos) {
    return post('/categorias', datos);
}

export function actualizar(id, datos) {
    return put(`/categorias/${id}`, datos);
}

export function eliminar(id) {
    return del(`/categorias/${id}`);
}