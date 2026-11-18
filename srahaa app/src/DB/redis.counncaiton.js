import { createClient } from "redis"

export const redisclient = createClient({
  url: "redis://127.0.0.1:6380",
  database: 1,
})

redisclient
  .on("error", (err) => console.log("Redis Client Error", err))
  .on("connect", () => console.log("Redis Client connected"))
  .connect()
