
jest.mock('../../config/conexion-db', () => ({
    query: jest.fn()
}));

process.env.JWT_SECRET = 'clave_test_integracion';

const request = require('supertest');
const Server = require('../../core/server');
const pool = require('../../config/conexion-db');
const { generarToken } = require('../../middlewares/auth.middleware');

const app = new Server().getApp();

describe('Integración - Aportes a metas', () => {
    const usuario = {
        id: 7,
        email: 'test@correo.com'
    };

    const token = generarToken(usuario);

    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();

        consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    test('no debe crear un aporte cuando la meta no pertenece al usuario', async () => {
        pool.query.mockResolvedValueOnce({
            rows: []
        });

        const respuesta = await request(app)
            .post('/api/aportes-metas')
            .set('Authorization', `Bearer ${token}`)
            .send({
                meta_id: 42,
                monto: 500,
                descripcion: 'Ahorro mensual'
            });

        expect(respuesta.status).toBe(404);

        expect(respuesta.body).toEqual({
            ok: false,
            mensaje: 'La meta de ahorro no existe'
        });

        expect(pool.query).toHaveBeenCalledTimes(1);

        expect(pool.query).toHaveBeenCalledWith(
            'SELECT id FROM metas_ahorro WHERE id=$1 AND usuario_id=$2',
            [42, 7]
        );
    });
});
