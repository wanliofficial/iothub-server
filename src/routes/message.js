import koaRouter from 'koa-router'
import messageContronller from '../controllers/message'
import { verifyQueryMessage } from '../validators/message'
const router = koaRouter()

router.prefix('/message')

router.get('/test/:id', messageContronller.get)

router.get('/:product_name', verifyQueryMessage, messageContronller.getMessageByProductName)

router.get('/json', (ctx, next) => {
  if (!ctx.query.pageSize) ctx.query.pageSize = 15;
  else ctx.query.pageSize = parseInt(ctx.query.pageSize);
  if (!ctx.query.currentPage) ctx.query.currentPage = 0;
  else ctx.query.currentPage = parseInt(ctx.query.currentPage) - 1;
  return next();
}, messageContronller.add)

export default router
