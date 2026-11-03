
jest.mock('../config/conexion-db', () => ({
    query: jest.fn()
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn()
}));

jest.mock('../middlewares/auth.middleware', () => ({
    generarToken: jest.fn()
}));

jest.mock('../utils/email.util', () => ({
    enviarEmail: jest.fn()
}));

const crypto = require('crypto');
const pool = require('../config/conexion-db');
const bcrypt = require('bcrypt');
const { generarToken } = require('../middlewares/auth.middleware');
const { enviarEmail } = require('../utils/email.util');

const {
    login,
    registrar,
    obtenerPerfil,
    recuperarPassword,
    restablecerPassword
} = require('../services/auth.service');

describe('Auth - Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        test('debe iniciar sesión con credenciales válidas', async () => {
            const usuario = {
                id: 10,
                nombre: 'Juan',
                email: 'juan@example.com',
                password_hash: 'hash123'
            };

            pool.query.mockResolvedValue({ rows: [usuario] });
            bcrypt.compare.mockResolvedValue(true);
            generarToken.mockReturnValue('token-jwt');

            const resultado = await login('juan@example.com', 'Clave123');

            expect(resultado).toEqual({
                usuario: {
                    id: 10,
                    nombre: 'Juan',
                    email: 'juan@example.com'
                },
                token: 'token-jwt'
            });

            expect(bcrypt.compare).toHaveBeenCalledWith(
                'Clave123',
                'hash123'
            );

            expect(generarToken).toHaveBeenCalledWith(usuario);
        });

        test('debe rechazar el inicio de sesión si el email no existe', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(login('inexistente@example.com', 'Clave123'))
                .rejects.toThrow('Credenciales inválidas');

            expect(bcrypt.compare).not.toHaveBeenCalled();
            expect(generarToken).not.toHaveBeenCalled();
        });

        test('debe rechazar el inicio de sesión si la contraseña es incorrecta', async () => {
            pool.query.mockResolvedValue({
                rows: [{
                    id: 10,
                    nombre: 'Juan',
                    email: 'juan@example.com',
                    password_hash: 'hash123'
                }]
            });

            bcrypt.compare.mockResolvedValue(false);

            await expect(login('juan@example.com', 'Incorrecta'))
                .rejects.toThrow('Credenciales inválidas');

            expect(generarToken).not.toHaveBeenCalled();
        });
    });

    describe('registrar', () => {
        test('debe rechazar el registro si el email ya está registrado', async () => {
            pool.query.mockResolvedValue({
                rows: [{ id: 10 }]
            });

            await expect(registrar(
                'Juan',
                'juan@example.com',
                'Clave123'
            )).rejects.toThrow('El email ya está registrado');

            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(pool.query).toHaveBeenCalledTimes(1);
        });

        test('debe registrar un usuario guardando el hash de la contraseña', async () => {
            const usuario = {
                id: 10,
                nombre: 'Juan',
                email: 'juan@example.com'
            };

            pool.query
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [usuario] });

            bcrypt.hash.mockResolvedValue('hash-generado');

            const resultado = await registrar(
                'Juan',
                'juan@example.com',
                'Clave123'
            );

            expect(resultado).toEqual({ usuario });

            expect(bcrypt.hash).toHaveBeenCalledWith('Clave123', 10);

            expect(pool.query).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining('INSERT INTO usuarios'),
                ['Juan', 'juan@example.com', 'hash-generado']
            );
        });
    });

    describe('obtenerPerfil', () => {
        test('debe devolver el perfil de un usuario existente', async () => {
            const usuario = {
                id: 10,
                nombre: 'Juan',
                email: 'juan@example.com'
            };

            pool.query.mockResolvedValue({ rows: [usuario] });

            const resultado = await obtenerPerfil(10);

            expect(resultado).toEqual(usuario);
            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE id=$1'),
                [10]
            );
        });

        test('debe lanzar error si el usuario no existe', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(obtenerPerfil(99))
                .rejects.toThrow('Usuario no encontrado');
        });
    });

    describe('recuperarPassword', () => {
        test('debe lanzar error si el email no pertenece a un usuario', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(recuperarPassword('inexistente@example.com'))
                .rejects.toThrow('Usuario no encontrado');

            expect(enviarEmail).not.toHaveBeenCalled();
        });

        test('debe guardar el hash del token y enviar el correo de recuperación', async () => {
            const usuario = {
                id: 10,
                nombre: 'Juan',
                email: 'juan@example.com'
            };

            const tokenGenerado = Buffer.alloc(32, 1).toString('hex');
            const tokenHash = crypto
                .createHash('sha256')
                .update(tokenGenerado)
                .digest('hex');

            const fechaAntes = Date.now();

            pool.query
                .mockResolvedValueOnce({ rows: [usuario] })
                .mockResolvedValueOnce({ rows: [] });

            const randomBytesSpy = jest
                .spyOn(crypto, 'randomBytes')
                .mockReturnValue(Buffer.alloc(32, 1));

            const urlAnterior = process.env.FRONTEND_URL;
            process.env.FRONTEND_URL = 'http://localhost:8080';

            try {
                const resultado = await recuperarPassword('juan@example.com');

                expect(resultado).toEqual({
                    mensaje: 'Se envió el correo de recuperación'
                });

                expect(randomBytesSpy).toHaveBeenCalledWith(32);

                expect(pool.query).toHaveBeenNthCalledWith(
                    2,
                    expect.stringContaining(
                        'INSERT INTO recuperacion_password'
                    ),
                    [
                        10,
                        tokenHash,
                        expect.any(Date)
                    ]
                );

                const fechaExpiracion = pool.query.mock.calls[1][1][2];

                expect(fechaExpiracion.getTime()).toBeGreaterThanOrEqual(
                    fechaAntes + 30 * 60 * 1000
                );

                expect(fechaExpiracion.getTime()).toBeLessThanOrEqual(
                    Date.now() + 30 * 60 * 1000
                );

                expect(enviarEmail).toHaveBeenCalledWith(
                    'juan@example.com',
                    'Recuperación de contraseña',
                    expect.stringContaining(
                        `http://localhost:8080/restablecer-password.html?token=${tokenGenerado}`
                    )
                );
            } finally {
                randomBytesSpy.mockRestore();

                if (urlAnterior === undefined) {
                    delete process.env.FRONTEND_URL;
                } else {
                    process.env.FRONTEND_URL = urlAnterior;
                }
            }
        });
    });

    describe('restablecerPassword', () => {
        test('debe rechazar un token inválido', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(restablecerPassword(
                'token-invalido',
                'NuevaClave123'
            )).rejects.toThrow('Token inválido');

            expect(bcrypt.hash).not.toHaveBeenCalled();
        });

        test('debe rechazar un token que ya fue utilizado', async () => {
            pool.query.mockResolvedValue({
                rows: [{
                    id: 1,
                    usuario_id: 10,
                    usado: true,
                    expira_en: new Date(Date.now() + 60000)
                }]
            });

            await expect(restablecerPassword(
                'token-usado',
                'NuevaClave123'
            )).rejects.toThrow('El token ya fue utilizado');

            expect(bcrypt.hash).not.toHaveBeenCalled();
        });

        test('debe rechazar un token vencido', async () => {
            pool.query.mockResolvedValue({
                rows: [{
                    id: 1,
                    usuario_id: 10,
                    usado: false,
                    expira_en: new Date(Date.now() - 60000)
                }]
            });

            await expect(restablecerPassword(
                'token-vencido',
                'NuevaClave123'
            )).rejects.toThrow('El token ha expirado');

            expect(bcrypt.hash).not.toHaveBeenCalled();
        });

        test('debe actualizar la contraseña y marcar el token como utilizado', async () => {
            const recuperacion = {
                id: 1,
                usuario_id: 10,
                usado: false,
                expira_en: new Date(Date.now() + 60000)
            };

            pool.query
                .mockResolvedValueOnce({ rows: [recuperacion] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] });

            bcrypt.hash.mockResolvedValue('nuevo-hash');

            const resultado = await restablecerPassword(
                'token-valido',
                'NuevaClave123'
            );

            const tokenHash = crypto
                .createHash('sha256')
                .update('token-valido')
                .digest('hex');

            expect(resultado).toEqual({
                mensaje: 'Contraseña restablecida correctamente'
            });

            expect(pool.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('WHERE token_hash=$1'),
                [tokenHash]
            );

            expect(bcrypt.hash).toHaveBeenCalledWith(
                'NuevaClave123',
                10
            );

            expect(pool.query).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining('UPDATE usuarios SET password_hash=$1'),
                ['nuevo-hash', 10]
            );

            expect(pool.query).toHaveBeenNthCalledWith(
                3,
                expect.stringContaining('UPDATE recuperacion_password SET usado=TRUE'),
                [1]
            );
        });
    });
});