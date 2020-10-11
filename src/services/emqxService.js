import request from 'request'
import shortid from 'shortid'
import config from 'dotenv'

config.config()

class EMQXService {
    static disconnectClient(clientId) {
        const apiUrl = `${process.env.EMQX_API_URL}/clients/${clientId}`
        request.delete(apiUrl, {
            "auth": {
                "user": process.env.EMQX_APP_ID,
                "pass": process.env.EMQX_APP_SECRET,
                "sendImmediately": true
            }
        }, (error, response, body) => {
            console.log('error', error);
            console.log('statusCode:', response && response.statusCode);
            console.log('body:', body);
        })
    }
    static publishTo({ topic, payload, qos = 1, retained = false }) {
        const apiUrl = `${process.env.EMQX_API_URL}/mqtt/publish`
        return new Promise((resolve, reject) => {
            request.post(apiUrl, {
                "auth": {
                    "user": process.env.EMQX_APP_ID,
                    "pass": process.env.EMQX_APP_SECRET,
                    "sendImmediately": true
                },
                "json": {
                    "topic": topic,
                    "payload": payload,
                    "qos": qos,
                    "retain": retained,
                    "clientid": shortid.generate()
                }
            }, (error, response, body) => {
                if (error) reject(error)
                else resolve({ response, body })
            })
        })
    }
}

export default EMQXService