import { messageModel } from "../../DB/models/message.model.js"
import { userModel } from "../../DB/models/user.model.js"
import { errorRes } from "../../utils/error.res.js"

// anyone can send (sarahah = anonymous) so no auth here
export const sendMessageService = async ({ receiverId, content }) => {
  const receiver = await userModel.findById(receiverId)
  if (!receiver) {
    errorRes("Receiver not found", 404)
  }

  const message = await messageModel.create({ content, receiverId })
  return { data: message }
}

// logged in user gets the messages sent to him
export const getMyMessagesService = async ({ userId }) => {
  const messages = await messageModel
    .find({ receiverId: userId })
    .sort({ createdAt: -1 })
  return { data: messages }
}
