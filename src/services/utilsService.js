import redisClient from "../utils/redis";

class UtilsService {
    static waitKey(key, ttl, callback) {
        const end = Date.now() + ttl * 1000
        function checkKey() {
            if (Date.now() < end) redisClient.get(key, function (err, val) {
                if (val != null) {
                    callback(val)
                } else {
                    setTimeout(checkKey, 10)
                }
            })
            else callback(null)
        }
        checkKey()
    }
    static redisGet(key) {
        return new Promise((resolve, reject) => {
            redisClient.get(key, function (err, val) {
                if (err) reject(err)
                else resolve(val)
            })
        })
    }
    static redisSet(key, value) {
        return new Promise((resolve, reject) => {
            redisClient.set(key, value, function (err, val) {
                if (err) reject(err)
                else resolve(val)
            })
        })
    }
}

export default UtilsService