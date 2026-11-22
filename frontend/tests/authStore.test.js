import {
    getToken,
    getUsuario,
    setSession,
    clearSession,
    isAuthenticated,
} from '../js/store/authStore.js';

describe('authStore', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('getToken', () => {
        test('devuelve null cuando no existe un token', () => {
            expect(getToken()).toBeNull();
        });
    });

    describe('getUsuario', () => {
        test('devuelve null cuando no existe un usuario', () => {
            expect(getUsuario()).toBeNull();
        });
    });

    describe('setSession', () => {
        test('guarda el token y los datos del usuario', () => {
            const usuario = {
                id: 1,
                nombre: 'Ricardo',
                email: 'ricardo@example.com',
            };

            setSession('token-prueba', usuario);

            expect(getToken()).toBe('token-prueba');
            expect(getUsuario()).toEqual(usuario);
        });
    });

    describe('clearSession', () => {
        test('elimina el token y los datos del usuario', () => {
            setSession('token-prueba', { id: 1 });

            clearSession();

            expect(getToken()).toBeNull();
            expect(getUsuario()).toBeNull();
        });
    });

    describe('isAuthenticated', () => {
        test('devuelve false cuando no hay token', () => {
            expect(isAuthenticated()).toBe(false);
        });

        test('devuelve true cuando existe un token', () => {
            setSession('token-prueba', { id: 1 });

            expect(isAuthenticated()).toBe(true);
        });
    });
});
