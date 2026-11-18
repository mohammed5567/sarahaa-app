import chalk from "chalk"

import { DBcounnection } from "./DB/counncation.js"

import express from "express"

import { userrouter } from "./modules/user/user.controllar.js"
import { messagerouter } from "./modules/message/message.controllar.js"
import cors from "cors"
import { config } from "dotenv"
import { redisclient } from "./DB/redis.counncaiton.js"

export const bootstrap = async () => {
  const app = express()
  config({
    path: "./config/.env",
  })
  app.use("/uploads", express.static("./uploads"))
  app.use(express.json())
  app.use(cors())
  await DBcounnection()
  await redisclient.set("test", "ahmed")
  // const test = redisclient.set
  app.use("/user", userrouter)
  app.use("/message", messagerouter)

  app.use((err, req, res, next) => {
    return res.status(err.cause || 500).json({
      success: false,
      message: err.message,
      statusCode: err.cause || 500,
      erroroptions: err.options,
    })
  })

  app.listen(process.env.PORT, () => {
    console.log(chalk.green("Server is running on port 3000"))
  })
}
