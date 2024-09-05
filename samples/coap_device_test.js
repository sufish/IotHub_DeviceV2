var CoAPDevice = require("../sdk/iot_coap_device")
var path = require('path');
require('dotenv').config()

var device = new CoAPDevice({
    productName: process.env.PRODUCT_NAME,
    deviceName: process.env.DEVICE_NAME,
    secret: process.env.SECRET,
    clientID: path.basename(__filename, ".js"),
})

device.on("online", () => {
    console.log("device is online")
    device.uploadData("this is a test", "test")
})

device.on("connect_error", (code, error) => {
    console.log(`connect error, ${code}:${error}`)
})

device.connect()

setTimeout(()=>{
    device.disconnect()
}, 15 * 1000)