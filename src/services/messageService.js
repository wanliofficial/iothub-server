import { pathToRegexp } from "path-to-regexp";
import redisClient from "../utils/redis";
import Message from "../models/message";
import Device from "../models/device";
import NotifyService from "./notifyService";
import OTAService from "./otaService";

class MessageService {
    static dispatchMessage({ topic, payload, ts } = {}) {
        const dataTopic = "upload_data/:productName/:deviceName/:dataType/:messageId";
        const statusTopic = "(update_status|update_ota_status)/:productName/:deviceName/:messageId";
        const cmdResTopic = "(cmd_res|rpc_res)/:productName/:deviceName/:commandName/:requestId/:messageId";
        const requestTopic = "get/:productName/:deviceName/:resource/:messageId";
        const tagTopic = "tags/:productName/:tag/cmd/:commandName/:encoding/:requestID/:expiresAt?";

        const dataReg = pathToRegexp(dataTopic);
        const statusReg = pathToRegexp(statusTopic);
        const cmdResReg = pathToRegexp(cmdResTopic);
        const requestReg = pathToRegexp(requestTopic);
        const tagReg = pathToRegexp(tagTopic);
        let result = null;

        if ((result = dataReg.exec(topic)) != null) MessageService.checkMessageDuplication(result[4], isDup => {
            if (!isDup) {
                MessageService.handleUploadData({
                    productName: result[1],
                    deviceName: result[2],
                    dataType: result[3],
                    messageId: result[4],
                    ts: ts,
                    payload: Buffer.from(payload, 'base64')
                })

                const data = JSON.parse(Buffer.from(payload, 'base64').toString())

                if (result[3] == "system-network") {
                    if (data) Device.updateNetwork({ productName: result[1], deviceName: result[2], network: data })
                    else console.error(37, data)
                } else if (result[3] == "system-information") {
                    if (data) Device.updateInformation({ productName: result[1], deviceName: result[2], information: data })
                    else console.error(40, data)
                } else if (result[3] == "system-operation") {
                    if (data.totalmem > 49152) data.totalmem = 49152
                    if (data.freemem > 49152) data.freemem = 49152
                    if (data) Device.updateOperation({ productName: result[1], deviceName: result[2], operation: data })
                    else console.error(45, data)
                } else if (result[3] == "system-location") {
                    if (data) Device.updateLocation({ productName: result[1], deviceName: result[2], location: data })
                    else console.error(48, data)
                } else if (result[3] == "system-modules") {
                    const modules = data.modules.map(item => {
                        if (item.model === 'lcd1602') return Object.assign({ name: 'LCD显示屏', picture: 'https://statics.wanliwuhan.com/images/20190206/lcd.jpg' }, item)
                        else if (item.model === 'gy-30') return Object.assign({ name: '光照传感器', picture: 'https://statics.wanliwuhan.com/images/20190206/gy-30.jpg' }, item)
                        else if (item.model === 'fc-49') return Object.assign({ name: '蜂鸣器', picture: 'https://statics.wanliwuhan.com/images/20190206/fc-49.jpg' }, item)
                        else if (item.model === 'led') return Object.assign({ name: 'LED显示', picture: 'https://statics.wanliwuhan.com/images/20190206/led.jpg' }, item)
                        else if (item.model === 'dht11') return Object.assign({ name: '温湿度传感器', picture: 'https://statics.wanliwuhan.com/images/20190206/dht11.jpg' }, item)
                        else if (item.model === 'sound-01') return Object.assign({ name: '声音传感器', picture: 'https://statics.wanliwuhan.com/images/20190206/sound-01.jpg' }, item)
                        else if (item.model === 'relay-1c') return Object.assign({ name: '继电器', picture: 'https://statics.wanliwuhan.com/images/20190206/relay-01.jpg' }, item)
                        else if (item.model === 'hcsr501') return Object.assign({ name: '活体传感器', picture: 'https://statics.wanliwuhan.com/images/20190206/HC-SR501.jpg' }, item)
                        else return item
                    })
                    if (data) Device.updateModules({ productName: result[1], deviceName: result[2], modules })
                    else console.error(52, data)
                } else if (result[3] == "system-edc") {
                    if (data) Device.updateEDC({ productName: result[1], deviceName: result[2], data: data })
                    else console.error(55, data)
                    Device.sendCommand({
                        productName: result[1],
                        deviceName: result[2],
                        commandName: "X",
                        data: "OK",
                        commandType: "xxx"
                    })
                }
            }
        })
        else if ((result = statusReg.exec(topic)) != null) MessageService.checkMessageDuplication(result[4], isDup => {
            if (!isDup) {
                payload = Buffer.from(payload, 'base64')
                if (result[1] == "update_status") MessageService.handleUpdateStatus({
                    productName: result[2],
                    deviceName: result[3],
                    deviceStatus: JSON.parse(payload.toString()),
                    ts: ts
                })
                else if (result[1] == "update_ota_status") {
                    const progress = JSON.parse(payload.toString())
                    progress.ts = ts
                    OTAService.updateProgress(result[2], result[3], progress)
                }
            }
        })
        else if ((result = cmdResReg.exec(topic)) != null) MessageService.checkMessageDuplication(result[6], isDup => {
            if (!isDup) {
                const payloadBuffer = Buffer.from(payload, 'base64')
                if (result[1] == "rpc_res") {
                    const key = `cmd_res/${result[5]}`;
                    redisClient.set(key, payloadBuffer)
                    redisClient.expire(key, 5)
                } else MessageService.handleCommandResp({
                    productName: result[2],
                    deviceName: result[3],
                    ts: ts,
                    command: result[4],
                    requestId: result[5],
                    payload: payloadBuffer
                })
            }
        })
        else if ((result = requestReg.exec(topic)) != null) MessageService.checkMessageDuplication(result[4], isDup => {
            if (!isDup) MessageService.handleDataRequest({
                productName: result[1],
                deviceName: result[2],
                resource: result[3],
                payload: payload,
                ts: ts
            })
        })
        else if ((result = tagReg.exec(topic)) != null) MessageService.checkRequestDuplication(result[5], isDup => {
            if (!isDup) MessageService.handleCommand({
                commandName: result[3],
                encoding: result[4],
                requestID: result[5],
                expiresAt: result[6] != null ? parseInt(result[6]) : null,
                payload: payload,
            })
        })
    }
    static checkMessageDuplication(messageId, callback) {
        const key = `/messageIDs/${messageId}`;
        redisClient.setnx(key, "", (err, res) => {
            if (res == 1) {
                redisClient.expire(key, 3600 * 6)
                callback.call(this, false)
            } else callback.call(this, true)
        })

    }
    static handleUploadData({ productName, deviceName, ts, payload, messageId, dataType } = {}) {
        if (dataType.startsWith("$")) {
            if (dataType == "$shadow") Device.findOne({ product_name: productName, device_name: deviceName }, function (err, device) {
                if (device) device.updateShadow(JSON.parse(payload.toString()))
            })
            else if (dataType == "$shadow_updated") Device.findOne({ product_name: productName, device_name: deviceName }, function (err, device) {
                if (device) device.reportShadow(JSON.parse(payload.toString()))
            })
        } else {
            const message = new Message({
                product_name: productName,
                device_name: deviceName,
                payload: payload,
                message_id: messageId,
                data_type: dataType,
                sent_at: ts
            })

            message.save()

            NotifyService.notifyUploadData(message)
        }
    }
    static handleUpdateStatus({ productName, deviceName, deviceStatus, ts }) {
        // Device.findOneAndUpdate({
        //     product_name: productName, device_name: deviceName,
        //     "$or": [{ last_status_update: { "$exists": false } }, { last_status_update: { "$lt": ts } }]
        // },
        //     { device_status: deviceStatus, last_status_update: ts }, { useFindAndModify: false }).exec(function (error, device) {
        //         // if (device) NotifyService.notifyUpdateStatus({
        //         //     productName: productName,
        //         //     deviceName: deviceName,
        //         //     deviceStatus: deviceStatus
        //         // })
        //         console.log(144, error)
        //     })
        Device.findOne({ product_name: productName, device_name: deviceName }, function (err, device) {
            if (device) {
                device.device_status = Object.assign(deviceStatus, { last_status_update: ts }, device.device_status)
                device.save()
            }
        })
    }
    static handleCommandResp({ productName, deviceName, command, requestId, ts, payload }) {
        // NotifyService.notifyCommandResp({
        //     productName: productName,
        //     deviceName: deviceName,
        //     command: command,
        //     requestId: requestId,
        //     ts: ts,
        //     payload: payload
        // })
        console.info(productName, deviceName, command, requestId, ts, payload)
    }
    static handleDataRequest({ productName, deviceName, resource, payload, ts }) {
        if (resource.startsWith("$")) {
            payload = Buffer.from(payload, 'base64').toString()
            if (resource == "$ntp") MessageService.handleNTP({ productName, deviceName, payload: JSON.parse(payload), ts })
            else if (resource == "$tags") Device.findOne({ product_name: productName, device_name: deviceName }, function (err, device) {
                if (device) {
                    const data = JSON.parse(payload)
                    if (data.tags_version < device.tags_version) device.sendTags()
                }
            })
            else if (resource == "$shadow") Device.findOne({ product_name: productName, device_name: deviceName }, function (err, device) {
                if (device) device.sendUpdateShadow()
            })
            else if (resource == "$shadow_updated") Device.findOne({ product_name: productName, device_name: deviceName }, function (err, device) {
                if (device) device.sendUpdateShadow()
            })
            else console.log(resource)
        } else {
            NotifyService.notifyDataRequest({
                productName: productName,
                deviceName: deviceName,
                resource: resource,
                payload: payload
            })
        }
    }
    static async handleNTP({ productName, deviceName, payload, ts }) {
        const data = {
            device_time: payload.device_time,
            iothub_recv: ts,
            iothub_send: Date.now()
        }
        await Device.sendCommand({
            productName: productName,
            deviceName: deviceName,
            data: JSON.stringify(data),
            commandName: "$set_ntp"
        })

        await Device.sendCommand({
            productName: productName,
            deviceName: deviceName,
            data: JSON.stringify({ 'code': 1024, 'msg': 'hello,world' }),
            commandName: "ping"
        })
    }
}

export default MessageService