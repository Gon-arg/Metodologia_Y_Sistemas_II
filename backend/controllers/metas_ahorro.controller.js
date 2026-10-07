const metasAhorroService=require('../services/metas_ahorro.service')
const obtenerPorUsuario=async(req,res)=>{
    try{
        const usuarioId=req.usuario.id
        const metas=await metasAhorroService.obtenerPorUsuario(usuarioId)
        res.status(200).json({
            ok:true,
            metas
        })
    }catch(error){
        console.error('Error al obtener metas del usuario:',error)
        res.status(500).json({
            ok:false,
            mensaje:'Error al obtener las metas del usuario'
        })
    }
}
const obtenerPorId=async(req,res)=>{
    try{
        const {id}=req.params
        const usuarioId=req.usuario.id
        const meta=await metasAhorroService.obtenerPorId(id,usuarioId)
        res.status(200).json({
            ok:true,
            meta
        })
    }catch(error){
        console.error('Error al obtener meta:',error)
        if(error.message==='Meta no encontrada'){
            return res.status(404).json({
                ok:false,
                mensaje:error.message
            })
        }
        res.status(500).json({
            ok:false,
            mensaje:'Error al obtener la meta'
        })
    }
}
const crear=async(req,res)=>{
    try{
        const usuarioId=req.usuario.id
        const {nombre,monto_objetivo,monto_actual,estado,fecha_limite}=req.body
        const meta=await metasAhorroService.crear(usuarioId,nombre,monto_objetivo,monto_actual,estado,fecha_limite)
        res.status(201).json({
            ok:true,
            mensaje:'Meta creada correctamente',
            meta
        })
    }catch(error){
        console.error('Error al crear meta:',error)
        res.status(500).json({
            ok:false,
            mensaje:'Error al crear la meta'
        })
    }
}
const actualizar=async(req,res)=>{
    try{
        const {id}=req.params
        const usuarioId=req.usuario.id
        const {nombre,monto_objetivo,monto_actual,estado,fecha_limite}=req.body
        const meta=await metasAhorroService.actualizar(id,usuarioId,nombre,monto_objetivo,monto_actual,estado,fecha_limite)
        res.status(200).json({
            ok:true,
            mensaje:'Meta actualizada correctamente',
            meta
        })
    }catch(error){
        console.error('Error al actualizar meta:',error)
        if(error.message==='Meta no encontrada'){
            return res.status(404).json({
                ok:false,
                mensaje:error.message
            })
        }
        res.status(500).json({
            ok:false,
            mensaje:'Error al actualizar la meta'
        })
    }
}
const eliminar=async(req,res)=>{
    try{
        const {id}=req.params
        const usuarioId=req.usuario.id
        const meta=await metasAhorroService.eliminar(id,usuarioId)
        res.status(200).json({
            ok:true,
            mensaje:'Meta eliminada correctamente',
            meta
        })
    }catch(error){
        console.error('Error al eliminar meta:',error)
        if(error.message==='Meta no encontrada'){
            return res.status(404).json({
                ok:false,
                mensaje:error.message
            })
        }
        res.status(500).json({
            ok:false,
            mensaje:'Error al eliminar la meta'
        })
    }
}
module.exports={obtenerPorUsuario,obtenerPorId,crear,actualizar,eliminar}