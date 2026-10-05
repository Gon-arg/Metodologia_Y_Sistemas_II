const validar = require('../utils/validator')
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
const reglaNuevaPassword = {
    ...reglaPassword,
    mensajeRequerido:
        'La nueva contraseña es obligatoria.',
    mensajeTipo:
        'La nueva contraseña debe ser un texto válido.',
    mensajeMin:
        'La nueva contraseña debe tener al menos 6 caracteres.',
    mensajeMax:
        'La nueva contraseña no puede superar los 255 caracteres.'
}
const reglasRegistro = {
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
            'El nombre debe ser un texto válido y no vacío.',
        mensajeMax:
            'El nombre no puede superar los 100 caracteres.'
    },
    email: {
        ...reglaEmail
    },
    password: {
        ...reglaPassword
    }
}
const reglasLogin = {
    email: {
        ...reglaEmail
    },
    password: {
        requerido: true,
        tipo: 'string',
        mensajeRequerido:
            'La contraseña es obligatoria.',
        mensajeTipo:
            'La contraseña debe ser un texto válido.'
    }
}
const reglasRecuperarPassword = {
    email: {
        ...reglaEmail
    }
}
const reglasRestablecerPassword = {
    token: {
        requerido: true,
        tipo: 'string',
        noVacio: true,
        trim: true,
        mensajeRequerido:
            'El token es obligatorio.',
        mensajeTipo:
            'El token debe ser un texto válido.',
        mensajeVacio:
            'El token es obligatorio.'
    },
    nuevaPassword: {
        ...reglaNuevaPassword
    }
}
const validateInputRegistro = (req, res, next) => {
    const error = validar(
        req.body,
        reglasRegistro
    )
    if (error.length > 0) {
        return res.status(400).json({ error })
    }
    next()
}
const validateInputLogin = (req, res, next) => {
    const error = validar(
        req.body,
        reglasLogin
    )
    if (error.length > 0) {
        return res.status(400).json({ error })
    }
    next()
}
const validateInputRecuperarPassword = (req, res, next) => {
    const error = validar(
        req.body,
        reglasRecuperarPassword
    )
    if (error.length > 0) {
        return res.status(400).json({ error })
    }
    next()
}
const validateInputRestablecerPassword = (req, res, next) => {
    const error = validar(
        req.body,
        reglasRestablecerPassword
    )
    if (error.length > 0) {
        return res.status(400).json({ error })
    }
    next()
}
module.exports = {
    validateInputRegistro,
    validateInputLogin,
    validateInputRecuperarPassword,
    validateInputRestablecerPassword
}
