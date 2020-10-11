import koaRouter from 'koa-router'
import dataController from '../controllers/data'

const router = koaRouter()

router.prefix('/data')

router.get('/:productName/:deviceName/operation', dataController.getOperationData)

router.get('/:productName/:deviceName/edc', dataController.getDeviceEDCData)

export default router