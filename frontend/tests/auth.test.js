import {
    login,
    registrar,
    getPerfil,
    recuperarPassword,
    restablecerPassword,
} from '../js/api/auth.js';

import { get, post } from '../js/api/client.js';

jest.mock('../js/api/client.js', () => ({
    get: jest.fn(),
    post: jest.fn(),
}));

describe('auth API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('login envía email y contraseña al endpoint correspondiente', () => {
        login('ricardo@example.com', '123456');

        expect(post).toHaveBeenCalledWith('/auth/login', {
            email: 'ricardo@example.com',
            password: '123456',
        });
    });

    test('registrar envía nombre, email y contraseña', () => {
        registrar('Ricardo', 'ricardo@example.com', '123456');

        expect(post).toHaveBeenCalledWith('/auth/registrar', {
            nombre: 'Ricardo',
            email: 'ricardo@example.com',
            password: '123456',
        });
    });

    test('getPerfil consulta el endpoint del perfil', () => {
        getPerfil();

        expect(get).toHaveBeenCalledWith('/auth/perfil');
    });

    test('recuperarPassword envía el email', () => {
        recuperarPassword('ricardo@example.com');

        expect(post).toHaveBeenCalledWith(
            '/auth/recuperar-password',
            { email: 'ricardo@example.com' }
        );
    });

    test('restablecerPassword envía el token y la nueva contraseña', () => {
        restablecerPassword('token-prueba', 'nueva123');

        expect(post).toHaveBeenCalledWith(
            '/auth/restablecer-password',
            {
                token: 'token-prueba',
                nuevaPassword: 'nueva123',
            }
        );
    });
});
