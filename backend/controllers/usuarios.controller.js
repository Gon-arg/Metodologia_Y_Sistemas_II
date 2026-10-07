const usuariosService=require('../services/usuarios.service')
const obtenerPorId=async(req,res)=>{
    try{
        const usuarioId=req.usuario.id
        const usuario=await usuariosService.obtenerPorId(usuarioId)
        res.status(200).json({
            ok:true,
            usuario
        })
    }catch(error){
        console.error('Error al obtener usuario:',error)
        if(error.message==='Usuario no encontrado'){
            return res.status(404).json({
                ok:false,
                mensaje:error.message
            })
        }
        res.status(500).json({
            ok:false,
            mensaje:'Error al obtener el usuario'
        })
    }
}
const actualizar=async(req,res)=>{
    try{
        const usuarioId=req.usuario.id
        const {nombre,email,password}=req.body
        const usuario=await usuariosService.actualizar(usuarioId,nombre,email,password)
        res.status(200).json({
            ok:true,
            mensaje:'Usuario actualizado correctamente',
            usuario
        })
    }catch(error){
        console.error('Error al actualizar el usuario:',error)
        if(error.message==='Usuario no encontrado'){
            return res.status(404).json({
                ok:false,
                mensaje:error.message
            })
        }
        if(error.message==='No hay datos para actualizar'){
            return res.status(400).json({
                ok:false,
                mensaje:error.message
            })
        }
        if(error.code==='23505'){
            return res.status(409).json({
                ok:false,
                mensaje:'El email ya está registrado'
            })
        }
        res.status(500).json({
            ok:false,
            mensaje:'Error al actualizar el usuario'
        })
    }
}
const eliminar=async(req,res)=>{
    try{
        const usuarioId=req.usuario.id
        const usuario=await usuariosService.eliminar(usuarioId)
        res.status(200).json({
            ok:true,
            mensaje:'Usuario eliminado correctamente',
            usuario
        })
    }catch(error){
        console.error('Error al eliminar el usuario:',error)
        if(error.message==='Usuario no encontrado'){
            return res.status(404).json({
                ok:false,
                mensaje:error.message
            })
        }
        res.status(500).json({
            ok:false,
            mensaje:'Error al eliminar el usuario'
        })
    }
}
module.exports={obtenerPorId,actualizar,eliminar}