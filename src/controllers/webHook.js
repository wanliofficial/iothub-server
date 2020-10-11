import Device from '../models/device'
import helper from '../utils/helper'
import MessageService from "../services/messageService"

class webHookController {
    static async get(ctx) {
        helper.responseFormat(ctx, 200, 'success', ctx.request.body)
    }
    static async post(ctx) {
        if (!ctx.request.body.action) helper.responseFormat(ctx, 403, 'error', { 'msg': 'parameters error' });

        switch (ctx.request.body.action) {
            case 'client_connected': Device.addConnection(ctx.request.body); break;
            case 'client_disconnected': Device.removeConnection(ctx.request.body); break;
            case 'message_publish': MessageService.dispatchMessage({
                topic: ctx.request.body.topic,
                payload: ctx.request.body.payload,
                ts: ctx.request.body.ts
            }); break;
        }
        helper.responseFormat(ctx, 200, 'success', { 'msg': 'ok' });
    }
}

export default webHookController