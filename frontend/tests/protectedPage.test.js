import { isAuthenticated } from '../js/store/authStore.js';
import {
    guardProtectedPage,
    redirectSegunSesion,
} from '../js/utils/protectedPage.js';

jest.mock('../js/store/authStore.js', () => ({
    isAuthenticated: jest.fn(),
}));

describe('protectedPage', () => {
    let locationOriginal;

    beforeEach(() => {
        jest.clearAllMocks();

        locationOriginal = window.location;

        delete window.location;

        window.location = {
            href: '',
        };
    });

    afterEach(() => {
        window.location = locationOriginal;
    });

    describe('guardProtectedPage', () => {
        test('redirige al login cuando no hay sesión', () => {
            isAuthenticated.mockReturnValue(false);

            guardProtectedPage();

            expect(window.location.href).toBe('login.html');
        });

        test('no redirige cuando hay sesión', () => {
            isAuthenticated.mockReturnValue(true);

            guardProtectedPage();

            expect(window.location.href).toBe('');
        });
    });

    describe('redirectSegunSesion', () => {
        test('redirige al dashboard cuando hay sesión', () => {
            isAuthenticated.mockReturnValue(true);

            redirectSegunSesion();

            expect(window.location.href).toBe('dashboard.html');
        });

        test('redirige al login cuando no hay sesión', () => {
            isAuthenticated.mockReturnValue(false);

            redirectSegunSesion();

            expect(window.location.href).toBe('login.html');
        });
    });
});
