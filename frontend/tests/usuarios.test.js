import { actualizar } from '../js/api/usuarios.js';
import { put } from '../js/api/client.js';

jest.mock('../js/api/client.js', () => ({
    put: jest.fn(),
}));

describe('usuarios API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('actualiza un usuario por ID con los datos recibidos', () => {
        const datos = {
            nombre: 'Ricardo',
            email: 'ricardo@example.com',
        };

        actualizar(5, datos);

        expect(put).toHaveBeenCalledWith('/usuarios/5', datos);
    });
});
