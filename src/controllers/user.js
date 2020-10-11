import helper from'../utils/helper'
import * as utils from '../utils/index'
import User from '../models/user'
import WeChatService from '../services/wxService'

class userContronller {
    static async getList(ctx) {
        let limit = null, page = null, count = 0;
        if (ctx.query.page && !isNaN(ctx.query.page)) page = parseInt(ctx.query.page);
        if (ctx.query.limit && !isNaN(ctx.query.limit)) limit = parseInt(ctx.query.limit);

        let result = null;

        if (limit && page) {
            count = await User.where({}).count();
            result = await User.find({}).skip(page * limit).limit(limit);
        }
        else result = await User.find({});

        if (result && result.length) {
            if (limit && page) helper.responseFormat(ctx, 200, 'success', result, { limit, page, count });
            else helper.responseFormat(ctx, 200, 'success', result);
        }
        else helper.responseFormat(ctx, 204, 'no data');
    }
    static async getUser(ctx) {
        const openid = ctx.params.id;
        const result = await User.findOne({ openid: openid });

        if (result) helper.responseFormat(ctx, 200, 'success', result);
        else helper.responseFormat(ctx, 204, 'no data');
    }
    static async getOpenid(ctx) {
        const code = ctx.request.body.code;
        const result = await WeChatService.getOpenid(code);

        helper.responseFormat(ctx, 200, 'success', result);
    }
    static async addUser(ctx) {
        // const user = new User({
        //     openid: ctx.request.body.openid,
        //     session_key: ctx.request.body.session_key,
        //     nickName: ctx.request.body.nickName,
        //     avatarUrl: ctx.request.body.avatarUrl,
        //     gender: ctx.request.body.gender,
        //     country: ctx.request.body.country,
        //     province: ctx.request.body.province,
        //     city: ctx.request.body.city,
        //     language: ctx.request.body.language,
        //     createTime: utils.formatTime(new Date())
        // });
        // const result = await user.save()

        const user_body = {
            openid: ctx.request.body.openid,
            session_key: ctx.request.body.session_key,
            nickName: ctx.request.body.nickName,
            avatarUrl: ctx.request.body.avatarUrl,
            gender: ctx.request.body.gender,
            country: ctx.request.body.country,
            province: ctx.request.body.province,
            city: ctx.request.body.city,
            language: ctx.request.body.language,
            createTime: utils.formatTime(new Date())
        }

        const result = await User.update({ openid: ctx.request.body.openid }, { $set: user_body }, { upsert: true });

        helper.responseFormat(ctx, 200, 'success', result)
    }
}

export default userContronller