const jwt = require ("jsonwebtoken")
const mqtt = require('mqtt');
const password = jwt.sign({
    username: "jwt_user",
    exp: Math.floor(Date.now() / 1000) + 10
}, "emqxsecret");

const client = mqtt.connect('mqtt://127.0.0.1:1883', {
    username: "jwt_user",
    password: password
});
client.on('connect', function (connack) {
    console.log(`return code: ${connack.returnCode}`)
    client.end()
})