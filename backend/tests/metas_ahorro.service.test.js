
jest.mock('../config/conexion-db', () => ({
    query: jest.fn()
}));

const pool = require('../config/conexion-db');

const {
    obtenerPorUsuario,
    obtenerPorId,
    crear,
    actualizar,
    eliminar
} = require('../services/metas_ahorro.service');

describe('Metas de ahorro - Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('obtenerPorUsuario', () => {
        test('debe devolver las metas del usuario', async () => {
            const metas = [
                { id: 1, nombre: 'Vacaciones', monto_objetivo: '50000.00' }
            ];

            pool.query.mockResolvedValue({ rows: metas });

            const resultado = await obtenerPorUsuario(10);

            expect(resultado).toEqual(metas);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE usuario_id=$1'),
                [10]
            );
        });

        test('debe devolver un array vacío si no hay metas', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            const resultado = await obtenerPorUsuario(10);

            expect(resultado).toEqual([]);
        });
    });

    describe('obtenerPorId', () => {
        test('debe devolver una meta existente', async () => {
            const meta = {
                id: 1,
                usuario_id: 10,
                nombre: 'Vacaciones'
            };

            pool.query.mockResolvedValue({ rows: [meta] });

            const resultado = await obtenerPorId(1, 10);

            expect(resultado).toEqual(meta);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE id=$1 AND usuario_id=$2'),
                [1, 10]
            );
        });

        test('debe lanzar error si la meta no existe o no pertenece al usuario', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(obtenerPorId(99, 10))
                .rejects.toThrow('Meta no encontrada');
        });
    });

    describe('crear', () => {
        test('debe crear una meta con datos válidos', async () => {
            const meta = {
                id: 1,
                usuario_id: 10,
                nombre: 'Vacaciones',
                monto_objetivo: '50000.00',
                monto_actual: '10000.00',
                estado: 'en proceso'
            };

            pool.query.mockResolvedValue({ rows: [meta] });

            const resultado = await crear(
                10,
                'Vacaciones',
                50000,
                10000,
                'en proceso',
                '2027-12-31'
            );

            expect(resultado).toEqual(meta);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO metas_ahorro'),
                [10, 'Vacaciones', 50000, 10000, 'en proceso', '2027-12-31']
            );
        });

        test('debe utilizar los valores predeterminados si no se proporciona monto actual ni estado', async () => {
            const meta = {
                id: 1,
                usuario_id: 10,
                nombre: 'Vacaciones',
                monto_actual: '0.00',
                estado: 'en proceso'
            };

            pool.query.mockResolvedValue({ rows: [meta] });

            const resultado = await crear(
                10,
                'Vacaciones',
                50000,
                undefined,
                undefined,
                undefined
            );

            expect(resultado).toEqual(meta);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('COALESCE($4,0.00)'),
                [10, 'Vacaciones', 50000, undefined, undefined, null]
            );
        });
    });

    describe('actualizar', () => {
        test('debe actualizar varios campos de una meta', async () => {
            const meta = {
                id: 1,
                usuario_id: 10,
                nombre: 'Viaje',
                monto_objetivo: '80000.00'
            };

            pool.query.mockResolvedValue({ rows: [meta] });

            const resultado = await actualizar(
                1,
                10,
                'Viaje',
                80000,
                undefined,
                undefined,
                undefined
            );

            expect(resultado).toEqual(meta);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE metas_ahorro'),
                ['Viaje', 80000, 1, 10]
            );
        });

        test('debe actualizar solamente el nombre', async () => {
            const meta = {
                id: 1,
                usuario_id: 10,
                nombre: 'Nuevo nombre'
            };

            pool.query.mockResolvedValue({ rows: [meta] });

            const resultado = await actualizar(
                1,
                10,
                'Nuevo nombre',
                undefined,
                undefined,
                undefined,
                undefined
            );

            expect(resultado).toEqual(meta);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('SET nombre=$1'),
                ['Nuevo nombre', 1, 10]
            );
        });

        test('debe lanzar error si la meta no existe o no pertenece al usuario', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(actualizar(
                99,
                10,
                'Nuevo nombre',
                undefined,
                undefined,
                undefined,
                undefined
            )).rejects.toThrow('Meta no encontrada');
        });

        test('debe lanzar error si no hay campos para actualizar', async () => {
            await expect(actualizar(
                1,
                10,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined
            )).rejects.toThrow('No hay datos para actualizar');

            expect(pool.query).not.toHaveBeenCalled();
        });
    });

    describe('eliminar', () => {
        test('debe eliminar una meta existente', async () => {
            const meta = {
                id: 1,
                usuario_id: 10,
                nombre: 'Vacaciones'
            };

            pool.query.mockResolvedValue({ rows: [meta] });

            const resultado = await eliminar(1, 10);

            expect(resultado).toEqual(meta);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM metas_ahorro'),
                [1, 10]
            );
        });

        test('debe lanzar error si la meta no existe o no pertenece al usuario', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(eliminar(99, 10))
                .rejects.toThrow('Meta no encontrada');
        });
    });
});
