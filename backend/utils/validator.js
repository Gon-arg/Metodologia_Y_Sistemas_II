const validar = (datos, reglas, opciones = {}) => {
    const error = []
    if (opciones.alMenosUnCampo) {
        const campos = Object.keys(reglas)
        const existeCampo = campos.some(
            campo => datos[campo] !== undefined
        )
        if (!existeCampo) {
            error.push(
                opciones.mensajeAlMenosUnCampo ||
                'Debe enviar al menos un campo para actualizar.'
            )
        }
    }
    for (const campo in reglas) {
        let valor = datos[campo]
        const regla = reglas[campo]
        if (
            regla.requerido === true &&
            valor === undefined
        ) {
            error.push(
                regla.mensajeRequerido ||
                `El campo ${campo} es obligatorio.`
            )
            continue
        }
        if (
            regla.requerido !== true &&
            valor === undefined
        ) {
            continue
        }
        if (
            valor === null &&
            regla.permitirNull === true
        ) {
            continue
        }
        if (
            valor === '' &&
            regla.permitirVacio === true
        ) {
            continue
        }
        if (
            regla.trim === true &&
            typeof valor === 'string'
        ) {
            valor = valor.trim()
        }
        if (
            regla.minusculas === true &&
            typeof valor === 'string'
        ) {
            valor = valor.toLowerCase()
        }
        datos[campo] = valor
        if (
            regla.tipo === 'string' &&
            typeof valor !== 'string'
        ) {
            error.push(
                regla.mensajeTipo ||
                `El campo ${campo} debe ser un texto válido.`
            )
            continue
        }
        if (
            regla.tipo === 'entero' &&
            (
                !Number.isInteger(Number(valor)) ||
                Number(valor) <= 0
            )
        ) {
            error.push(
                regla.mensajeTipo ||
                `El campo ${campo} debe ser un número entero válido.`
            )
            continue
        }
        if (
            regla.tipo === 'numero' &&
            (
                !Number.isFinite(Number(valor)) ||
                Number(valor) <= 0
            )
        ) {
            error.push(
                regla.mensajeTipo ||
                `El campo ${campo} debe ser un número mayor que 0.`
            )
            continue
        }
        if (
            regla.tipo === 'numeroNoNegativo' &&
            (
                !Number.isFinite(Number(valor)) ||
                Number(valor) < 0
            )
        ) {
            error.push(
                regla.mensajeTipo ||
                `El campo ${campo} debe ser un número mayor o igual que 0.`
            )
            continue
        }
        if (
            regla.noVacio === true &&
            typeof valor === 'string' &&
            valor.trim().length === 0
        ) {
            error.push(
                regla.mensajeVacio ||
                `El campo ${campo} no puede estar vacío.`
            )
        }
        if (
            regla.max !== undefined &&
            typeof valor === 'string' &&
            valor.length > regla.max
        ) {
            error.push(
                regla.mensajeMax ||
                `El campo ${campo} no puede superar los ${regla.max} caracteres.`
            )
        }
        if (
            regla.min !== undefined &&
            typeof valor === 'string' &&
            valor.length < regla.min
        ) {
            error.push(
                regla.mensajeMin ||
                `El campo ${campo} debe tener al menos ${regla.min} caracteres.`
            )
        }
        if (
            regla.decimales !== undefined &&
            Number.isFinite(Number(valor))
        ) {
            const texto = String(valor)
            if (texto.includes('.')) {
                const cantidadDecimales =
                    texto.split('.')[1].length
                if (cantidadDecimales > regla.decimales) {
                    error.push(
                        regla.mensajeDecimales ||
                        `El campo ${campo} no puede tener más de ${regla.decimales} decimales.`
                    )
                }
            }
        }
        if (
            regla.valores !== undefined &&
            !regla.valores.includes(valor)
        ) {
            error.push(
                regla.mensajeValores ||
                `El campo ${campo} contiene un valor no permitido.`
            )
        }
        if (
            regla.regex !== undefined &&
            typeof valor === 'string' &&
            !regla.regex.test(valor)
        ) {
            error.push(
                regla.mensajeRegex ||
                `El campo ${campo} tiene un formato inválido.`
            )
        }
    }
    return error
}
module.exports = validar
