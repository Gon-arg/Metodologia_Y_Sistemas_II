import { setSession, getToken, getUsuario } from '../../js/store/authStore.js';

jest.mock('../../js/api/auth.js', () => ({
    login: jest.fn(),
}));

import { login } from '../../js/api/auth.js';

describe('Integración del inicio de sesión', () => {
    let form;

    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();

        delete window.location;

        window.location = {
            href: '',
        };

        document.body.innerHTML = `
            <form id="login-form">
                <input id="email" type="email" />
                <input id="password" type="password" />
                <p id="login-error" hidden></p>
                <button type="submit">Entrar</button>
            </form>
        `;

        form = document.getElementById('login-form');

        jest.isolateModules(() => {
            require('../../js/pages/login.js');
        });
    });

    test('guarda la sesión y redirige al dashboard cuando el login es exitoso', async () => {
        const usuario = {
            id: 1,
            nombre: 'Ricardo',
            email: 'ricardo@example.com',
        };

        login.mockResolvedValue({
            ok: true,
            token: 'token-prueba',
            usuario,
        });

        document.getElementById('email').value = 'ricardo@example.com';
        document.getElementById('password').value = '123456';

        form.dispatchEvent(new Event('submit', {
            bubbles: true,
            cancelable: true,
        }));

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(login).toHaveBeenCalledWith(
            'ricardo@example.com',
            '123456'
        );
        expect(getToken()).toBe('token-prueba');
        expect(getUsuario()).toEqual(usuario);
        expect(window.location.href).toBe('dashboard.html');
    });

    test('muestra el error cuando las credenciales son incorrectas', async () => {
        login.mockRejectedValue(new Error('Credenciales incorrectas'));

        document.getElementById('email').value = 'ricardo@example.com';
        document.getElementById('password').value = 'incorrecta';

        form.dispatchEvent(new Event('submit', {
            bubbles: true,
            cancelable: true,
        }));

        await new Promise((resolve) => setTimeout(resolve, 0));

        const error = document.getElementById('login-error');

        expect(error.hidden).toBe(false);
        expect(error.textContent).toBe('Credenciales incorrectas');
        expect(getToken()).toBeNull();
        expect(getUsuario()).toBeNull();
    });

    test('redirige al dashboard cuando ya existe una sesión', () => {
        setSession('token-existente', {
            id: 1,
            nombre: 'Ricardo',
        });

        jest.isolateModules(() => {
            require('../../js/pages/login.js');
        });

        expect(window.location.href).toBe('dashboard.html');
    });
});
