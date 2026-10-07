const pool=require('../config/conexion-db')
const obtenerPorId=async(id,usuarioId)=>{
    const resultado=await pool.query(
        'SELECT id,usuario_id,categoria_id,tipo,monto,descripcion,fecha,creado_en FROM movimientos WHERE id=$1 AND usuario_id=$2',
        [id,usuarioId]
    )
    if(resultado.rows.length===0){
        throw new Error('Movimiento no encontrado')
    }
    return resultado.rows[0]
}
const obtenerPorUsuario=async(usuarioId)=>{
    const resultado=await pool.query(
        'SELECT id,usuario_id,categoria_id,tipo,monto,descripcion,fecha,creado_en FROM movimientos WHERE usuario_id=$1 ORDER BY fecha DESC,id DESC',
        [usuarioId]
    )
    return resultado.rows
}
const obtenerPorCategoria=async(categoriaId,usuarioId)=>{
    const resultado=await pool.query(
        'SELECT id,usuario_id,categoria_id,tipo,monto,descripcion,fecha,creado_en FROM movimientos WHERE categoria_id=$1 AND usuario_id=$2 ORDER BY fecha DESC,id DESC',
        [categoriaId,usuarioId]
    )
    return resultado.rows
}
const crear=async(usuarioId,categoriaId,tipo,monto,descripcion,fecha)=>{
    const resultado=await pool.query(
        'INSERT INTO movimientos(usuario_id,categoria_id,tipo,monto,descripcion,fecha) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,usuario_id,categoria_id,tipo,monto,descripcion,fecha,creado_en',
        [usuarioId,categoriaId,tipo,monto,descripcion||null,fecha]
    )
    return resultado.rows[0]
}
const actualizar=async(id,usuarioId,categoriaId,tipo,monto,descripcion,fecha)=>{
    const campos=[]
    const valores=[]
    let posicion=1
    if(categoriaId!==undefined){
        campos.push(`categoria_id=$${posicion}`)
        valores.push(categoriaId)
        posicion++
    }
    if(tipo!==undefined){
        campos.push(`tipo=$${posicion}`)
        valores.push(tipo)
        posicion++
    }
    if(monto!==undefined){
        campos.push(`monto=$${posicion}`)
        valores.push(monto)
        posicion++
    }
    if(descripcion!==undefined){
        campos.push(`descripcion=$${posicion}`)
        valores.push(descripcion)
        posicion++
    }
    if(fecha!==undefined){
        campos.push(`fecha=$${posicion}`)
        valores.push(fecha)
        posicion++
    }
    if(campos.length===0){
        throw new Error('No hay datos para actualizar')
    }
    valores.push(id)
    valores.push(usuarioId)
    const resultado=await pool.query(
        `UPDATE movimientos
         SET ${campos.join(',')}
         WHERE id=$${posicion} AND usuario_id=$${posicion+1}
         RETURNING id,usuario_id,categoria_id,tipo,monto,descripcion,fecha,creado_en`,
        valores
    )
    if(resultado.rows.length===0){
        throw new Error('Movimiento no encontrado')
    }
    return resultado.rows[0]
}
const eliminar=async(id,usuarioId)=>{
    const resultado=await pool.query(
        'DELETE FROM movimientos WHERE id=$1 AND usuario_id=$2 RETURNING id,usuario_id,categoria_id,tipo,monto,descripcion,fecha,creado_en',
        [id,usuarioId]
    )
    if(resultado.rows.length===0){
        throw new Error('Movimiento no encontrado')
    }
    return resultado.rows[0]
}
module.exports={obtenerPorId,obtenerPorUsuario,obtenerPorCategoria,crear,actualizar,eliminar}