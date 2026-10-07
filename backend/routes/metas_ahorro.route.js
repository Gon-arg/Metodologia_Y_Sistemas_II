const express=require('express')
const router=express.Router()
const metasAhorroController=require('../controllers/metas_ahorro.controller')
const {validateCrearMetaAhorro,validateActualizarMetaAhorro}=require('../middlewares/metas_ahorro-validator')
const {verificarToken}=require('../middlewares/auth.middleware')

router.get('/',verificarToken,metasAhorroController.obtenerPorUsuario)
router.get('/:id',verificarToken,metasAhorroController.obtenerPorId)
router.post('/',verificarToken,validateCrearMetaAhorro,metasAhorroController.crear)
router.put('/:id',verificarToken,validateActualizarMetaAhorro,metasAhorroController.actualizar)
router.delete('/:id',verificarToken,metasAhorroController.eliminar)

module.exports=router