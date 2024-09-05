const coap = require("coap")
const ObjectId = require('bson').ObjectID;
const EventEmitter = require('events');

class IotCoAPDevice extends EventEmitter {
    constructor({serverAddress = "127.0.0.1", serverPort = 5683, productName, deviceName, secret, clientID} = {}) {
        super();
        this.serverAddress = serverAddress
        this.serverPort = serverPort
        this.productName = productName
        this.deviceName = deviceName
        this.secret = secret
        this.token = null;
        this.timer = null;
        this.username = `${this.productName}_${this.deviceName}`
        if (clientID != null) {
            this.clientIdentifier = `${this.productName}-${this.deviceName}-${clientID}`
        } else {
            this.clientIdentifier = `${this.productName}-${this.deviceName}`
        }
    }

    connect() {
        const self = this;
        let req = coap.request({
            hostname: this.serverAddress,
            port: this.serverPort,
            method: "POST",
            pathname: `mqtt/connection`,
            query: `clientid=${this.clientIdentifier}&username=${this.username}&password=${this.secret}`
        })
        req.end()
        req.on("response", (response) => {
            if (response.code === "2.01") {
                self.token = response.payload
                self.emit("online")
                self.timer = setInterval(() => {
                    self.heartbeat()
                }, 10 * 1000)
            } else {
                self.emit("connect_error", response.code, response.payload)
            }
        })
    }

    heartbeat() {
        var req = coap.request({
            hostname: this.serverAddress,
            port: this.serverPort,
            method: "put",
            pathname: "mqtt/connection",
            query: `clientid=${this.clientIdentifier}&token=${this.token}`
        })
        req.end()
        req.on("response", (response) => {
            console.log(`heartbeat code ${response.code}, ${response.payload}`)
        })
    }

    disconnect(){
        const  self = this
        var req = coap.request({
            hostname: this.serverAddress,
            port: this.serverPort,
            method: "delete",
            pathname: "mqtt/connection",
            query: `clientid=${this.clientIdentifier}&token=${this.token}`
        })
        req.end()
        req.on("response", (response) => {
            console.log(`disconnect code ${response.code}, ${response.payload}`)
            clearTimeout(self.timer)
        })
    }

    publish(topic, payload) {
        var req = coap.request({
            hostname: this.serverAddress,
            port: this.serverPort,
            method: "POST",
            pathname: `ps/${topic}`,
            query: `clientid=${this.clientIdentifier}&token=${this.token}&qos=1`
        })

        req.end(Buffer.from(payload))
        req.on("response", (response) => {
            console.log(`publish code ${response.code}, ${response.payload}`)
        })
    }

    uploadData(data, type) {
        var topic = `upload_data/${this.productName}/${this.deviceName}/${type}/${new ObjectId().toHexString()}`
        this.publish(topic, data)
    }
}

module.exports = IotCoAPDevice