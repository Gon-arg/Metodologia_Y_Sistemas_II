const express = require('express')
const router = express.Router()
const movimientosController = require('../controllers/movimientos.controller')
const {validateCrearMovimiento, validateActualizarMovimiento} = require('../middlewares/movimientos-validator')
const { verificarToken } = require('../middlewares/auth.middleware')

router.get('/', verificarToken, movimientosController.obtenerTodas)
router.get('/usuario/:usuario_id', verificarToken, movimientosController.obtenerPorUsuario)
router.get('/categoria/:categoria_id', verificarToken, movimientosController.obtenerPorCategoria)
router.get('/:id', verificarToken, movimientosController.obtenerPorId)
router.post('/', verificarToken, validateCrearMovimiento, movimientosController.crear)
router.put('/:id', verificarToken, validateActualizarMovimiento, movimientosController.actualizar)
router.delete('/:id', verificarToken, movimientosController.eliminar)

module.exports = router