const validar = require('../utils/validator')
const reglasAporteMeta = {
    meta_id: {
        requerido: true,
        tipo: 'entero',
        mensajeTipo:
            'El meta_id debe ser un número entero válido.'
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
    }
}
const reglasActualizarAporteMeta =
    Object.fromEntries(
        Object.entries(reglasAporteMeta).map(
            ([campo, reglas]) => [
                campo,
                {
                    ...reglas,
                    requerido: false
                }
            ]
        )
    )
const validateCrearAporteMeta = (req, res, next) => {
    const error = validar(
        req.body,
        reglasAporteMeta
    )
    if (error.length > 0) {
        return res.status(400).json({ error })
    }
    next()
}
const validateActualizarAporteMeta = (req, res, next) => {
    const error = validar(
        req.body,
        reglasActualizarAporteMeta,
        {
            alMenosUnCampo: true,
            mensajeAlMenosUnCampo:
                'Debe enviar al menos un campo para actualizar.'
        }
    )
    if (error.length > 0) {
        return res.status(400).json({ error })
    }
    next()
}
module.exports = {
    validateCrearAporteMeta,
    validateActualizarAporteMeta
}
