import { createClient } from "redis"
import { config } from "dotenv"

config({ path: "./config/.env" })

export const redisclient = createClient({
  url: process.env.REDIS_URL,
  database: 1,
})

redisclient
  .on("error", (err) => console.log("Redis Client Error", err))
  .on("connect", () => console.log("Redis Client connected"))
  .connect()
