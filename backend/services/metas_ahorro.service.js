const pool=require('../config/conexion-db')
const obtenerTodas=async()=>{
  const resultado=await pool.query('SELECT id,usuario_id,nombre,monto_objetivo,monto_actual,estado,fecha_limite,creado_en FROM metas_ahorro ORDER BY id DESC')
  return resultado.rows
}
const obtenerPorId=async(id)=>{
  const resultado=await pool.query('SELECT id,usuario_id,nombre,monto_objetivo,monto_actual,estado,fecha_limite,creado_en FROM metas_ahorro WHERE id=$1',[id])
  if(resultado.rows.length===0){
    throw new Error('Meta no encontrada')
  }
  return resultado.rows[0]
}
const obtenerPorUsuario=async(usuario_id)=>{
  const resultado=await pool.query('SELECT id,usuario_id,nombre,monto_objetivo,monto_actual,estado,fecha_limite,creado_en FROM metas_ahorro WHERE usuario_id=$1 ORDER BY id DESC',[usuario_id])
  return resultado.rows
}
const crear=async(usuario_id,nombre,monto_objetivo,monto_actual,estado,fecha_limite)=>{
  const resultado=await pool.query('INSERT INTO metas_ahorro(usuario_id,nombre,monto_objetivo,monto_actual,estado,fecha_limite) VALUES($1,$2,$3,COALESCE($4,0.00),COALESCE($5,\'en proceso\'),$6) RETURNING id,usuario_id,nombre,monto_objetivo,monto_actual,estado,fecha_limite,creado_en',[usuario_id,nombre,monto_objetivo,monto_actual,estado,fecha_limite||null])
  return resultado.rows[0]
}
const actualizar=async(id,usuario_id,nombre,monto_objetivo,monto_actual,estado,fecha_limite)=>{
  const campos=[]
  const valores=[]
  let posicion=1
  if(usuario_id!==undefined){
    campos.push(`usuario_id=$${posicion}`)
    valores.push(usuario_id)
    posicion++
  }
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
  valores.push(id)
  const resultado=await pool.query(`UPDATE metas_ahorro SET ${campos.join(',')} WHERE id=$${posicion} RETURNING id,usuario_id,nombre,monto_objetivo,monto_actual,estado,fecha_limite,creado_en`,valores)
  if(resultado.rows.length===0){
    throw new Error('Meta no encontrada')
  }
  return resultado.rows[0]
}
const eliminar=async(id)=>{
  const resultado=await pool.query('DELETE FROM metas_ahorro WHERE id=$1 RETURNING id,usuario_id,nombre,monto_objetivo,monto_actual,estado,fecha_limite,creado_en',[id])
  if(resultado.rows.length===0){
    throw new Error('Meta no encontrada')
  }
  return resultado.rows[0]
}
module.exports={obtenerTodas,obtenerPorId,obtenerPorUsuario,crear,actualizar,eliminar}