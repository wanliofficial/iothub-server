const config = require("../config/project.config");
const mqtt = require("mqtt");
const jwt = require("jsonwebtoken");

// const client = mqtt.connect("mqtt://127.0.0.1:1883", {
//     username: "jwt_user",
//     password: jwt.sign({
//         username: "jwt_user",
//         exp: Math.floor(Date.now() / 1000) + 10
//     }, config.jsonWebTokenSecret)
// });

// client.on('connect', res => {
//     console.log(res);
//     // client.end();
//     client.subscribe('$SYS/brokers/+/clients/+/connected');
//     client.subscribe('$SYS/brokers/+/clients/+/disconnected');
// });

// client.on('message', (err, res) => {
//     console.log('***********Start**********')
//     if (err) console.error(err)
//     let msg = JSON.parse(res.toString())
//     if (msg.username != "undefined") console.log(msg)
//     console.log('***********End**********')
// });

const cli = mqtt.connect("mqtts://127.0.0.1:8883", {
    rejectUnauthorized: false,
    username: "abc/9L8b5l4QS",
    password: "KkEq5EkQ3f",
    clientId: "abc-9L8b5l4QS",
    clean: false
});

cli.on('connect', res => {
    console.log(res);
    cli.subscribe('$SYS/brokers/+/clients/+/connected');
    cli.subscribe('$SYS/brokers/+/clients/+/disconnected');
});

cli.on("message", (err, res) => {
    if (err) console.error(err)
    let msg = JSON.parse(res.toString())
    if (msg.username != "undefined") console.log(msg)
});