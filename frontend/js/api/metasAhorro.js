// obtenerTodas, obtenerPorUsuario(usuario_id), obtenerPorId, crear, actualizar, eliminar -> /metas-ahorro
// Funciones contra /api/metas-ahorro.
import { get, post, put, del } from './client.js';

// { ok, metas: [...] }
export function obtenerTodas() {
    return get('/metas-ahorro');
}

// { ok, metas: [...] } — el backend toma el usuario del token
export function obtenerPorUsuario() {
    return get('/metas-ahorro');
}

// { ok, meta }
export function obtenerPorId(id) {
    return get(`/metas-ahorro/${id}`);
}

// datos = { usuario_id, nombre, monto_objetivo, fecha_limite }
// OJO: no mandar monto_actual ni estado, esos los calcula el backend con un trigger
export function crear(datos) {
    return post('/metas-ahorro', datos);
}

export function actualizar(id, datos) {
    return put(`/metas-ahorro/${id}`, datos);
}

export function eliminar(id) {
    return del(`/metas-ahorro/${id}`);
}