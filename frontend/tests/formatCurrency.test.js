import { formatCurrency } from '../js/utils/formatCurrency.js';

describe('formatCurrency', () => {
    test('formatea un importe positivo', () => {
        expect(formatCurrency(1234.56)).toBe('$ 1.234,56');
    });

    test('formatea un importe entero', () => {
        expect(formatCurrency(5000)).toBe('$ 5.000,00');
    });

    test('formatea cero', () => {
        expect(formatCurrency(0)).toBe('$ 0,00');
    });

    test('formatea un importe negativo', () => {
        expect(formatCurrency(-1500)).toBe('-$ 1.500,00');
    });

    test('convierte un valor no numérico en cero', () => {
        expect(formatCurrency('no es un número')).toBe('$ 0,00');
    });
});
