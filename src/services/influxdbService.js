import * as Influx from 'influx'

const influx = new Influx.InfluxDB({
    host: process.env.INFLUXDB,
    database: 'iothub',
    schema: [{
        measurement: 'device_connections',
        fields: {
            connected: Influx.FieldType.BOOLEAN
        },
        tags: ['product_name', 'device_name']
    }, {
        measurement: 'connection_count',
        fields: {
            count: Influx.FieldType.INTEGER
        },
        tags: ['node_name']
    }, {
        measurement: 'device_operations',
        fields: {
            load1: Influx.FieldType.FLOAT,
            load5: Influx.FieldType.FLOAT,
            load15: Influx.FieldType.FLOAT,
            totalmem: Influx.FieldType.INTEGER,
            freemem: Influx.FieldType.INTEGER,
            uptime: Influx.FieldType.INTEGER
        },
        tags: ['product_name', 'device_name']
    }, {
        measurement: 'device_edc',
        fields: {
            temperature: Influx.FieldType.FLOAT,
            humidity: Influx.FieldType.FLOAT,
            illuminance: Influx.FieldType.FLOAT
        },
        tags: ['product_name', 'device_name']
    }]
})

class InfluxDBService {
    writeConnectionData ({ productName, deviceName, connected, ts }) {
        influx.writePoints([
            {
                measurement: 'device_connections',
                tags: { product_name: productName, device_name: deviceName },
                fields: { connected: connected },
                timestamp: ts
            }
        ], { precision: 's' }).then(rows => {
            console.log(rows)
        }).catch(err => {
            console.error(`Error saving data to InfluxDB! ${err.stack}`)
        })
    }
    writeConnectionCount (nodeName, count) {
        influx.writePoints([
            {
                measurement: 'connection_count',
                tags: { node_name: nodeName },
                fields: { count: count },
                timestamp: Math.floor(Date.now() / 1000)
            }
        ], { precision: 's' }).then(rows => {
            console.log(rows)
        }).catch(err => {
            console.error(`Error saving data to InfluxDB! ${err.stack}`)
        })
    }
    writeOperationData ({ productName, deviceName, loadavg, totalmem, freemem, uptime, ts }) {
        influx.writePoints([
            {
                measurement: 'device_operations',
                tags: { product_name: productName, device_name: deviceName },
                fields: { load1: loadavg[0], load5: loadavg[1], load15: loadavg[2], totalmem, freemem, uptime },
                timestamp: Math.floor(ts / 1000)
            }
        ], { precision: 's' }).then(rows => {
            console.log(rows)
        }).catch(err => {
            console.error(`Error saving data to InfluxDB! ${err.stack}`)
        })
    }
    writeDeviceEDC ({ productName, deviceName, temperature, humidity, illuminance, ts }) {
        influx.writePoints([
            {
                measurement: 'device_edc',
                tags: { product_name: productName, device_name: deviceName },
                fields: { temperature, humidity, illuminance },
                timestamp: Math.floor(ts / 1000)
            }
        ], { precision: 's' }).then(rows => {
            console.log(rows)
        }).catch(err => {
            console.error(`Error saving data to InfluxDB! ${err.stack}`)
        })
    }
    readOperationData ({ productName, deviceName, desc, limit, offset }) {
        return influx.query(`
            select time, freemem, totalmem, uptime, load1, load5, load15 from device_operations 
            where product_name = '${productName}' and device_name = '${deviceName}' 
            order by time ${ desc ? 'desc': '' } 
            limit ${ limit ? limit: 100 } ${ offset ? 'offset ' + offset : '' };
        `)
    }
    readDeviceEDCData ({ productName, deviceName, desc, limit, offset }) {
        return influx.query(`
            select time, temperature, humidity, illuminance from device_edc 
            where product_name = '${productName}' and device_name = '${deviceName}' 
            order by time ${ desc ? 'desc': '' } 
            limit ${ limit ? limit: 100 } ${ offset ? 'offset ' + offset : '' };
        `)
    }
    getOperationCount ({ productName, deviceName }) {
        return influx.query(`SELECT COUNT(uptime) FROM device_operations where product_name = '${productName}' AND device_name = '${deviceName}';`)
    }
    getEDCDataCount ({ productName, deviceName }) {
        return influx.query(`SELECT COUNT(humidity) FROM device_edc where product_name = '${productName}' AND device_name = '${deviceName}';`)
    }
}

export default new InfluxDBService()