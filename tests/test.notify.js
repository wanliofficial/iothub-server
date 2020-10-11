require('dotenv').config();
const bson = require('bson');
const amqp = require('amqplib/callback_api');

amqp.connect("amqp://127.0.0.1:5672", function (error0, connection) {
    if (error0) {
        console.log(error0);
    } else {
        connection.createChannel(function (error1, channel) {
            if (error1) {
                console.log(error1)
            } else {
                var queue = "iothub.events.upload_data";
                channel.assertQueue(queue, { durable: true })
                channel.consume(queue, function (msg) {
                    var data = bson.deserialize(msg.content)
                    console.log(`received from ${data.device_name}, messageId: ${data.message_id}, payload: ${data.payload}`)
                    channel.ack(msg)
                });
            }
        });

        connection.createChannel(function (error1, channel) {
            if (error1) {
                console.log(error1)
            } else {
                var queue = "iothub.events.update_status";
                channel.assertQueue(queue, { durable: true })
                channel.consume(queue, function (msg) {
                    var data = bson.deserialize(msg.content)
                    console.log(`received from ${data.device_name}, status: ${JSON.stringify(data.device_status)}`)
                    channel.ack(msg)
                });
            }
        });

        connection.createChannel(function (error1, channel) {
            if (error1) {
                console.log(error1)
            } else {
                var queue = "iothub.events.cmd_resp";
                channel.assertQueue(queue, { durable: true })
                channel.consume(queue, function (msg) {
                    var data = bson.deserialize(msg.content)
                    console.log(`received from ${data.device_name}, requestId: ${data.requestId}, payload: ${data.payload}`)
                    channel.ack(msg)
                });
            }
        });

        connection.createChannel(function (error1, channel) {
            if (error1) {
                console.log(error1)
            } else {
                var queue = "iothub.events.data_request";
                channel.assertQueue(queue, { durable: true })
                channel.consume(queue, function (msg) {
                    var data = bson.deserialize(msg.content)
                    console.log(data)
                    if (data.resource == "weather") {
                        console.log(`received request for weather from ${data.device_name}, resource: ${data.resource}`)
                    }
                    channel.ack(msg)
                });
            }
        });
    }
});