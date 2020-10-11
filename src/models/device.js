import mongoose from '../utils/mongodb';
import Connection from "./connection";
import Location from "./locations";
import DeviceACl from "./device-acl";
import EMQXService from '../services/emqxService';
import InfluxDBService from '../services/influxdbService';
import bson from 'bson';

const ObjectId = bson.ObjectID;
const Schema = mongoose.Schema;

const deviceSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    product_name: {
        type: String,
        required: true
    },
    device_name: {
        type: String,
        required: true
    },
    broker_username: {
        type: String,
        required: true
    },
    is_online: {
        type: Boolean,
        required: true,
        default: false
    },
    secret: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "active"
    },
    device_status: {
        type: Object,
        default: {}
    },
    last_status_update: {
        type: Number,
        default: 0
    },
    information: {
        type: Object,
        required: true,
        default: {
            arch: "",
            cpus: 0,
            hostname: "",
            platform: "",
            release: "",
            type: "",
            uptime: "",
            version: ""
        }
    },
    network: {
        type: Object,
        required: true,
        default: {}
    },
    location: {
        type: Object,
        required: true,
        default: {
            address_summary: "",
            address_detail: {
                province: "",
                city: "",
                district: "",
                street: "",
                street_number: "",
                city_code: ""
            },
            address: "",
            point: {
                y: 0,
                x: 0
            }
        }
    },
    operation: {
        type: Object,
        required: true,
        default: {
            loadavg: [],
            totalmem: 0,
            freemem: 0,
            uptime: 0
        }
    },
    modules: {
        type: Array,
        required: true,
        default: []
    },
    edc: {
        type: Object,
        required: true,
        default: {}
    },
    tags: {
        type: Array,
        default: []
    },
    tags_version: {
        type: Number,
        default: 1
    },
    shadow: {
        type: Object,
        default: {
            "state": {},
            "metadata": {},
            "version": 0
        }
    }
});

deviceSchema.methods.toJSONObject = function () {
    return {
        name: this.name,
        picture: this.picture,
        product_name: this.product_name,
        device_name: this.device_name,
        secret: this.secret,
        status: this.status,
        information: this.information,
        network: this.network,
        location: this.location,
        operation: this.operation,
        device_status: this.device_status,
        modules: this.modules,
        tags: this.tags,
        shadow: this.shadow
    }
}

deviceSchema.statics.addConnection = function (event) {
    const username = event.username.split('/');
    this.findOne({ product_name: username[0], device_name: username[1] }, (err, device) => {
        if (!err && device) {
            Device.findOneAndUpdate({ product_name: username[0], device_name: username[1] }, {
                is_online: true
            }, { useFindAndModify: false }).exec()

            Connection.findOneAndUpdate({ client_id: event.client_id, device: device._id }, {
                connected: true,
                client_id: event.client_id,
                keepalive: event.keepalive,
                ipaddress: event.ipaddress,
                proto_ver: event.proto_ver,
                connected_at: event.connected_at,
                conn_ack: event.conn_ack,
                device: device._id
            }, { upsert: true, useFindAndModify: false, new: true }).exec()

            InfluxDBService.writeConnectionData({
                productName: username[0],
                deviceName: username[1],
                connected: true,
                ts: Math.floor(event.connected_at / 1000)
            })
        }
    })
}

deviceSchema.statics.removeConnection = function (event) {
    const username = event.username.split('/');
    this.findOne({ product_name: username[0], device_name: username[1] }, (err, device) => {
        if (!err && device) {
            Device.findOneAndUpdate({ product_name: username[0], device_name: username[1] }, {
                is_online: false
            }, { useFindAndModify: false }).exec()

            Connection.findOneAndUpdate({ client_id: event.client_id, device: device._id }, {
                connected: false,
                disconnected_at: Math.floor(Date.now() / 1000)
            }, { useFindAndModify: false }).exec()

            InfluxDBService.writeConnectionData({
                productName: username[0],
                deviceName: username[1],
                connected: false
            })
        }
    })
}

