const express=require('express')
const router=express.Router()
const usuariosController=require('../controllers/usuarios.controller')
const {validateActualizarUsuario}=require('../middlewares/usuarios-validator')
const {verificarToken}=require('../middlewares/auth.middleware')

router.get('/:id',verificarToken,usuariosController.obtenerPorId)
router.put('/:id',verificarToken,validateActualizarUsuario,usuariosController.actualizar)
router.delete('/:id',verificarToken,usuariosController.eliminar)

module.exports=router