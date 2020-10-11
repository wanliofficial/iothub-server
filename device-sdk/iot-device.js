"use strict";
const mqtt = require('mqtt');
const ObjectID = require('bson').ObjectID;
const EventEmitter = require('events');
const levelStore = require('mqtt-level-store');

class IotDevice extends EventEmitter {
    constructor({ serverAddress = "127.0.0.1:8883", productName, deviceName, secret, clientID, storePath } = {}) {
        super();
        this.serverAddress = `mqtts://${serverAddress}`
        this.productName = productName
        this.deviceName = deviceName
        this.secret = secret
        this.username = `${this.productName}/${this.deviceName}`

        if (clientID) this.clientIdentifier = `${clientID}`
        else this.clientIdentifier = `${this.productName}-${this.deviceName}`

        if (storePath) this.manager = levelStore(storePath)
    }

    connect() {
        const opts = {
            rejectUnauthorized: false,
            username: this.username,
            password: this.secret,
            clientId: this.clientIdentifier,
            clean: false
        }

        if (this.manager) {
            opts.incomingStore = this.manager.incoming
            opts.outgoingStore = this.manager.outgoing
        }

        this.client = mqtt.connect(this.serverAddress, opts);
        this.client.on("connect", () => {
            this.emit("online");
        });
        this.client.on("offline", () => {
            this.emit("offline");
        });
        this.client.on("error", err => {
            this.emit("error", err);
        });
    }

    disconnect() {
        if (this.client) this.client.end()
    }

    uploadData (data, type = "default") {
        if (this.client) {
            const topic = `upload_data/${this.productName}/${this.deviceName}/${type}/${new ObjectID().toHexString()}`;
            this.client.publish(topic, data, { qos: 1 });
        }
    }
}

module.exports = { IotDevice }