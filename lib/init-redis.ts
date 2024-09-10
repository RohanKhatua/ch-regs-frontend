import { createClient } from "redis";

const redisClient = await createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    },
})
    .on("error", (err) => console.error("ERR:REDIS:", err))
    .connect();

export default redisClient;