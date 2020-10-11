
var jwt = require('jsonwebtoken')
var mqtt = require('mqtt')

var client = mqtt.connect('mqtt://127.0.0.1:1883', {
    username: "jwt_user125",
    password: jwt.sign({
        username: "jwt_user125",
        exp: Math.floor(Date.now() / 1000) + 10
    }, "emqxsecret")
})

client.on('connect', function (connack) {
    console.log(connack)
    client.subscribe("/topic1")
})

client.on("message", function (_, message) {
    console.log(message.toString())
})