deviceSchema.methods.getACLRule = function () {
    return {
        publish: [
            `upload_data/${this.product_name}/${this.device_name}/+/+`,
            `update_status/${this.product_name}/${this.device_name}/+`,
            `cmd_res/${this.product_name}/${this.device_name}/+/+/+`,
            `rpc_res/${this.product_name}/${this.device_name}/+/+/+`,
            `get/${this.product_name}/${this.device_name}/+/+`,
            `m2m/${this.product_name}/+/${this.device_name}/+`,
            `update_ota_status/${this.product_name}/${this.device_name}/+`,
        ],
        subscribe: [
            `tags/${this.product_name}/+/cmd/+/+/+/#`,
            `cmd/${this.product_name}/${this.device_name}/+/+/+/#`,
            `rpc/${this.product_name}/${this.device_name}/+/+/+/#`,
            `m2m/${this.product_name}/${this.device_name}/+/+`
        ],
        pubsub: []
    }
}

deviceSchema.methods.disconnect = function () {
    Connection.find({ device: this._id }).exec((err, connections) => {
        if (err) throw new Error(err);
        connections.forEach(conn => {
            EMQXService.disconnectClient(conn.client_id)
        })
    })
}

deviceSchema.post("remove", (device, next) => {
    Connection.deleteMany({ device: device._id }).exec()
    DeviceACl.deleteMany({ broker_username: device.broker_username }).exec()
    next()
})

deviceSchema.methods.sendCommand = function ({ commandName, data, encoding = "plain", ttl = undefined, commandType = "cmd", qos = 1 }) {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await Device.sendCommand({
                productName: this.product_name,
                deviceName: this.device_name,
                commandName: commandName,
                data: data,
                encoding: encoding,
                ttl: ttl,
                commandType: commandType,
                qos: qos
            })
            resolve(result)
        } catch (err) {
            reject(err)
        }
    })
}

deviceSchema.statics.sendCommand = async function ({ productName, deviceName, commandName, data, encoding = "plain", ttl = undefined, commandType = "cmd", qos = 1 }) {
    const requestId = new ObjectId().toHexString()
    let topic = `${commandType}/${productName}/${deviceName}/${commandName}/${encoding}/${requestId}`
    if (ttl) topic = `${topic}/${Math.floor(Date.now() / 1000) + ttl}`
    const result = await EMQXService.publishTo({ topic: topic, payload: data, qos: qos })
    console.log(result.body)
    return requestId
}

deviceSchema.methods.sendTags = function () {
    return this.sendCommand({
        commandName: "$set_tags",
        data: JSON.stringify({tags: this.tags || [], tags_version: tags_version || 1}),
        qos: 0
    })
}

deviceSchema.statics.sendCommandByTag = async function({ productName, tag, commandName, data, encoding = "plain", ttl = undefined,qos = 1 }) {
    const requestId = new ObjectId().toHexString()
    let topic = `tags/${productName}/${tag}/cmd/${commandName}/${encoding}/${requestId}`
    if (ttl) topic = `${topic}/${Math.floor(Date.now() / 1000) + ttl}`
    const result = await EMQXService.publishTo({ topic: topic, payload: data, qos: qos })
    consolr.log(result)
}

deviceSchema.methods.updateShadowDesired = function (desired, version) {
    const ts = Math.floor(Date.now() / 1000)

    if (version > this.shadow.version) {
        this.shadow.state.desired = this.shadow.state.desired || {}
        this.shadow.metadata.desired = this.shadow.metadata.desired || {}
        for (var key in desired) {
            this.shadow.state.desired[key] = desired[key]
            this.shadow.metadata.desired[key] = {timestamp: ts}
        }
        this.shadow.version = version
        this.shadow.timestamp = ts
        this.save()
        this.sendUpdateShadow()
        return true
    } else {
        return false
    }
}

deviceSchema.methods.sendUpdateShadow = function() {
    return this.sendCommand({
        commandName: "$update_shadow",
        data: JSON.stringify(this.shadow),
        qos: 0
    })
}

