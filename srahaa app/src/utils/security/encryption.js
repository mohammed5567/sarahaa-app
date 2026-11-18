import crypto from "crypto"
import { errorRes } from "../error.res.js"

// read lazily: dotenv is loaded inside bootstrap(), after this module is imported
const getSecretKey = () => Buffer.from(process.env.CRYPTO_SECRET)

export const encryption = (data) => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv("aes-256-cbc", getSecretKey(), iv)
  let cifhertext = cipher.update(data, "utf-8", "hex")
  cifhertext += cipher.final("hex")
  return `${iv.toString("hex")}:${cifhertext}`
}

export const decryption = (encryptevalue) => {
  const [iv, cipherText] = encryptevalue.split(":")
  if (!iv || !cipherText) {
    errorRes("Invalid encrypted data format", 400)
  }
  const binaryIv = Buffer.from(iv, "hex")
  const decipher = crypto.createDecipheriv("aes-256-cbc", getSecretKey(), binaryIv)
  let plainText = decipher.update(cipherText, "hex", "utf-8")
  plainText += decipher.final("utf-8")
  return plainText
}
