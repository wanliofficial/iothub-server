import helper from'../utils/helper'
import * as utils from '../utils/index'
import Message from '../models/message'

class messageContronller {
    static async getMessageByProductName(ctx) {
        const query = { del_flag: 0 };
        if (ctx.query.message_id) query.message_id = ctx.query.message_id;
        if (ctx.query.device_name) query.device_name = ctx.query.device_name;
        else helper.responseFormat(ctx, 400, 'error', { msg: 'device name can not be null' })
        if (ctx.params.product_name) query.product_name = ctx.params.product_name;
        
        Message.find(query, (error, messages) => {
            if (error) helper.responseFormat(ctx, 500, 'success', error)
            else helper.responseFormat(ctx, 200, 'success', messages.map(function(message) {
                return message.toJSONObject()
            }))
        })
    }
    static async get(ctx) {
        helper.responseFormat(ctx, 200, 'success', { 'method': 'get', 'id': ctx.params.id })
    }
    static async add(ctx) {
        const result = await add({
            areaCode: ctx.body.areaCode || null,
            areaName: ctx.body.areaName,
            level: ctx.body.level || 0,
            cityCode: ctx.body.cityCode || null,
            center: ctx.body.center || "",
            sort: ctx.body.sort || 0,
            create_date: utils.formatTime(new Date()),
            create_by: ctx.body.userId,
            update_date: utils.formatTime(new Date()),
            update_by: ctx.body.userId,
            level: 0,
            parentId: 0,
            has_children: 0,
            del_flag: 0
        });

        helper.responseFormat(ctx, 200, 'success', result)
    }
}

export default messageContronller