deviceSchema.methods.updateShadow = function (shadowUpdated) {
    const ts = Math.floor(Date.now() / 1000)

    if (this.shadow.version == shadowUpdated.version) {
        if (shadowUpdated.state.desired == null) {
            this.shadow.state.desired = this.shadow.state.desired || {}
            this.shadow.state.reported = this.shadow.state.reported || {}
            this.shadow.metadata.reported = this.shadow.metadata.reported || {}
            for (let key in this.shadow.state.desired) {
                if (this.shadow.state.desired[key] != null) {
                    this.shadow.state.reported[key] = shadowUpdated.state.desired[key]
                    this.shadow.metadata.reported[key] = {timestamp: ts}
                } else {
                    delete(this.shadow.state.reported[key])
                    delete(this.shadow.metadata.reported[key])
                }
            }
            this.shadow.timestamp = ts
            this.shadow.version = this.shadow.version + 1
            delete(this.shadow.state.desired)
            delete(this.shadow.metadata.desired)

            this.save()
            this.sendCommand({
                commandName: "$shadow_reply",
                data: JSON.stringify({ status: "success", timestamp: ts, version: this.shadow.version }),
                qos: 0
            })
        }
    } else {
        this.sendUpdateShadow()
    }
}

deviceSchema.methods.reportShadow = function (shadowReported) {
    const ts = Math.floor(Date.now() / 1000)

    if (this.shadow.version == shadowReported.version) {
        this.shadow.state.reported = this.shadow.state.reported || {}
        this.shadow.metadata.reported = this.shadow.metadata.reported || {}
        for (var key in shadowReported.state.reported) {
            if (shadowReported.state.reported[key] != null) {
                this.shadow.state.reported[key] = shadowReported.state.reported[key]
                this.shadow.metadata.reported[key] = {timestamp: ts}
            } else {
                delete(this.shadow.state.reported[key])
                delete(this.shadow.metadata.reported[key])
            }
        }
        this.shadow.timestamp = ts
        this.shadow.version = this.shadow.version + 1

        this.save()
        this.sendCommand({
            commandName: "$shadow_reply",
            data: JSON.stringify({ status: "success", timestamp: ts, version: this.shadow.version }),
            qos: 0
        })
    } else {
        this.sendUpdateShadow()
    }
}

deviceSchema.statics.updateModules = function({ productName, deviceName, modules }) {
    // Device.findOne({ product_name: productName, device_name: deviceName }, (err, device) => {
    //     if (err) console.error(err)
    //     else {
    //         device.tags = tags
    //         device.tags_version += 1
    //         device.save()
    //     }
    // })
    Device.findOneAndUpdate({ product_name: productName, device_name: deviceName }, {
        modules: modules
    }, { useFindAndModify: false }).exec()
}

deviceSchema.statics.updateInformation = function({ productName, deviceName, information }) {
    Device.findOneAndUpdate({ product_name: productName, device_name: deviceName }, {
        information: information
    }, { useFindAndModify: false }).exec()
}

deviceSchema.statics.updateNetwork = function({ productName, deviceName, network }) {
    Device.findOneAndUpdate({ product_name: productName, device_name: deviceName }, {
        network: network
    }, { useFindAndModify: false }).exec()
}

deviceSchema.statics.updateEDC = function({ productName, deviceName, data }) {
    InfluxDBService.writeDeviceEDC({ productName, deviceName, temperature: data.temperature, humidity: data.humidity, illuminance: data.illuminance, ts: Date.now() })
    Device.findOneAndUpdate({ product_name: productName, device_name: deviceName }, {
        edc: data
    }, { useFindAndModify: false }).exec()
}

deviceSchema.statics.updateLocation = function({ productName, deviceName, location }) {
    Device.findOneAndUpdate({ product_name: productName, device_name: deviceName }, {
        location: location
    }, { useFindAndModify: false }).exec((err, doc) => {
        if (!err && doc) {
            const loca = new Location({
                address_summary: location.address_summary,
                address_detail: location.address_detail,
                address: location.address,
                point: location.point,
                ts: Date.now(),
                device: doc._id
            })
        
            loca.save()
        }
    })
}

deviceSchema.statics.updateOperation = function({ productName, deviceName, operation }) {
    Device.findOneAndUpdate({ product_name: productName, device_name: deviceName }, {
        operation: operation
    }, { useFindAndModify: false }).exec()

    InfluxDBService.writeOperationData({
        productName: productName,
        deviceName: deviceName,
        loadavg: operation.loadavg,
        totalmem: operation.totalmem,
        freemem: operation.freemem,
        uptime: operation.uptime,
        ts: Date.now()
    })
}

const Device = mongoose.model('Device', deviceSchema);

export default Device