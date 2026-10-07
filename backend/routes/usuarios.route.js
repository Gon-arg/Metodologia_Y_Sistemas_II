const express=require('express')
const router=express.Router()
const usuariosController=require('../controllers/usuarios.controller')
const {validateActualizarUsuario}=require('../middlewares/usuarios-validator')
const {verificarToken}=require('../middlewares/auth.middleware')

router.get('/me',verificarToken,usuariosController.obtenerPorId)
router.put('/me',verificarToken,validateActualizarUsuario,usuariosController.actualizar)
router.delete('/me',verificarToken,usuariosController.eliminar)

module.exports=router