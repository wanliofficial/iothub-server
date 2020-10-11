import redis from "redis";

const redisClient = redis.createClient();

redisClient.on("error", res => {
    console.log(res)
});

export default redisClient