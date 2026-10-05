const validar = require('../utils/validator')
const reglasMovimiento = {
    usuario_id: {
        requerido: true,
        tipo: 'entero',
        mensajeTipo:
            'El usuario_id debe ser un número entero válido.'
    },
    categoria_id: {
        requerido: true,
        tipo: 'entero',
        mensajeTipo:
            'El categoria_id debe ser un número entero válido.'
    },
    tipo: {
        requerido: true,
        tipo: 'string',
        valores: [
            'gasto',
            'ingreso'
        ],
        mensajeTipo:
            'El tipo debe ser un texto válido.',
        mensajeValores:
            'El tipo debe ser "gasto" o "ingreso".'
    },
    monto: {
        requerido: true,
        tipo: 'numero',
        decimales: 2,
        mensajeTipo:
            'El monto debe ser un número mayor que 0.',
        mensajeDecimales:
            'El monto no puede tener más de 2 decimales.'
    },
    descripcion: {
        requerido: false,
        tipo: 'string',
        max: 255,
        trim: true,
        mensajeTipo:
            'La descripción debe ser un texto válido.',
        mensajeMax:
            'La descripción no puede superar los 255 caracteres.'
    },
    fecha: {
        requerido: false,
        tipo: 'string',
        permitirNull: true,
        permitirVacio: true,
        regex: /^\d{4}-\d{2}-\d{2}$/,
        mensajeTipo:
            'La fecha debe ser un texto válido.',
        mensajeRegex:
            'La fecha debe tener el formato YYYY-MM-DD.'
    }
}
const reglasActualizarMovimiento =
    Object.fromEntries(
        Object.entries(reglasMovimiento).map(
            ([campo, reglas]) => [
                campo,
                {
                    ...reglas,
                    requerido: false
                }
            ]
        )
    )
const validateCrearMovimiento = (req, res, next) => {
    const error = validar(
        req.body,
        reglasMovimiento
    )
    if (error.length > 0) {
        return res.status(400).json({ error })
    }
    next()
}
const validateActualizarMovimiento = (req, res, next) => {
    const error = validar(
        req.body,
        reglasActualizarMovimiento
    )
    if (error.length > 0) {
        return res.status(400).json({ error })
    }
    next()
}
module.exports = {
    validateCrearMovimiento,
    validateActualizarMovimiento
}
