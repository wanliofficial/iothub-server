import amqp from 'amqplib'
import bson from 'bson'
import config from 'dotenv'

config.config()

class NotifyService {
    constructor (exchangeName, exchangeType) {
        this.connection = null;
        this.channel = null;
        this.exchangeType = exchangeType || "direct";
        this.exchangeName = exchangeName || "iothub.events.upload_data";
        this._init(this.exchangeName, this.exchangeType);
    }
    async _init(exchangeName, exchangeType) {
        try {
            // 1. 创建链接对象
            this.connection = await amqp.connect(process.env.RABBITMQ_URL);
            // 2. 获取通道
            this.channel = await this.connection.createChannel();
            // 3. 声明交换机
            await this.channel.assertExchange(exchangeName, exchangeType, { durable: true });
        } catch (e) {
            console.log(e)
        }
    }
    sendQueueMsg (exchangeName, routingKey, msg) {
        // 4. 发布消息
        this.channel.publish(exchangeName || this.exchangeName, routingKey, Buffer.from(msg), { persistent: false, mandatory: true }); // persistent 消息持久化
    }
    async createChannel () {
        // 创建连接频道
        this.channel = await this.connection.createChannel();
    }
    closeChannel () {
        // 关闭连接频道
        this.channel.close();
    }
    close () {
        // 关闭连接频道和tcp连接
        this.channel.close();
        this.connection.close();
    }
    notifyUploadData(message) {
        const data = bson.serialize({
            device_name: message.device_name,
            payload: message.payload,
            send_at: message.sendAt,
            data_type: message.dataType,
            message_id: message.id
        })
        this.channel && this.channel.publish(this.exchangeName, message.product_name, data, {
            persistent: true
        })
    }
    notifyUpdateStatus({ productName, deviceName, deviceStatus }) {
        const updateStatusExchange = "iothub.events.update_status"
        const data = bson.serialize({
            device_name: deviceName,
            device_status: deviceStatus
        });
        if (this.channel) this.channel.publish(updateStatusExchange, productName, data)
    }
    notifyCommandResp({ productName, deviceName, command, requestId, ts, payload }) {
        const commandRespExchange = "iothub.events.cmd_resp"
        const data = bson.serialize({
            device_name: deviceName,
            command: command,
            request_id: requestId,
            send_at: ts,
            payload: payload
        })
        if (this.channel) this.channel.publish(commandRespExchange, productName, data)
    }
    notifyDataRequest({ productName, deviceName, resource, payload }) {
        const dataRequestRespExchange = "iothub.events.data_request"
        const data = bson.serialize({
            device_name: deviceName,
            resource: resource,
            payload: payload
        })
        if (this.channel) this.channel.publish(dataRequestRespExchange, productName, data)
    }
}

export default new NotifyService()