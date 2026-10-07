const pool=require('../config/conexion-db')
const obtenerPorUsuario=async(usuarioId)=>{
    const resultado=await pool.query(
        `SELECT a.id,a.meta_id,a.monto,a.fecha,a.descripcion,a.creado_en
         FROM aportes_metas a
         INNER JOIN metas_ahorro m ON m.id=a.meta_id
         WHERE m.usuario_id=$1
         ORDER BY a.fecha DESC,a.id DESC`,
        [usuarioId]
    )
    return resultado.rows
}
const obtenerPorId=async(id,usuarioId)=>{
    const resultado=await pool.query(
        `SELECT a.id,a.meta_id,a.monto,a.fecha,a.descripcion,a.creado_en
         FROM aportes_metas a
         INNER JOIN metas_ahorro m ON m.id=a.meta_id
         WHERE a.id=$1 AND m.usuario_id=$2`,
        [id,usuarioId]
    )
    if(resultado.rows.length===0){
        throw new Error('Aporte no encontrado')
    }
    return resultado.rows[0]
}
const obtenerPorMeta=async(metaId,usuarioId)=>{
    const resultado=await pool.query(
        `SELECT a.id,a.meta_id,a.monto,a.fecha,a.descripcion,a.creado_en
         FROM aportes_metas a
         INNER JOIN metas_ahorro m ON m.id=a.meta_id
         WHERE a.meta_id=$1 AND m.usuario_id=$2
         ORDER BY a.fecha DESC,a.id DESC`,
        [metaId,usuarioId]
    )
    return resultado.rows
}
const crear=async(metaId,usuarioId,monto,descripcion)=>{
    const meta=await pool.query(
        'SELECT id FROM metas_ahorro WHERE id=$1 AND usuario_id=$2',
        [metaId,usuarioId]
    )
    if(meta.rows.length===0){
        throw new Error('La meta no pertenece al usuario')
    }
    const resultado=await pool.query(
        'INSERT INTO aportes_metas(meta_id,monto,descripcion) VALUES($1,$2,$3) RETURNING id,meta_id,monto,fecha,descripcion,creado_en',
        [metaId,monto,descripcion||null]
    )
    return resultado.rows[0]
}
const actualizar=async(id,usuarioId,metaId,monto,descripcion)=>{
    const aporte=await pool.query(
        `SELECT a.id
         FROM aportes_metas a
         INNER JOIN metas_ahorro m ON m.id=a.meta_id
         WHERE a.id=$1 AND m.usuario_id=$2`,
        [id,usuarioId]
    )
    if(aporte.rows.length===0){
        throw new Error('Aporte no encontrado')
    }
    if(metaId!==undefined){
        const meta=await pool.query(
            'SELECT id FROM metas_ahorro WHERE id=$1 AND usuario_id=$2',
            [metaId,usuarioId]
        )
        if(meta.rows.length===0){
            throw new Error('La meta no pertenece al usuario')
        }
    }
    const campos=[]
    const valores=[]
    let posicion=1
    if(metaId!==undefined){
        campos.push(`meta_id=$${posicion}`)
        valores.push(metaId)
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
    if(campos.length===0){
        throw new Error('No hay datos para actualizar')
    }
    valores.push(id)
    const resultado=await pool.query(
        `UPDATE aportes_metas
         SET ${campos.join(',')}
         WHERE id=$${posicion}
         RETURNING id,meta_id,monto,fecha,descripcion,creado_en`,
        valores
    )
    if(resultado.rows.length===0){
        throw new Error('Aporte no encontrado')
    }
    return resultado.rows[0]
}
const eliminar=async(id,usuarioId)=>{
    const resultado=await pool.query(
        `DELETE FROM aportes_metas a
         USING metas_ahorro m
         WHERE a.id=$1 AND a.meta_id=m.id AND m.usuario_id=$2
         RETURNING a.id,a.meta_id,a.monto,a.fecha,a.descripcion,a.creado_en`,
        [id,usuarioId]
    )
    if(resultado.rows.length===0){
        throw new Error('Aporte no encontrado')
    }
    return resultado.rows[0]
}
module.exports={obtenerPorUsuario,obtenerPorId,obtenerPorMeta,crear,actualizar,eliminar}