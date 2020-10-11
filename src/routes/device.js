import koaRouter from 'koa-router'
import deviceController from '../controllers/device'
import { verifyAddDevice } from '../validators/device'

const router = koaRouter()

router.prefix('/device')

router.get('/list', deviceController.getDeviceList)
router.get('/:productName', deviceController.getProductList)
router.get('/:productName/:deviceName', deviceController.getDevice)

// product_name不能包含# / +以及 IotHub 预留的一些字符,，这里尚未验证
router.post('/', verifyAddDevice, deviceController.add)
router.post('/:productName/:deviceName/command', deviceController.sendCommand)
router.post('/:productName/:tag/tags/command', deviceController.sendTags)

router.put('/:productName/:deviceName/suspend', deviceController.disableDevice)
router.put('/:productName/:deviceName/resume', deviceController.activateDevice)
router.put('/:productName/:deviceName/tags', deviceController.updateTags)
router.put('/:productName/:deviceName/shadow', deviceController.updateShadow)

router.delete('/:productName/:deviceName', deviceController.deleteDevice)

export default router