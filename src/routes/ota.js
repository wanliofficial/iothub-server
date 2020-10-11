import koaRouter from 'koa-router'
import otaController from '../controllers/ota'

const router = koaRouter()

router.prefix('/ota')

router.get('/:productName/:deviceName', otaController.get)

router.post('/:productName/:deviceName', otaController.sendOTA)

export default router