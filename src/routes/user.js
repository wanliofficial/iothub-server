import koaRouter from 'koa-router'
import userContronller from '../controllers/user'
import { verifyAddUser, verifyGetOpenid } from '../validators/user'
const router = koaRouter()

router.prefix('/users')

router.get('/', userContronller.getList)

router.get('/:id', userContronller.getUser)

router.post('/', verifyAddUser, userContronller.addUser)

router.post('/openid', verifyGetOpenid, userContronller.getOpenid)

export default router