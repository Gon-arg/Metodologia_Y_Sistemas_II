const validar = require('../utils/validator')
const reglasCategoria = {
    nombre: {
        requerido: true,
        tipo: 'string',
        noVacio: true,
        max: 50,
        trim: true,
        mensajeRequerido:
            'El nombre de la categoría es obligatorio',
        mensajeTipo:
            'El nombre de la categoría debe ser texto',
        mensajeVacio:
            'El nombre de la categoría no puede estar vacío',
        mensajeMax:
            'El nombre de la categoría no puede superar los 50 caracteres'
    }
}
const validarCrearCategoria = (req, res, next) => {
    const errors = validar(
        req.body,
        reglasCategoria
    )
    if (errors.length > 0) {
        return res.status(400).json({ errors })
    }
    next()
}
const validarActualizarCategoria = (req, res, next) => {
    const errors = validar(
        req.body,
        reglasCategoria
    )
    if (errors.length > 0) {
        return res.status(400).json({ errors })
    }
    next()
}
module.exports = {
    validarCrearCategoria,
    validarActualizarCategoria
}
