const { IotDevice } = require("./iot-device");

const device = new IotDevice({ productName: "abc", deviceName: "eV6aiYlMg", secret: "wyaB5GSMdg" });

device.on('online', () => {
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

device.uploadData("this is a sample data", "sample");