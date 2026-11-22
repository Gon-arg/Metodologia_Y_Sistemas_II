import { formatDate } from '../js/utils/formatDate.js';

describe('formatDate', () => {
    test('convierte una fecha ISO al formato DD/MM/AAAA', () => {
        expect(formatDate('2026-08-01')).toBe('01/08/2026');
    });

    test('convierte una fecha ISO que incluye hora', () => {
        expect(formatDate('2026-08-01T15:30:00.000Z')).toBe('01/08/2026');
    });

    test('devuelve una cadena vacía cuando recibe null', () => {
        expect(formatDate(null)).toBe('');
    });

    test('devuelve una cadena vacía cuando recibe undefined', () => {
        expect(formatDate(undefined)).toBe('');
    });

    test('devuelve una cadena vacía cuando recibe una cadena vacía', () => {
        expect(formatDate('')).toBe('');
    });
});
