import koaRouter from 'koa-router'
import tokenController from '../controllers/token'
const router = koaRouter()

router.prefix('/token')

router.post('/', tokenController.generate)

export default router