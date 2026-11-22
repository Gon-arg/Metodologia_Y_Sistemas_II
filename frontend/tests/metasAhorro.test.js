import {
    obtenerTodas,
    obtenerPorUsuario,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
} from '../js/api/metasAhorro.js';

import { get, post, put, del } from '../js/api/client.js';

jest.mock('../js/api/client.js', () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    del: jest.fn(),
}));

describe('metasAhorro API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('obtiene todas las metas', () => {
        obtenerTodas();

        expect(get).toHaveBeenCalledWith('/metas-ahorro');
    });

    test('obtiene las metas del usuario autenticado', () => {
        obtenerPorUsuario();

        expect(get).toHaveBeenCalledWith('/metas-ahorro');
    });

    test('obtiene una meta por ID', () => {
        obtenerPorId(4);

        expect(get).toHaveBeenCalledWith('/metas-ahorro/4');
    });

    test('crea una meta con los datos recibidos', () => {
        const datos = {
            nombre: 'Vacaciones',
            monto_objetivo: 500000,
            fecha_objetivo: '2027-01-01',
        };

        crear(datos);

        expect(post).toHaveBeenCalledWith('/metas-ahorro', datos);
    });

    test('actualiza una meta por ID', () => {
        const datos = { monto_objetivo: 600000 };

        actualizar(4, datos);

        expect(put).toHaveBeenCalledWith('/metas-ahorro/4', datos);
    });

    test('elimina una meta por ID', () => {
        eliminar(4);

        expect(del).toHaveBeenCalledWith('/metas-ahorro/4');
    });
});
