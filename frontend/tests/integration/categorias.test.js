import { setSession } from '../../js/store/authStore.js';

jest.mock('../../js/api/categorias.js', () => ({
    obtenerTodas: jest.fn(),
    crear: jest.fn(),
}));

jest.mock('../../js/api/movimientos.js', () => ({
    crear: jest.fn(),
}));

import * as categoriasApi from '../../js/api/categorias.js';
import * as movimientosApi from '../../js/api/movimientos.js';

describe('Integración de la página de categorías', () => {
    const categorias = [
        { id: 1, nombre: 'Comida' },
        { id: 2, nombre: 'Transporte' },
        { id: 3, nombre: 'Saldo general' },
    ];

    async function esperarActualizacion() {
        await new Promise((resolve) => setTimeout(resolve, 0));
    }

    async function cargarPagina() {
        document.body.innerHTML = `
            <div id="navbar"></div>
            <div id="sidebar"></div>

            <div id="lista-categorias"></div>

            <form id="form-categoria" hidden>
                <input id="nombre-categoria" />
                <button type="submit">Agregar</button>
            </form>

            <form id="movimiento-form">
                <p id="movimiento-msg" hidden></p>
                <strong id="categoria-elegida">ninguna</strong>

                <input type="radio" name="tipo" value="gasto" checked />
                <input type="radio" name="tipo" value="ingreso" />

                <input id="monto" type="number" />
                <button type="submit">Guardar movimiento</button>
            </form>
        `;

        jest.isolateModules(() => {
            require('../../js/pages/categorias.js');
        });

        await esperarActualizacion();
    }

    beforeEach(() => {
        localStorage.clear();

        setSession('token-prueba', {
            id: 1,
            nombre: 'Ricardo',
            email: 'ricardo@example.com',
        });

        jest.clearAllMocks();

        categoriasApi.obtenerTodas.mockResolvedValue({
            categorias,
        });

        categoriasApi.crear.mockResolvedValue({
            categoria: { id: 4, nombre: 'Mascotas' },
        });

        movimientosApi.crear.mockResolvedValue({ ok: true });
    });

    test('carga las categorías y oculta Saldo general', async () => {
        await cargarPagina();

        const lista = document.getElementById('lista-categorias');

        expect(categoriasApi.obtenerTodas).toHaveBeenCalledTimes(1);
        expect(lista.textContent).toContain('Comida');
        expect(lista.textContent).toContain('Transporte');
        expect(lista.textContent).not.toContain('Saldo general');
    });

    test('selecciona una categoría y actualiza la categoría elegida', async () => {
        await cargarPagina();

        const boton = [...document.querySelectorAll('#lista-categorias button')]
            .find((elemento) => elemento.textContent === 'Comida');

        boton.click();

        // pintarCategorias() reconstruye los botones.
        // Buscamos el nuevo botón para comprobar su estado.
        const botonActualizado = [...document.querySelectorAll('#lista-categorias button')]
            .find((elemento) => elemento.textContent === 'Comida');

        expect(document.getElementById('categoria-elegida').textContent)
            .toBe('Comida');

        expect(botonActualizado.getAttribute('aria-pressed')).toBe('true');
    });

    test('muestra un error si se intenta guardar sin elegir categoría', async () => {
        await cargarPagina();

        document.getElementById('monto').value = '1500';

        document.getElementById('movimiento-form').dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true })
        );

        expect(document.getElementById('movimiento-msg').textContent)
            .toBe('Elegí una categoría.');

        expect(movimientosApi.crear).not.toHaveBeenCalled();
    });

    test('rechaza un monto igual a cero', async () => {
        await cargarPagina();

        document.querySelector('#lista-categorias button').click();

        document.getElementById('monto').value = '0';

        document.getElementById('movimiento-form').dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true })
        );

        expect(document.getElementById('movimiento-msg').textContent)
            .toBe('Ingresá un monto mayor a 0.');

        expect(movimientosApi.crear).not.toHaveBeenCalled();
    });

    test('guarda un gasto con la categoría seleccionada', async () => {
        await cargarPagina();

        document.querySelector('#lista-categorias button').click();

        document.getElementById('monto').value = '1500';

        document.getElementById('movimiento-form').dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true })
        );

        await esperarActualizacion();

        expect(movimientosApi.crear).toHaveBeenCalledWith(
            expect.objectContaining({
                usuario_id: 1,
                categoria_id: 1,
                tipo: 'gasto',
                monto: 1500,
                descripcion: '',
            })
        );

        expect(document.getElementById('monto').value).toBe('');
        expect(document.getElementById('movimiento-msg').hidden).toBe(true);
    });

    test('guarda un ingreso y muestra un mensaje de confirmación', async () => {
        await cargarPagina();

        document.querySelector('#lista-categorias button').click();

        document.querySelector(
            'input[name="tipo"][value="ingreso"]'
        ).checked = true;

        document.getElementById('monto').value = '50000';

        document.getElementById('movimiento-form').dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true })
        );

        await esperarActualizacion();

        expect(movimientosApi.crear).toHaveBeenCalledWith(
            expect.objectContaining({
                tipo: 'ingreso',
                monto: 50000,
            })
        );

        expect(document.getElementById('movimiento-msg').hidden).toBe(false);

        expect(document.getElementById('movimiento-msg').textContent)
            .toContain('Ingreso guardado en Comida');
    });

    test('crea una categoría nueva y la deja seleccionada', async () => {
        const nuevaCategoria = { id: 4, nombre: 'Mascotas' };

        categoriasApi.obtenerTodas
            .mockResolvedValueOnce({ categorias })
            .mockResolvedValue({ categorias: [...categorias, nuevaCategoria] });

        await cargarPagina();

        document.querySelector('[aria-label="Agregar categoría nueva"]').click();

        const input = document.getElementById('nombre-categoria');
        input.value = 'Mascotas';

        document.getElementById('form-categoria').dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true })
        );

        await esperarActualizacion();

        expect(categoriasApi.crear).toHaveBeenCalledWith({
            nombre: 'Mascotas',
        });

        expect(document.getElementById('categoria-elegida').textContent)
            .toBe('Mascotas');

        expect(document.getElementById('form-categoria').hidden).toBe(true);
    });

    test('selecciona una categoría existente sin crear un duplicado', async () => {
        await cargarPagina();

        document.querySelector('[aria-label="Agregar categoría nueva"]').click();

        const input = document.getElementById('nombre-categoria');
        input.value = '  comida  ';

        document.getElementById('form-categoria').dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true })
        );

        expect(categoriasApi.crear).not.toHaveBeenCalled();

        expect(document.getElementById('categoria-elegida').textContent)
            .toBe('Comida');

        expect(document.getElementById('form-categoria').hidden).toBe(true);
    });

    test('muestra un error cuando falla la creación de una categoría', async () => {
        categoriasApi.crear.mockRejectedValue(
            new Error('No se pudo crear la categoría')
        );

        await cargarPagina();

        document.querySelector('[aria-label="Agregar categoría nueva"]').click();

        document.getElementById('nombre-categoria').value = 'Mascotas';

        document.getElementById('form-categoria').dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true })
        );

        await esperarActualizacion();

        expect(document.getElementById('movimiento-msg').textContent)
            .toBe('No se pudo crear la categoría');
    });

    test('muestra un error cuando falla el registro del movimiento', async () => {
        movimientosApi.crear.mockRejectedValue(
            new Error('No se pudo guardar el movimiento')
        );

        await cargarPagina();

        document.querySelector('#lista-categorias button').click();

        document.getElementById('monto').value = '1500';

        document.getElementById('movimiento-form').dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true })
        );

        await esperarActualizacion();

        expect(document.getElementById('movimiento-msg').textContent)
            .toBe('No se pudo guardar el movimiento');
    });
});
