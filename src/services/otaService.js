import Device from '../models/device'
import UtilsService from './utilsService'

class OTAService {
    static updateProgress(productName, deviceName, progress) {
        UtilsService.redisSet(`ota_progress/${productName}/${deviceName}`, JSON.stringify(progress)).then(res => {
            console.log(res)
        }).catch(err => {
            console.log(err)
        })
    }
    static sendOTA({ productName, deviceName = null, tag = null, fileUrl, version, size, md5, type }) {
        const data = JSON.stringify({
            url: fileUrl,
            version: version,
            size: size,
            md5: md5,
            type: type
        })
        if (deviceName) Device.sendCommand({
            productName: productName,
            deviceName: deviceName,
            commandName: "ota_upgrade",
            data: data
        })
        else if(tag) Device.sendCommandByTag({
            productName: productName,
            tag: tag,
            commandName: "ota_upgrade",
            data: data 
        })
    }
    static getProgress(productName, deviceName, callback) {
        UtilsService.redisGet(`ota_progress/${productName}/${deviceName}`, (err, value) => {
            if (err) callback(err, null)
            if (value) {
                callback(null, JSON.parse(value))
            } else {
                callback(null, {})
            }
        })
    }
}

export default OTAService