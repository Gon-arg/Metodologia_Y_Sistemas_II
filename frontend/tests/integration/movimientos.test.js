import { setSession } from '../../js/store/authStore.js';

jest.mock('../../js/api/movimientos.js', () => ({
    obtenerPorUsuario: jest.fn(),
    eliminar: jest.fn(),
}));

jest.mock('../../js/api/categorias.js', () => ({
    obtenerTodas: jest.fn(),
}));

import * as movimientosApi from '../../js/api/movimientos.js';
import * as categoriasApi from '../../js/api/categorias.js';

describe('Integración de la página de movimientos', () => {
    const movimientos = [
        {
            id: 1,
            categoria_id: 10,
            tipo: 'gasto',
            monto: 1500,
            fecha: '2026-11-20T10:00:00.000Z',
            descripcion: 'Almuerzo',
        },
        {
            id: 2,
            categoria_id: 20,
            tipo: 'ingreso',
            monto: 50000,
            fecha: '2026-11-21T12:00:00.000Z',
            descripcion: 'Sueldo',
        },
    ];

    const categorias = [
        { id: 10, nombre: 'Comida' },
        { id: 20, nombre: 'Trabajo' },
    ];

    async function cargarPagina() {
        document.body.innerHTML = `
            <div id="sidebar"></div>
            <div id="navbar"></div>

            <div id="menu-filtros">
                <button id="btn-ver-gastos" data-filtro="gasto">Ver gastos</button>
                <button id="btn-ver-ingresos" data-filtro="ingreso">Ver ingresos</button>
            </div>

            <div id="vista-lista" class="hidden">
                <button id="btn-volver">Volver</button>
                <ul id="lista-movimientos"></ul>
            </div>
        `;

        jest.isolateModules(() => {
            require('../../js/pages/movimientos.js');
        });

        // Espera a que termine la carga asíncrona de movimientos y categorías.
        await new Promise((resolve) => setTimeout(resolve, 0));
    }

    beforeEach(() => {
        localStorage.clear();
        setSession('token-prueba', {
            id: 1,
            nombre: 'Ricardo',
            email: 'ricardo@example.com',
        });

        jest.clearAllMocks();

        movimientosApi.obtenerPorUsuario.mockResolvedValue({
            movimientos,
        });

        movimientosApi.eliminar.mockResolvedValue({
            ok: true,
        });

        categoriasApi.obtenerTodas.mockResolvedValue({
            categorias,
        });
    });

    test('carga los movimientos y las categorías al iniciar', async () => {
        await cargarPagina();

        expect(movimientosApi.obtenerPorUsuario).toHaveBeenCalledTimes(1);
        expect(categoriasApi.obtenerTodas).toHaveBeenCalledTimes(1);

        expect(document.getElementById('menu-filtros').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('vista-lista').classList.contains('hidden')).toBe(true);
    });

    test('muestra solamente los gastos al seleccionar Ver gastos', async () => {
        await cargarPagina();

        document.getElementById('btn-ver-gastos').click();

        const lista = document.getElementById('lista-movimientos');

        expect(lista.textContent).toContain('Comida');
        expect(lista.textContent).toContain('-$1500');
        expect(lista.textContent).toContain('Almuerzo');
        expect(lista.textContent).not.toContain('Sueldo');

        expect(document.getElementById('menu-filtros').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('vista-lista').classList.contains('hidden')).toBe(false);
    });

    test('muestra solamente los ingresos al seleccionar Ver ingresos', async () => {
        await cargarPagina();

        document.getElementById('btn-ver-ingresos').click();

        const lista = document.getElementById('lista-movimientos');

        expect(lista.textContent).toContain('Trabajo');
        expect(lista.textContent).toContain('+$50000');
        expect(lista.textContent).toContain('Sueldo');
        expect(lista.textContent).not.toContain('Almuerzo');
    });

    test('muestra un mensaje cuando no hay movimientos del tipo seleccionado', async () => {
        movimientosApi.obtenerPorUsuario.mockResolvedValue({
            movimientos: [],
        });

        await cargarPagina();

        document.getElementById('btn-ver-gastos').click();

        expect(document.getElementById('lista-movimientos').textContent)
            .toContain('No hay movimientos para mostrar.');
    });

    test('vuelve al menú de filtros al presionar Volver', async () => {
        await cargarPagina();

        document.getElementById('btn-ver-gastos').click();
        document.getElementById('btn-volver').click();

        expect(document.getElementById('menu-filtros').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('vista-lista').classList.contains('hidden')).toBe(true);
    });

    test('elimina un movimiento de la API y lo quita de la lista', async () => {
        await cargarPagina();

        document.getElementById('btn-ver-gastos').click();

        const botonEliminar = document.querySelector('.btn-eliminar');
        botonEliminar.click();

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(movimientosApi.eliminar).toHaveBeenCalledWith(1);
        expect(document.getElementById('lista-movimientos').textContent)
            .toContain('No hay movimientos para mostrar.');
    });
});
