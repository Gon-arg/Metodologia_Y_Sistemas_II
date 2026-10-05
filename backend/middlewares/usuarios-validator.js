const validar = require('../utils/validator')
const reglaNombre = {
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
}
const reglaEmail = {
    requerido: true,
    tipo: 'string',
    max: 150,
    trim: true,
    minusculas: true,
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    mensajeRequerido:
        'El email es obligatorio.',
    mensajeTipo:
        'El email debe ser un texto válido.',
    mensajeRegex:
        'El email no tiene un formato válido.',
    mensajeMax:
        'El email no puede superar los 150 caracteres.'
}
const reglaPassword = {
    requerido: true,
    tipo: 'string',
    min: 6,
    max: 255,
    mensajeRequerido:
        'La contraseña es obligatoria.',
    mensajeTipo:
        'La contraseña debe ser un texto válido.',
    mensajeMin:
        'La contraseña debe tener al menos 6 caracteres.',
    mensajeMax:
        'La contraseña no puede superar los 255 caracteres.'
}
const reglasUsuario = {
    nombre: {
        ...reglaNombre
    },
    email: {
        ...reglaEmail
    },
    password: {
        ...reglaPassword
    }
}
const reglasActualizarUsuario =
    Object.fromEntries(
        Object.entries(reglasUsuario).map(
            ([campo, reglas]) => [
                campo,
                {
                    ...reglas,
                    requerido: false
                }
            ]
        )
    )
const validateCrearUsuario = (req, res, next) => {
    const error = validar(
        req.body,
        reglasUsuario
    )
    if (error.length > 0) {
        return res.status(400).json({ error })
    }
    next()
}
const validateActualizarUsuario = (req, res, next) => {
    const error = validar(
        req.body,
        reglasActualizarUsuario
    )
    if (error.length > 0) {
        return res.status(400).json({ error })
    }
    next()
}
module.exports = {
    validateCrearUsuario,
    validateActualizarUsuario
}
