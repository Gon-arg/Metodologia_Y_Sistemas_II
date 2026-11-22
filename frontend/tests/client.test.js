import { request, get, post, put, del } from '../js/api/client.js';
import { getToken } from '../js/store/authStore.js';

jest.mock('../js/config.js', () => ({
    API_BASE_URL: 'http://localhost:3000/api',
}));

jest.mock('../js/store/authStore.js', () => ({
    getToken: jest.fn(),
}));

describe('client API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        globalThis.fetch = jest.fn();
        getToken.mockReturnValue(null);
    });

    test('realiza una petición GET con la URL y los headers correspondientes', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ datos: [] }),
        });

        const resultado = await get('/movimientos');

        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:3000/api/movimientos',
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                body: undefined,
            }
        );

        expect(resultado).toEqual({ datos: [] });
    });

    test('agrega el token JWT cuando existe una sesión', async () => {
        getToken.mockReturnValue('token-prueba');

        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ ok: true }),
        });

        await get('/usuarios');

        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:3000/api/usuarios',
            expect.objectContaining({
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer token-prueba',
                },
            })
        );
    });

    test('permite agregar headers personalizados', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        await request('/usuarios', {
            headers: {
                'X-Test': 'valor-prueba',
            },
        });

        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: {
                    'Content-Type': 'application/json',
                    'X-Test': 'valor-prueba',
                },
            })
        );
    });

    test('realiza una petición POST y convierte el body a JSON', async () => {
        const datos = { nombre: 'Transporte', monto: 5000 };

        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ id: 1 }),
        });

        await post('/movimientos', datos);

        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:3000/api/movimientos',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(datos),
            })
        );
    });

    test('realiza una petición PUT', async () => {
        const datos = { monto: 7000 };

        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ actualizado: true }),
        });

        await put('/movimientos/1', datos);

        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:3000/api/movimientos/1',
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify(datos),
            })
        );
    });

    test('realiza una petición DELETE', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ eliminado: true }),
        });

        await del('/movimientos/1');

        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:3000/api/movimientos/1',
            expect.objectContaining({
                method: 'DELETE',
                body: undefined,
            })
        );
    });

    test('lanza un error cuando el backend responde con un error de texto', async () => {
        fetch.mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'No autorizado' }),
        });

        await expect(get('/usuarios')).rejects.toThrow('No autorizado');
    });

    test('concatena los errores cuando el backend devuelve un array', async () => {
        fetch.mockResolvedValue({
            ok: false,
            json: async () => ({
                error: ['Nombre obligatorio', 'Email inválido'],
            }),
        });

        await expect(get('/usuarios')).rejects.toThrow(
            'Nombre obligatorio Email inválido'
        );
    });

    test('utiliza el mensaje cuando el backend devuelve la propiedad mensaje', async () => {
        fetch.mockResolvedValue({
            ok: false,
            json: async () => ({ mensaje: 'Recurso no encontrado' }),
        });

        await expect(get('/usuarios/99')).rejects.toThrow(
            'Recurso no encontrado'
        );
    });

    test('utiliza un mensaje genérico cuando no hay información del error', async () => {
        fetch.mockResolvedValue({
            ok: false,
            json: async () => null,
        });

        await expect(get('/usuarios')).rejects.toThrow(
            'Ocurrió un error al conectar con el servidor.'
        );
    });

    test('devuelve null cuando la respuesta exitosa no contiene JSON', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: async () => {
                throw new Error('Respuesta sin contenido');
            },
        });

        const resultado = await del('/movimientos/1');

        expect(resultado).toBeNull();
    });
});
