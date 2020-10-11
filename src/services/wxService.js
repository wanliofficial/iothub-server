import request from 'request'
import config from 'dotenv'

config.config()

class WeChatService {
    static getOpenid (code) {
        return new Promise((resolve, reject) => {
            request.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.IOT_APP_ID}&secret=${process.env.IOT_APP_SECRET}&js_code=${code}&grant_type=authorization_code`, (error, response, body) => {
                if (error) reject(error);
                else resolve(JSON.parse(body));
                console.log('statusCode:', response && response.statusCode);
            });
        });
    }
}

export default WeChatService