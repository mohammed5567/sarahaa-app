import z from "zod"

export const sendMessageSchema = {
  params: z.strictObject({
    receiverId: z.string().regex(/^[0-9a-fA-F]{24}$/, "invalid id"),
  }),
  body: z.strictObject({
    content: z.string().min(2).max(500),
  }),
}
