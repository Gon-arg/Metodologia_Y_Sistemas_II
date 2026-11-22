import {
    obtenerTodas,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
} from '../js/api/categorias.js';

import { get, post, put, del } from '../js/api/client.js';

jest.mock('../js/api/client.js', () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    del: jest.fn(),
}));

describe('categorias API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('obtiene todas las categorías', () => {
        obtenerTodas();

        expect(get).toHaveBeenCalledWith('/categorias');
    });

    test('obtiene una categoría por ID', () => {
        obtenerPorId(3);

        expect(get).toHaveBeenCalledWith('/categorias/3');
    });

    test('crea una categoría con los datos recibidos', () => {
        const datos = {
            nombre: 'Transporte',
            tipo: 'gasto',
        };

        crear(datos);

        expect(post).toHaveBeenCalledWith('/categorias', datos);
    });

    test('actualiza una categoría por ID', () => {
        const datos = { nombre: 'Transporte público' };

        actualizar(3, datos);

        expect(put).toHaveBeenCalledWith('/categorias/3', datos);
    });

    test('elimina una categoría por ID', () => {
        eliminar(3);

        expect(del).toHaveBeenCalledWith('/categorias/3');
    });
});
