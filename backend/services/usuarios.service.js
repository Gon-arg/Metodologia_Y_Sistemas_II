const pool=require('../config/conexion-db')
const bcrypt=require('bcrypt')
const obtenerPorId=async(usuarioId)=>{
    const resultado=await pool.query(
        `SELECT id,nombre,email,creado_en
         FROM usuarios
         WHERE id=$1`,
        [usuarioId]
    )
    if(resultado.rows.length===0){
        throw new Error('Usuario no encontrado')
    }
    return resultado.rows[0]
}
const obtenerPorEmail=async(email)=>{
    const resultado=await pool.query(
        `SELECT id,nombre,email,password_hash,creado_en
         FROM usuarios
         WHERE email=$1`,
        [email]
    )
    if(resultado.rows.length===0){
        throw new Error('Usuario no encontrado')
    }
    return resultado.rows[0]
}
const actualizar=async(usuarioId,nombre,email,password)=>{
    const campos=[]
    const valores=[]
    let posicion=1
    if(nombre!==undefined){
        campos.push(`nombre=$${posicion}`)
        valores.push(nombre)
        posicion++
    }
    if(email!==undefined){
        campos.push(`email=$${posicion}`)
        valores.push(email)
        posicion++
    }
    if(password!==undefined){
        const passwordHash=await bcrypt.hash(password,10)
        campos.push(`password_hash=$${posicion}`)
        valores.push(passwordHash)
        posicion++
    }
    if(campos.length===0){
        throw new Error('No hay datos para actualizar')
    }
    valores.push(usuarioId)
    const resultado=await pool.query(
        `UPDATE usuarios
         SET ${campos.join(',')}
         WHERE id=$${posicion}
         RETURNING id,nombre,email,creado_en`,
        valores
    )
    if(resultado.rows.length===0){
        throw new Error('Usuario no encontrado')
    }
    return resultado.rows[0]
}
const eliminar=async(usuarioId)=>{
    const resultado=await pool.query(
        `DELETE FROM usuarios
         WHERE id=$1
         RETURNING id,nombre,email,creado_en`,
        [usuarioId]
    )
    if(resultado.rows.length===0){
        throw new Error('Usuario no encontrado')
    }
    return resultado.rows[0]
}
module.exports={obtenerPorId,obtenerPorEmail,actualizar,eliminar}