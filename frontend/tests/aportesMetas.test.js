import {
    obtenerPorMeta,
    crear,
    eliminar,
} from '../js/api/aportesMetas.js';

import { get, post, del } from '../js/api/client.js';

jest.mock('../js/api/client.js', () => ({
    get: jest.fn(),
    post: jest.fn(),
    del: jest.fn(),
}));

describe('aportesMetas API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('obtiene los aportes de una meta', () => {
        obtenerPorMeta(4);

        expect(get).toHaveBeenCalledWith('/aportes-metas/meta/4');
    });

    test('crea un aporte con los datos recibidos', () => {
        const datos = {
            meta_id: 4,
            monto: 25000,
            descripcion: 'Ahorro mensual',
        };

        crear(datos);

        expect(post).toHaveBeenCalledWith('/aportes-metas', datos);
    });

    test('elimina un aporte por ID', () => {
        eliminar(8);

        expect(del).toHaveBeenCalledWith('/aportes-metas/8');
    });
});
