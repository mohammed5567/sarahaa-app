import mongoose, { Schema } from "mongoose"

const messageSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 500,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export const messageModel = mongoose.model("Message", messageSchema)
