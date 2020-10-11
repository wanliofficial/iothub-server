const jwt = require("jsonwebtoken")
const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://127.0.0.1:1883', {
    username: "qihoo-R7Thj57l",
    password: "q2NjY2EdR"
})

client.on('connect', function (connack) {
    console.log(connack)
    client.publish("/topic1", "test", console.log)
})

// const client2 = mqtt.connect("mqtt://127.0.0.1:1883", {
//     username: "jwt_user123",
//     password: jwt.sign({
//         username: "jwt_user123",
//         exp: Math.floor(Date.now() / 1000) + 100 * 60
//     }, "emqxsecret")
// });

// client2.on('connect', function (connack) {
//     console.log(connack)
//     client2.publish("/topic1", "test", console.log)
// })