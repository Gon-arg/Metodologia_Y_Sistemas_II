
jest.mock('../config/conexion-db', () => ({
    query: jest.fn()
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn()
}));

const pool = require('../config/conexion-db');
const bcrypt = require('bcrypt');

const {
    obtenerPorId,
    obtenerPorEmail,
    actualizar,
    eliminar
} = require('../services/usuarios.service');

describe('Usuarios - Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('obtenerPorId', () => {
        test('debe devolver un usuario existente', async () => {
            const usuario = {
                id: 10,
                nombre: 'Juan',
                email: 'juan@example.com'
            };

            pool.query.mockResolvedValue({ rows: [usuario] });

            const resultado = await obtenerPorId(10);

            expect(resultado).toEqual(usuario);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE id=$1'),
                [10]
            );
        });

        test('debe lanzar error si el usuario no existe', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(obtenerPorId(99))
                .rejects.toThrow('Usuario no encontrado');
        });
    });

    describe('obtenerPorEmail', () => {
        test('debe devolver un usuario existente por email', async () => {
            const usuario = {
                id: 10,
                nombre: 'Juan',
                email: 'juan@example.com',
                password_hash: 'hash123'
            };

            pool.query.mockResolvedValue({ rows: [usuario] });

            const resultado = await obtenerPorEmail('juan@example.com');

            expect(resultado).toEqual(usuario);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE email=$1'),
                ['juan@example.com']
            );
        });

        test('debe lanzar error si no existe un usuario con ese email', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(obtenerPorEmail('inexistente@example.com'))
                .rejects.toThrow('Usuario no encontrado');
        });
    });

    describe('actualizar', () => {
        test('debe actualizar nombre y email', async () => {
            const usuario = {
                id: 10,
                nombre: 'Juan Pérez',
                email: 'juanperez@example.com'
            };

            pool.query.mockResolvedValue({ rows: [usuario] });

            const resultado = await actualizar(
                10,
                'Juan Pérez',
                'juanperez@example.com',
                undefined
            );

            expect(resultado).toEqual(usuario);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE usuarios'),
                ['Juan Pérez', 'juanperez@example.com', 10]
            );
            expect(bcrypt.hash).not.toHaveBeenCalled();
        });

        test('debe actualizar solamente el nombre', async () => {
            const usuario = {
                id: 10,
                nombre: 'Juan Pérez',
                email: 'juan@example.com'
            };

            pool.query.mockResolvedValue({ rows: [usuario] });

            const resultado = await actualizar(
                10,
                'Juan Pérez',
                undefined,
                undefined
            );

            expect(resultado).toEqual(usuario);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('SET nombre=$1'),
                ['Juan Pérez', 10]
            );
        });

        test('debe generar un hash al actualizar la contraseña', async () => {
            const usuario = {
                id: 10,
                nombre: 'Juan',
                email: 'juan@example.com'
            };

            bcrypt.hash.mockResolvedValue('nuevo_hash');
            pool.query.mockResolvedValue({ rows: [usuario] });

            const resultado = await actualizar(
                10,
                undefined,
                undefined,
                'NuevaClave123'
            );

            expect(resultado).toEqual(usuario);
            expect(bcrypt.hash).toHaveBeenCalledWith('NuevaClave123', 10);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('SET password_hash=$1'),
                ['nuevo_hash', 10]
            );
        });

        test('debe lanzar error si no hay campos para actualizar', async () => {
            await expect(actualizar(
                10,
                undefined,
                undefined,
                undefined
            )).rejects.toThrow('No hay datos para actualizar');

            expect(pool.query).not.toHaveBeenCalled();
            expect(bcrypt.hash).not.toHaveBeenCalled();
        });

        test('debe lanzar error si el usuario no existe al actualizar', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(actualizar(
                99,
                'Nuevo nombre',
                undefined,
                undefined
            )).rejects.toThrow('Usuario no encontrado');
        });
    });

    describe('eliminar', () => {
        test('debe eliminar un usuario existente', async () => {
            const usuario = {
                id: 10,
                nombre: 'Juan',
                email: 'juan@example.com'
            };

            pool.query.mockResolvedValue({ rows: [usuario] });

            const resultado = await eliminar(10);

            expect(resultado).toEqual(usuario);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM usuarios'),
                [10]
            );
        });

        test('debe lanzar error si el usuario no existe al eliminar', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(eliminar(99))
                .rejects.toThrow('Usuario no encontrado');
        });
    });
});