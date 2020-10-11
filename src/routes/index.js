import proxyRouter from './proxy'
import tokenRouter from './token'
import webHookRouter from './webHook'
import deviceRouter from './device'
import messageRouter from './message'
import dataRouter from './data'
import userRouter from './user'
import otaRouter from './ota'

export default [
	webHookRouter,
	tokenRouter,
	deviceRouter,
	proxyRouter,
	messageRouter,
	dataRouter,
	userRouter,
	otaRouter
]