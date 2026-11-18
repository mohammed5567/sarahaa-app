import { Router } from "express"
import { successRes } from "../../utils/success.js"
import { auth } from "../../middlewares/auth.middleware.js"
import { validate } from "../../middlewares/validation.middleware.js"
import { sendMessageSchema } from "./message.validation.js"
import {
  getMyMessagesService,
  sendMessageService,
} from "./message.servies.js"

export const routes = {
  base: "/message",
  sendMessage: "/:receiverId", //post
  myMessages: "/", //get
}

export const messagerouter = Router()

messagerouter.post(
  routes.sendMessage,
  validate(sendMessageSchema),
  async (req, res) => {
    const { receiverId } = req.params
    const { content } = req.body
    const { data } = await sendMessageService({ receiverId, content })
    return successRes({ res, statusCode: 201, message: "message sent", data })
  },
)

messagerouter.get(routes.myMessages, auth, async (req, res) => {
  const { data } = await getMyMessagesService({ userId: req.user._id })
  return successRes({ res, data })
})

export default messagerouter
