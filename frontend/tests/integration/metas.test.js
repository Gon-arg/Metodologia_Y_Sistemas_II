import { setSession } from '../../js/store/authStore.js';

jest.mock('../../js/api/metasAhorro.js', () => ({
    obtenerPorUsuario: jest.fn(),
    obtenerPorId: jest.fn(),
    crear: jest.fn(),
    eliminar: jest.fn(),
}));

jest.mock('../../js/api/aportesMetas.js', () => ({
    obtenerPorMeta: jest.fn(),
    crear: jest.fn(),
    eliminar: jest.fn(),
}));

import * as metasApi from '../../js/api/metasAhorro.js';
import * as aportesApi from '../../js/api/aportesMetas.js';

describe('Integración de la página de metas', () => {
    const metaInicial = {
        id: 1,
        nombre: 'Vacaciones',
        monto_actual: 25000,
        monto_objetivo: 100000,
        creado_en: '2026-01-01T00:00:00.000Z',
        fecha_limite: '2027-12-31T00:00:00.000Z',
    };

    const aporteInicial = {
        id: 10,
        monto: 25000,
        fecha: '2026-11-20T10:00:00.000Z',
        descripcion: 'Primer ahorro',
    };

    async function esperarActualizacion() {
        await new Promise((resolve) => setTimeout(resolve, 0));
    }

    async function cargarPagina() {
        document.body.innerHTML = `
            <div id="sidebar"></div>
            <div id="navbar"></div>

            <form id="form-meta">
                <input id="nombre-meta" />
                <input id="monto-objetivo" />
                <input id="fecha-limite" />
                <button type="submit">Crear meta</button>
            </form>

            <ul id="lista-metas"></ul>
        `;

        jest.isolateModules(() => {
            require('../../js/pages/metas.js');
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

        metasApi.obtenerPorUsuario.mockResolvedValue({
            metas: [metaInicial],
        });

        metasApi.crear.mockResolvedValue({
            meta: {
                ...metaInicial,
                id: 2,
                nombre: 'Auto nuevo',
            },
        });

        metasApi.eliminar.mockResolvedValue({ ok: true });

        metasApi.obtenerPorId.mockResolvedValue({
            meta: {
                ...metaInicial,
                monto_actual: 35000,
            },
        });

        aportesApi.obtenerPorMeta.mockResolvedValue({
            aportes: [aporteInicial],
        });

        aportesApi.crear.mockResolvedValue({ ok: true });
        aportesApi.eliminar.mockResolvedValue({ ok: true });
    });

    test('carga y muestra las metas del usuario al iniciar', async () => {
        await cargarPagina();

        expect(metasApi.obtenerPorUsuario).toHaveBeenCalledTimes(1);
        expect(document.getElementById('lista-metas').textContent)
            .toContain('Vacaciones');
        expect(document.getElementById('lista-metas').textContent)
            .toContain('25%');
    });

    test('muestra un mensaje de error cuando falla la carga de metas', async () => {
        metasApi.obtenerPorUsuario.mockRejectedValue(
            new Error('No se pudieron cargar las metas')
        );

        await cargarPagina();

        expect(document.getElementById('lista-metas').textContent)
            .toContain('No se pudieron cargar las metas');
    });

    test('crea una meta y la agrega a la lista', async () => {
        await cargarPagina();

        document.getElementById('nombre-meta').value = 'Auto nuevo';
        document.getElementById('monto-objetivo').value = '500000';
        document.getElementById('fecha-limite').value = '2027-12-31';

        document.getElementById('form-meta').dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true })
        );

        await esperarActualizacion();

        expect(metasApi.crear).toHaveBeenCalledWith({
            usuario_id: 1,
            nombre: 'Auto nuevo',
            monto_objetivo: 500000,
            fecha_limite: '2027-12-31',
        });

        expect(document.getElementById('lista-metas').textContent)
            .toContain('Auto nuevo');
    });

    test('expande una meta y consulta sus aportes', async () => {
        await cargarPagina();

        document.querySelector('.btn-expandir').click();

        await esperarActualizacion();

        expect(aportesApi.obtenerPorMeta).toHaveBeenCalledWith(1);
        expect(document.getElementById('lista-metas').textContent)
            .toContain('Objetivo: $100000.00');
        expect(document.getElementById('lista-metas').textContent)
            .toContain('Primer ahorro');
    });

    test('contrae una meta expandida', async () => {
        await cargarPagina();

        document.querySelector('.btn-expandir').click();
        await esperarActualizacion();

        document.querySelector('.btn-colapsar').click();

        expect(document.querySelector('.btn-expandir')).not.toBeNull();
        expect(document.querySelector('.form-aporte')).toBeNull();
    });

    test('agrega un aporte y actualiza la meta y sus aportes', async () => {
        await cargarPagina();

        document.querySelector('.btn-expandir').click();
        await esperarActualizacion();

        const formulario = document.querySelector('.form-aporte');
        formulario.querySelector('.input-monto-aporte').value = '10000';
        formulario.querySelector('.input-descripcion-aporte').value = 'Ahorro mensual';

        formulario.dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true })
        );

        await esperarActualizacion();

        expect(aportesApi.crear).toHaveBeenCalledWith({
            meta_id: 1,
            monto: 10000,
            descripcion: 'Ahorro mensual',
        });

        expect(metasApi.obtenerPorId).toHaveBeenCalledWith(1);
        expect(aportesApi.obtenerPorMeta).toHaveBeenCalledTimes(2);
        expect(document.getElementById('lista-metas').textContent)
            .toContain('$35000.00');
    });

    test('elimina un aporte y actualiza la información de la meta', async () => {
        await cargarPagina();

        document.querySelector('.btn-expandir').click();
        await esperarActualizacion();

        document.querySelector('.btn-eliminar-aporte').click();
        await esperarActualizacion();

        expect(aportesApi.eliminar).toHaveBeenCalledWith(10);
        expect(metasApi.obtenerPorId).toHaveBeenCalledWith(1);
        expect(aportesApi.obtenerPorMeta).toHaveBeenCalledTimes(2);
        expect(document.getElementById('lista-metas').textContent)
            .toContain('$35000.00');
    });

    test('elimina una meta y la quita de la lista', async () => {
        await cargarPagina();

        document.querySelector('.btn-expandir').click();
        await esperarActualizacion();

        document.querySelector('.btn-eliminar-meta').click();
        await esperarActualizacion();

        expect(metasApi.eliminar).toHaveBeenCalledWith(1);
        expect(document.getElementById('lista-metas').textContent)
            .not.toContain('Vacaciones');
    });
});
