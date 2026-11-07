jest.mock('../config/conexion-db', () => ({
    query: jest.fn()
}));

const pool = require('../config/conexion-db');
const {
    obtenerPorUsuario,
    obtenerPorId,
    obtenerPorMeta,
    crear,
    actualizar,
    eliminar
} = require('../services/aportes_metas.service');

describe('Aportes de metas - Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('obtenerPorUsuario', () => {
        test('debe devolver los aportes del usuario ordenados por fecha e id', async () => {
            const aportes = [{ id: 1, meta_id: 2, monto: '5000.00' }];
            pool.query.mockResolvedValue({ rows: aportes });

            const resultado = await obtenerPorUsuario(10);

            expect(resultado).toEqual(aportes);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE m.usuario_id=$1'),
                [10]
            );
            expect(pool.query.mock.calls[0][0]).toContain(
                'ORDER BY a.fecha DESC,a.id DESC'
            );
        });

        test('debe devolver un array vacío si no hay aportes', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            const resultado = await obtenerPorUsuario(10);

            expect(resultado).toEqual([]);
        });
    });

    describe('obtenerPorId', () => {
        test('debe devolver un aporte existente', async () => {
            const aporte = { id: 1, meta_id: 2, monto: '5000.00' };
            pool.query.mockResolvedValue({ rows: [aporte] });

            const resultado = await obtenerPorId(1, 10);

            expect(resultado).toEqual(aporte);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE a.id=$1 AND m.usuario_id=$2'),
                [1, 10]
            );
        });

        test('debe lanzar error si el aporte no existe o no pertenece al usuario', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(obtenerPorId(99, 10))
                .rejects.toThrow('Aporte no encontrado');
        });
    });

    describe('obtenerPorMeta', () => {
        test('debe devolver los aportes de una meta del usuario ordenados', async () => {
            const aportes = [{ id: 1, meta_id: 2, monto: '5000.00' }];
            pool.query.mockResolvedValue({ rows: aportes });

            const resultado = await obtenerPorMeta(2, 10);

            expect(resultado).toEqual(aportes);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE a.meta_id=$1 AND m.usuario_id=$2'),
                [2, 10]
            );
            expect(pool.query.mock.calls[0][0]).toContain(
                'ORDER BY a.fecha DESC,a.id DESC'
            );
        });

        test('debe devolver un array vacío si la meta no tiene aportes', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            const resultado = await obtenerPorMeta(2, 10);

            expect(resultado).toEqual([]);
        });
    });

    describe('crear', () => {
        test('debe crear un aporte cuando la meta pertenece al usuario', async () => {
            const aporte = { id: 1, meta_id: 2, monto: '5000.00' };

            pool.query
                .mockResolvedValueOnce({ rows: [{ id: 2 }] })
                .mockResolvedValueOnce({ rows: [aporte] });

            const resultado = await crear(2, 10, 5000, 'Ahorro mensual');

            expect(resultado).toEqual(aporte);
            expect(pool.query).toHaveBeenCalledTimes(2);
            expect(pool.query.mock.calls[1][1]).toEqual([
                2,
                5000,
                'Ahorro mensual'
            ]);
        });

        test('debe guardar null si no se proporciona descripción', async () => {
            pool.query
                .mockResolvedValueOnce({ rows: [{ id: 2 }] })
                .mockResolvedValueOnce({
                    rows: [{ id: 1, meta_id: 2, monto: '5000.00' }]
                });

            await crear(2, 10, 5000);

            expect(pool.query.mock.calls[1][1]).toEqual([
                2,
                5000,
                null
            ]);
        });

        test('debe rechazar la creación si la meta no pertenece al usuario', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });

            await expect(crear(2, 10, 5000, 'Ahorro'))
                .rejects.toThrow('La meta no pertenece al usuario');

            expect(pool.query).toHaveBeenCalledTimes(1);
        });
    });

    describe('actualizar', () => {
        test('debe actualizar el monto de un aporte existente', async () => {
            const aporte = { id: 1, meta_id: 2, monto: '8000.00' };

            pool.query
                .mockResolvedValueOnce({ rows: [{ id: 1 }] })
                .mockResolvedValueOnce({ rows: [aporte] });

            const resultado = await actualizar(
                1, 10, undefined, 8000, undefined
            );

            expect(resultado).toEqual(aporte);
            expect(pool.query).toHaveBeenCalledTimes(2);
            expect(pool.query.mock.calls[1][1]).toEqual([8000, 1, 10]);
        });

        test('debe actualizar la meta cuando la nueva meta pertenece al usuario', async () => {
            const aporte = { id: 1, meta_id: 3, monto: '5000.00' };

            pool.query
                .mockResolvedValueOnce({ rows: [{ id: 1 }] })
                .mockResolvedValueOnce({ rows: [{ id: 3 }] })
                .mockResolvedValueOnce({ rows: [aporte] });

            const resultado = await actualizar(
                1, 10, 3, undefined, undefined
            );

            expect(resultado).toEqual(aporte);
            expect(pool.query).toHaveBeenCalledTimes(3);
            expect(pool.query.mock.calls[1][1]).toEqual([3, 10]);
            expect(pool.query.mock.calls[2][1]).toEqual([3, 1, 10]);
        });

        test('debe actualizar solamente la descripción', async () => {
            const aporte = {
                id: 1,
                meta_id: 2,
                monto: '5000.00',
                descripcion: 'Aporte extraordinario'
            };

            pool.query
                .mockResolvedValueOnce({ rows: [{ id: 1 }] })
                .mockResolvedValueOnce({ rows: [aporte] });

            const resultado = await actualizar(
                1, 10, undefined, undefined, 'Aporte extraordinario'
            );

            expect(resultado).toEqual(aporte);
            expect(pool.query).toHaveBeenCalledTimes(2);
            expect(pool.query.mock.calls[1][0]).toContain('SET descripcion=$1');
            expect(pool.query.mock.calls[1][1]).toEqual([
                'Aporte extraordinario',
                1,
                10
            ]);
        });

        test('debe rechazar la actualización si el aporte no existe o no pertenece al usuario', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });

            await expect(actualizar(
                99, 10, undefined, 8000, undefined
            )).rejects.toThrow('Aporte no encontrado');

            expect(pool.query).toHaveBeenCalledTimes(1);
        });

        test('debe rechazar la actualización si la nueva meta no pertenece al usuario', async () => {
            pool.query
                .mockResolvedValueOnce({ rows: [{ id: 1 }] })
                .mockResolvedValueOnce({ rows: [] });

            await expect(actualizar(
                1, 10, 99, undefined, undefined
            )).rejects.toThrow('La meta no pertenece al usuario');

            expect(pool.query).toHaveBeenCalledTimes(2);
        });

        test('debe rechazar la actualización si no se envían campos', async () => {
            pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

            await expect(actualizar(
                1, 10, undefined, undefined, undefined
            )).rejects.toThrow('No hay datos para actualizar');

            expect(pool.query).toHaveBeenCalledTimes(1);
        });
    });

    describe('eliminar', () => {
        test('debe eliminar y devolver un aporte existente', async () => {
            const aporte = { id: 1, meta_id: 2, monto: '5000.00' };
            pool.query.mockResolvedValue({ rows: [aporte] });

            const resultado = await eliminar(1, 10);

            expect(resultado).toEqual(aporte);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM aportes_metas'),
                [1, 10]
            );
        });

        test('debe lanzar error si el aporte no existe o no pertenece al usuario', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(eliminar(99, 10))
                .rejects.toThrow('Aporte no encontrado');
        });
    });
});