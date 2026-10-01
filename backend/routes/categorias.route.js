const express=require('express')
const router=express.Router()
const categoriasController=require('../controllers/categorias.controller')
const {validarCrearCategoria, validarActualizarCategoria}=require('../middlewares/categorias-validator')
const { verificarToken } = require('../middlewares/auth.middleware')

router.get('/',verificarToken, categoriasController.obtenerTodas)
router.get('/:id',verificarToken, categoriasController.obtenerPorId)
router.post('/',verificarToken, validarCrearCategoria,categoriasController.crear)
router.put('/:id',verificarToken, validarActualizarCategoria,categoriasController.actualizar)
router.delete('/:id',verificarToken, categoriasController.eliminar)

module.exports=router