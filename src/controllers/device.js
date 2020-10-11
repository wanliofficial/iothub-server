import Device from "../models/device"
import DeviceACL from "../models/device-acl"
import Connection from "../models/connection"
import helper from '../utils/helper'
import UtilsService from '../services/utilsService'
import EMQXService from '../services/emqxService'
import  * as utils from '../utils/index'
import shortid from 'shortid'
import bson from 'bson'

const ObjectId = bson.ObjectID;

class deviceController {
    static async add(ctx) {
        let productName = ctx.request.body.product_name
        let deviceName = shortid.generate();
        let secret = shortid.generate();

        const device = new Device({
            product_name: productName,
            device_name: deviceName,
            secret: secret,
            broker_username: `${productName}/${deviceName}`,
            status: "active"
        })

        const res = await device.save();
        const connection = new Connection({
            connected: false,
            client_id: `${productName}-${deviceName}`,
            keepalive: 0,
            ipaddress: '127.0.0.1',
            proto_ver: 0,
            connected_at: 0,
            disconnected_at: 0,
            device: res._id
        })
        await connection.save()

        const aclRules = device.getACLRule();
        const deviceACL = new DeviceACL({
            broker_username: device.broker_username,
            publish: aclRules.publish,
            subscribe: aclRules.subscribe,
            pubsub: aclRules.pubsub
        });

        await deviceACL.save();

        helper.responseFormat(ctx, 200, 'success', res);

        // device.save((err) => {
        //     if(err) helper.responseFormat(ctx, 500, 'error', err)
        //     else helper.responseFormat(ctx, 200, 'success', { product_name: productName, device_name: deviceName, secret: secret })
        // })
    }
    static async getDevice(ctx) {
        const productName = ctx.params.productName,
            deviceName = ctx.params.deviceName;
        const device = await Device.findOne({ 'product_name': productName, 'device_name': deviceName });

        if (device) {
            const connection = await Connection.findOne({ 'device': device._id });
            helper.responseFormat(ctx, 200, 'success', Object.assign(device.toJSONObject(), { connection: connection.length && connection.map(conn => conn.toJSONObject()) || [] }));
        }
        else helper.responseFormat(ctx, 404, 'no data found')
    }
    static async getProductList(ctx) {
        const productName = ctx.params.productName;
        const products = await Device.find({ 'product_name': productName });
        helper.responseFormat(ctx, 200, 'success', products.map(d => d.toJSONObject()));
    }
    static async getDeviceList(ctx) {
        const list = await Device.find({ is_online: true });
        // Device.find({}, "_id", { skip: 3 , limit: 1 }, (err , docs) => {
        //     if(err) helper.responseFormat(ctx, 500, 'success', err)
        //     else helper.responseFormat(ctx, 200, 'success', docs)
        // });
        helper.responseFormat(ctx, 200, 'success', list.map(d => d.toJSONObject()));
    }
    static async disableDevice(ctx) { // 禁用设备
        const productName = ctx.params.productName,
            deviceName = ctx.params.deviceName;
        const device = await Device.findOneAndUpdate({ "product_name": productName, "device_name": deviceName }, { status: "suspend" }, { useFindAndModify: false }).exec()
        if (device) device.disconnect()
        helper.responseFormat(ctx, 200, 'success', device)
    }
    static async activateDevice(ctx) { // 启用设备
        const productName = ctx.params.productName,
            deviceName = ctx.params.deviceName;
        const device = await Device.findOneAndUpdate({ "product_name": productName, "device_name": deviceName }, { status: "active" }, { useFindAndModify: false }).exec()
        helper.responseFormat(ctx, 200, 'success', device)
    }
    static async deleteDevice(ctx) {
        const productName = ctx.params.productName,
            deviceName = ctx.params.deviceName;
        const device = await Device.findOne({ "product_name": productName, "device_name": deviceName }).exec();
        if (device) {
            device.disconnect()
            device.remove()
            helper.responseFormat(ctx, 404, 'no data found')
        } else helper.responseFormat(ctx, 200, 'success', device)
    }
    static async sendCommand(ctx) {
        const productName = ctx.params.productName,
            deviceName = ctx.params.deviceName,
            useRpc = ctx.request.body.use_rpc;

        const device = await Device.findOne({ "product_name": productName, "device_name": deviceName }).exec()

        if (device) {
            let ttl = ctx.request.body.ttl != null ? parseInt(ctx.request.body.ttl) : null

            if (useRpc) ttl = 5

            const requestId = await device.sendCommand({
                commandName: ctx.request.body.command,
                data: utils.isJSON(ctx.request.body.data) ? ctx.request.body.data : JSON.stringify({ 'data': ctx.request.body.data }),
                encoding: ctx.request.body.encoding || "plain",
                ttl: ttl,
                commandType: useRpc ? "rpc" : "cmd"
            })

            if (useRpc) UtilsService.waitKey(`cmd_res/${requestId}`, ttl, val => {
                if (val == null) helper.responseFormat(ctx, 201, 'error', { msg: 'rpc timeout' })
                else helper.responseFormat(ctx, 200, 'success', { response: val.toString("base64") })
            })
            else helper.responseFormat(ctx, 200, 'success', { request_id: requestId, command: ctx.request.body.command })
        } else helper.responseFormat(ctx, 404, 'no data found')
    }
    static async updateTags(ctx) {
        const productName = ctx.params.productName,
            deviceName = ctx.params.deviceName,
            tags = ctx.request.body.tags.split(",");

        Device.findOne({ "product_name": productName, "device_name": deviceName }, (err, device) => {
            if (err) helper.responseFormat(ctx, 500, 'no data found')
            else if (device) {
                device.tags = tags
                device.tags_version += 1
                device.save()
                device.sendTags()
                helper.responseFormat(ctx, 200, 'success')
            } else helper.responseFormat(ctx, 404, 'no data found')
        })
    }
    static async sendTags(ctx) {
        const productName = ctx.params.productName,
            commandName = ctx.request.body.command,
            encoding = ctx.request.body.encoding || "plain",
            data = ctx.request.body.data;

        const ttl = ctx.request.body.ttl != null ? parseInt(ctx.request.body.ttl) : null

        const requestId = new ObjectId().toHexString()
        let topic = `tags/${productName}/${ctx.params.tag}/cmd/${commandName}/${encoding}/${requestId}`

        if (ttl) topic = `${topic}/${Math.floor(Date.now() / 1000) + ttl}`
        const result = await EMQXService.publishTo({ topic: topic, payload: data })
        helper.responseFormat(ctx, 200, 'success', Object.assign({ request_id: requestId }, result.body))
    }
    static async updateShadow(ctx) {
        const productName = ctx.params.productName,
            deviceName = ctx.params.deviceName;

        const device = await Device.findOne({ "product_name": productName, "device_name": deviceName })

        if (err) helper.responseFormat(ctx, 500, 'no data found')
        else if (device != null) {
            if (device.updateShadowDesired(ctx.request.body.desired, ctx.request.body.version)) helper.responseFormat(ctx, 200, 'success')
            else helper.responseFormat(ctx, 409, 'version out of date')
        } else helper.responseFormat(ctx, 404, 'no data found')
    }
}

export default deviceController