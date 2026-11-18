import { compare, hash } from "bcrypt"

export const createHash = async (password) => {
  const generatrehash = await hash(password, 10)
  return generatrehash
}

export const compareHash = async (password, hashpassword) => {
  const isMatch = await compare(password, hashpassword)
  return isMatch
}
