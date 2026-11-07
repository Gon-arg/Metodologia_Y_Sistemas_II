
jest.mock('../config/conexion-db', () => ({
    query: jest.fn()
}));

const pool = require('../config/conexion-db');

const {
    obtenerPorId,
    obtenerPorUsuario,
    obtenerPorCategoria,
    crear,
    actualizar,
    eliminar
} = require('../services/movimientos.service');

describe('Movimientos - Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('obtenerPorId', () => {
        test('debe devolver un movimiento existente del usuario', async () => {
            const movimiento = {
                id: 1,
                usuario_id: 10,
                tipo: 'gasto',
                monto: '1500.00'
            };

            pool.query.mockResolvedValue({ rows: [movimiento] });

            const resultado = await obtenerPorId(1, 10);

            expect(resultado).toEqual(movimiento);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE id=$1 AND usuario_id=$2'),
                [1, 10]
            );
        });

        test('debe lanzar error si el movimiento no existe o no pertenece al usuario', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(obtenerPorId(99, 10))
                .rejects.toThrow('Movimiento no encontrado');
        });
    });

    describe('obtenerPorUsuario', () => {
        test('debe devolver los movimientos del usuario ordenados por fecha e ID descendente', async () => {
            const movimientos = [
                { id: 2, usuario_id: 10, tipo: 'gasto' },
                { id: 1, usuario_id: 10, tipo: 'ingreso' }
            ];

            pool.query.mockResolvedValue({ rows: movimientos });

            const resultado = await obtenerPorUsuario(10);

            expect(resultado).toEqual(movimientos);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'WHERE usuario_id=$1 ORDER BY fecha DESC,id DESC'
                ),
                [10]
            );
        });

        test('debe devolver un array vacío si el usuario no tiene movimientos', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            const resultado = await obtenerPorUsuario(10);

            expect(resultado).toEqual([]);
        });
    });

    describe('obtenerPorCategoria', () => {
        test('debe devolver los movimientos de una categoría pertenecientes al usuario y ordenados por fecha e ID descendente', async () => {
            const movimientos = [
                { id: 1, usuario_id: 10, categoria_id: 3, tipo: 'gasto' }
            ];

            pool.query.mockResolvedValue({ rows: movimientos });

            const resultado = await obtenerPorCategoria(3, 10);

            expect(resultado).toEqual(movimientos);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'WHERE categoria_id=$1 AND usuario_id=$2 ORDER BY fecha DESC,id DESC'
                ),
                [3, 10]
            );
        });
    });

    describe('crear', () => {
        test('debe crear un movimiento con datos válidos', async () => {
            const movimiento = {
                id: 1,
                usuario_id: 10,
                categoria_id: 3,
                tipo: 'gasto',
                monto: '1500.00',
                descripcion: 'Compra de alimentos',
                fecha: '2026-10-30'
            };

            pool.query.mockResolvedValue({ rows: [movimiento] });

            const resultado = await crear(
                10,
                3,
                'gasto',
                1500,
                'Compra de alimentos',
                '2026-10-30'
            );

            expect(resultado).toEqual(movimiento);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO movimientos'),
                [10, 3, 'gasto', 1500, 'Compra de alimentos', '2026-10-30']
            );
        });

        test('debe guardar null cuando no se proporciona una descripción', async () => {
            const movimiento = {
                id: 1,
                usuario_id: 10,
                categoria_id: 3,
                tipo: 'gasto',
                monto: '1500.00',
                descripcion: null
            };

            pool.query.mockResolvedValue({ rows: [movimiento] });

            const resultado = await crear(
                10,
                3,
                'gasto',
                1500,
                undefined,
                '2026-10-30'
            );

            expect(resultado).toEqual(movimiento);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO movimientos'),
                [10, 3, 'gasto', 1500, null, '2026-10-30']
            );
        });
    });

    describe('actualizar', () => {
        test('debe actualizar varios campos de un movimiento', async () => {
            const movimiento = {
                id: 1,
                usuario_id: 10,
                categoria_id: 4,
                tipo: 'gasto',
                monto: '2500.00'
            };

            pool.query.mockResolvedValue({ rows: [movimiento] });

            const resultado = await actualizar(
                1,
                10,
                4,
                'gasto',
                2500,
                undefined,
                undefined
            );

            expect(resultado).toEqual(movimiento);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE movimientos'),
                [4, 'gasto', 2500, 1, 10]
            );
        });

        test('debe actualizar solamente la descripción', async () => {
            const movimiento = {
                id: 1,
                usuario_id: 10,
                descripcion: 'Nueva descripción'
            };

            pool.query.mockResolvedValue({ rows: [movimiento] });

            const resultado = await actualizar(
                1,
                10,
                undefined,
                undefined,
                undefined,
                'Nueva descripción',
                undefined
            );

            expect(resultado).toEqual(movimiento);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('SET descripcion=$1'),
                ['Nueva descripción', 1, 10]
            );
        });

        test('debe actualizar solamente la fecha', async () => {
            const movimiento = {
                id: 1,
                usuario_id: 10,
                fecha: '2026-11-01'
            };

            pool.query.mockResolvedValue({ rows: [movimiento] });

            const resultado = await actualizar(
                1,
                10,
                undefined,
                undefined,
                undefined,
                undefined,
                '2026-11-01'
            );

            expect(resultado).toEqual(movimiento);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('SET fecha=$1'),
                ['2026-11-01', 1, 10]
            );
        });

        test('debe lanzar error si el movimiento no existe o no pertenece al usuario', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(actualizar(
                99,
                10,
                undefined,
                undefined,
                2000,
                undefined,
                undefined
            )).rejects.toThrow('Movimiento no encontrado');
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
        test('debe eliminar un movimiento existente del usuario', async () => {
            const movimiento = {
                id: 1,
                usuario_id: 10,
                tipo: 'gasto',
                monto: '1500.00'
            };

            pool.query.mockResolvedValue({ rows: [movimiento] });

            const resultado = await eliminar(1, 10);

            expect(resultado).toEqual(movimiento);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM movimientos'),
                [1, 10]
            );
        });

        test('debe lanzar error si el movimiento no existe o no pertenece al usuario', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(eliminar(99, 10))
                .rejects.toThrow('Movimiento no encontrado');
        });
    });
});
