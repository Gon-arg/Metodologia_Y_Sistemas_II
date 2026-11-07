
jest.mock('../../config/conexion-db', () => ({
    query: jest.fn()
}));

process.env.JWT_SECRET = 'clave_test_integracion';

const request = require('supertest');
const Server = require('../../core/server');
const pool = require('../../config/conexion-db');
const { generarToken } = require('../../middlewares/auth.middleware');

const app = new Server().getApp();

describe('Integración - Movimientos', () => {
    const usuario = {
        id: 7,
        email: 'test@correo.com'
    };

    const token = generarToken(usuario);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('debe crear un movimiento y responder con los datos creados', async () => {
        const movimientoCreado = {
            id: 15,
            usuario_id: 7,
            categoria_id: 3,
            tipo: 'gasto',
            monto: 1250.50,
            descripcion: 'Compra supermercado',
            fecha: '2026-11-06',
            creado_en: '2026-11-06T12:00:00.000Z'
        };

        pool.query.mockResolvedValueOnce({
            rows: [movimientoCreado]
        });

        const respuesta = await request(app)
            .post('/api/movimientos')
            .set('Authorization', `Bearer ${token}`)
            .send({
                usuario_id: 999,
                categoria_id: 3,
                tipo: 'gasto',
                monto: 1250.50,
                descripcion: 'Compra supermercado',
                fecha: '2026-11-06'
            });

        expect(respuesta.status).toBe(201);
        expect(respuesta.body.ok).toBe(true);
        expect(respuesta.body.mensaje).toBe('Movimiento creado correctamente');
        expect(respuesta.body.movimiento).toEqual(movimientoCreado);

        expect(pool.query).toHaveBeenCalledTimes(1);
        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO movimientos'),
            [7, 3, 'gasto', 1250.50, 'Compra supermercado', '2026-11-06']
        );
    });
});
