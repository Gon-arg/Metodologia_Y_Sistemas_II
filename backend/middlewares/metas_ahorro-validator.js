const validar = require('../utils/validator')
const reglasMetaAhorro = {
    usuario_id: {
        requerido: true,
        tipo: 'entero',
        mensajeTipo:
            'El usuario_id debe ser un número entero válido.'
    },
    nombre: {
        requerido: true,
        tipo: 'string',
        noVacio: true,
        max: 100,
        trim: true,
        mensajeRequerido:
            'El nombre es obligatorio.',
        mensajeTipo:
            'El nombre debe ser un texto válido.',
        mensajeVacio:
            'El nombre no puede estar vacío.',
        mensajeMax:
            'El nombre no puede superar los 100 caracteres.'
    },
    monto_objetivo: {
        requerido: true,
        tipo: 'numero',
        decimales: 2,
        mensajeTipo:
            'El monto_objetivo debe ser un número mayor que 0.',
        mensajeDecimales:
            'El monto_objetivo no puede tener más de 2 decimales.'
    },
    monto_actual: {
        requerido: false,
        tipo: 'numeroNoNegativo',
        decimales: 2,
        mensajeTipo:
            'El monto_actual debe ser un número mayor o igual que 0.',
        mensajeDecimales:
            'El monto_actual no puede tener más de 2 decimales.'
    },
    estado: {
        requerido: false,
        tipo: 'string',
        valores: [
            'en proceso',
            'completada'
        ],
        mensajeTipo:
            'El estado debe ser un texto válido.',
        mensajeValores:
            'El estado debe ser "en proceso" o "completada".'
    },
    fecha_limite: {
        requerido: false,
        tipo: 'string',
        permitirNull: true,
        permitirVacio: true,
        regex: /^\d{4}-\d{2}-\d{2}$/,
        mensajeTipo:
            'La fecha_limite debe ser un texto válido.',
        mensajeRegex:
            'La fecha_limite debe tener el formato YYYY-MM-DD.'
    }
}
const reglasActualizarMetaAhorro =
    Object.fromEntries(
        Object.entries(reglasMetaAhorro).map(
            ([campo, reglas]) => [
                campo,
                {
                    ...reglas,
                    requerido: false
                }
            ]
        )
    )
const validateCrearMetaAhorro = (req, res, next) => {
    const error = validar(
        req.body,
        reglasMetaAhorro
    )
    if (error.length > 0) {
        return res.status(400).json({ error })
    }
    next()
}
const validateActualizarMetaAhorro = (req, res, next) => {
    const error = validar(
        req.body,
        reglasActualizarMetaAhorro
    )
    if (error.length > 0) {
        return res.status(400).json({ error })
    }
    next()
}
module.exports = {
    validateCrearMetaAhorro,
    validateActualizarMetaAhorro
}
