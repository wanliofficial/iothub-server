const path = require("path")
const { IotDevice } = require("./iot-device");

const device = new IotDevice({
    productName: "abc",
    deviceName: "eV6aiYlMg",
    secret: "wyaB5GSMdg",
    clientID: path.basename(__filename, ".js"),
    storePath: `./tmp/${path.basename(__filename, ".js")}`
});

device.on('online', () => {
    device.uploadData("this is a sample data", "sample");
    console.log('device is online!');
});

device.on('offline', () => {
    console.log('device is offline!');
});

device.on('error', err => {
    console.log(err)
});

device.connect();
// device.disconnect();