const mqtt = require("mqtt");
const ObjectID = require('bson').ObjectID;
const jwt = require("jsonwebtoken");

// const client = mqtt.connect('mqtt://127.0.0.1:1883', {
//     username: "test",
//     password: "123456"
// })

// client.on('connect', function (connack) {
//     console.log(connack)
//     client.end()
// })

// const client2 = mqtt.connect("mqtt://127.0.0.1:1883", {
//     username: "jwt_user123",
//     password: jwt.sign({
//         username: "jwt_user123",
//         exp: Math.floor(Date.now() / 1000) + 10
//     }, "emqxsecret")
// });

// client2.on('connect', res => {
//     console.log(res);
//     client2.end();
// });

const client3 = mqtt.connect('mqtts://127.0.0.1:8883', {
    rejectUnauthorized: false,
    username: "abcd/cX6YY3LHj",
    password: "16gcgBcnat",
    clientId: "abcd-cX6YY3LHj",
    clean: false
});

client3.on('connect', res => {
    console.log(res);
    // const topic = `upload_data/xiaomi/kPV_AiG9/sample/${new ObjectID().toHexString()}`;
    // client3.publish(topic, "this is a sample data", { qos: 1 });
});

// setTimeout(client3.end, 10000)