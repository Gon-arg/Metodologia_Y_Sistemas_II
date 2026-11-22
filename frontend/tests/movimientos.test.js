import {
    obtenerTodos,
    obtenerPorUsuario,
    obtenerPorCategoria,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
} from '../js/api/movimientos.js';

import { get, post, put, del } from '../js/api/client.js';

jest.mock('../js/api/client.js', () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    del: jest.fn(),
}));

describe('movimientos API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('obtiene todos los movimientos', () => {
        obtenerTodos();

        expect(get).toHaveBeenCalledWith('/movimientos');
    });

    test('obtiene los movimientos del usuario autenticado', () => {
        obtenerPorUsuario();

        expect(get).toHaveBeenCalledWith('/movimientos');
    });

    test('obtiene los movimientos de una categoría', () => {
        obtenerPorCategoria(3);

        expect(get).toHaveBeenCalledWith('/movimientos/categoria/3');
    });

    test('obtiene un movimiento por ID', () => {
        obtenerPorId(15);

        expect(get).toHaveBeenCalledWith('/movimientos/15');
    });

    test('crea un movimiento con los datos recibidos', () => {
        const datos = {
            usuario_id: 1,
            categoria_id: 2,
            tipo: 'gasto',
            monto: 5000,
            descripcion: 'Transporte',
            fecha: '2026-11-21',
        };

        crear(datos);

        expect(post).toHaveBeenCalledWith('/movimientos', datos);
    });

    test('actualiza un movimiento por ID', () => {
        const datos = { monto: 7000 };

        actualizar(15, datos);

        expect(put).toHaveBeenCalledWith('/movimientos/15', datos);
    });

    test('elimina un movimiento por ID', () => {
        eliminar(15);

        expect(del).toHaveBeenCalledWith('/movimientos/15');
    });
});
