const pool=require('../config/conexion-db')
const obtenerPorUsuario=async(usuarioId)=>{
    const resultado=await pool.query(
        'SELECT id,usuario_id,nombre,monto_objetivo,monto_actual,estado,fecha_limite,creado_en FROM metas_ahorro WHERE usuario_id=$1 ORDER BY id DESC',
        [usuarioId]
    )
    return resultado.rows
}
const obtenerPorId=async(id,usuarioId)=>{
    const resultado=await pool.query(
        'SELECT id,usuario_id,nombre,monto_objetivo,monto_actual,estado,fecha_limite,creado_en FROM metas_ahorro WHERE id=$1 AND usuario_id=$2',
        [id,usuarioId]
    )
    if(resultado.rows.length===0){
        throw new Error('Meta no encontrada')
    }
    return resultado.rows[0]
}
const crear=async(usuarioId,nombre,monto_objetivo,monto_actual,estado,fecha_limite)=>{
    const resultado=await pool.query(
        `INSERT INTO metas_ahorro(usuario_id,nombre,monto_objetivo,monto_actual,estado,fecha_limite)
         VALUES($1,$2,$3,COALESCE($4,0.00),COALESCE($5,'en proceso'),$6)
         RETURNING id,usuario_id,nombre,monto_objetivo,monto_actual,estado,fecha_limite,creado_en`,
        [usuarioId,nombre,monto_objetivo,monto_actual,estado,fecha_limite||null]
    )
    return resultado.rows[0]
}
const actualizar=async(id,usuarioId,nombre,monto_objetivo,monto_actual,estado,fecha_limite)=>{
    const campos=[]
    const valores=[]
    let posicion=1
    if(nombre!==undefined){
        campos.push(`nombre=$${posicion}`)
        valores.push(nombre)
        posicion++
    }
    if(monto_objetivo!==undefined){
        campos.push(`monto_objetivo=$${posicion}`)
        valores.push(monto_objetivo)
        posicion++
    }
    if(monto_actual!==undefined){
        campos.push(`monto_actual=$${posicion}`)
        valores.push(monto_actual)
        posicion++
    }
    if(estado!==undefined){
        campos.push(`estado=$${posicion}`)
        valores.push(estado)
        posicion++
    }
    if(fecha_limite!==undefined){
        campos.push(`fecha_limite=$${posicion}`)
        valores.push(fecha_limite)
        posicion++
    }
    if(campos.length===0){
        throw new Error('No hay datos para actualizar')
    }
    valores.push(id)
    valores.push(usuarioId)
    const resultado=await pool.query(
        `UPDATE metas_ahorro
         SET ${campos.join(',')}
         WHERE id=$${posicion} AND usuario_id=$${posicion+1}
         RETURNING id,usuario_id,nombre,monto_objetivo,monto_actual,estado,fecha_limite,creado_en`,
        valores
    )
    if(resultado.rows.length===0){
        throw new Error('Meta no encontrada')
    }
    return resultado.rows[0]
}
const eliminar=async(id,usuarioId)=>{
    const resultado=await pool.query(
        'DELETE FROM metas_ahorro WHERE id=$1 AND usuario_id=$2 RETURNING id,usuario_id,nombre,monto_objetivo,monto_actual,estado,fecha_limite,creado_en',
        [id,usuarioId]
    )
    if(resultado.rows.length===0){
        throw new Error('Meta no encontrada')
    }
    return resultado.rows[0]
}
module.exports={obtenerPorUsuario,obtenerPorId,crear,actualizar,eliminar}