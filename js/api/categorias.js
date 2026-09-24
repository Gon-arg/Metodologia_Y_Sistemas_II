// obtenerTodas, obtenerPorId, crear, actualizar, eliminar -> /categorias
// Funciones contra /api/categorias.
import { get, post, put, del } from './client.js';

// { ok, categorias: [...] }
export function obtenerTodas() {
    
}

// { ok, categoria }
export function obtenerPorId(id) {
    
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