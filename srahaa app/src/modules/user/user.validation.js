import z from "zod"
import { GenderEnum } from "./user.types.js"

export const signupschema = {
  body: z.strictObject({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.email(),
    phone: z.string().max(11),
    password: z.string().min(8),
    age: z.number().int().optional(),
    gender: z.enum(GenderEnum),
    username: z.string(),
    bio: z.string().optional(),
  }),
  query: z.strictObject({
    id: z.string(),
  }),
}

export const confirmEmailSchema = {
  body: z.strictObject({
    email: z.email(),
    otp: z.coerce.string().regex(/^\d{6}$/),
  }),
}
