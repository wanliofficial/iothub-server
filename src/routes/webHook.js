import koaRouter from 'koa-router'
import webHookController from '../controllers/webHook'
const router = koaRouter()

router.prefix('/webHook')

router.get('/', webHookController.get)

router.post('/', webHookController.post)

export default router