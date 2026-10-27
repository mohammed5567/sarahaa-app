import { userModel } from "../../DB/models/user.model.js"
import { decodeToken, tokenEnum } from "../../middlewares/auth.middleware.js"
import { errorRes } from "../../utils/error.res.js"
import jwt from "jsonwebtoken"
import { createHash, compareHash } from "../../utils/security/hash.js"
import { OAuth2Client } from "google-auth-library"
import { ProviderEnum } from "./user.types.js"
import { random } from "../../utils/email/createOtp.js"
import { emailTemplate } from "../../utils/email/emailTemplate.js"
import { sendEmail } from "../../utils/email/sendemail.js"
const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
})
export const signupservice = async ({
  firstName,
  lastName,
  email,
  password,
  phone,
  bio,
  age,
  username,
}) => {
  const isExisting = await userModel.findOne({
    $or: [{ email }, { username }],
  })

  if (isExisting) {
    errorRes(
      isExisting.email === email
        ? "Email already exists"
        : "Username already exists",
    )
  }

  const otp = random()
  await sendEmail({
    to: email,
    subject: "Email verification",
    html: emailTemplate({ otp, subject: "Email verification" }),
  })

  const user = await userModel.create({
    firstName,
    lastName,
    email,
    password: await createHash(password),
    phone,
    bio,
    age,
    username,
    otp: { otp: await createHash(otp) },
  })

  return { data: user }
}

export const loginservice = async ({ identifier, password }) => {
  const user = await userModel.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  })
  if (!user) {
    errorRes("Invalid credentials", 400)
  }
  const ispasswordMatch = await compareHash(password, user.password)
  if (!ispasswordMatch) {
    errorRes("Invalid credentials", 400)
  }
  const accessToken = jwt.sign(
    {
      __id: user._id,
      email: user.email,
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "10m",
    },
  )
  const refreshToken = jwt.sign(
    {
      __id: user._id,
      email: user.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  )

  return { data: { accessToken, refreshToken } }
}

export const refreshTokenService = async ({ authorization }) => {
  const { user } = await decodeToken({
    authorization,
    tokentype: tokenEnum.REFRESH,
  })

  const accessToken = jwt.sign(
    {
      __id: user._id,
      email: user.email,
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "1m",
    },
  )

  return { data: { accessToken } }
}

export const googlelogin = async ({ token }) => {
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
  const { email, name, picture } = ticket.getPayload()
  let user = await userModel.findOne({ email })

  if (user) {
    if (user.provider !== ProviderEnum.GOOGLE) {
      errorRes("Please login with your original provider", 400)
    }
  } else {
    user = await userModel.create({
      email,
      firstName: name,
      profilePic: picture,
      provider: ProviderEnum.GOOGLE,
    })
  }

  const accessToken = jwt.sign(
    {
      __id: user._id,
      email: user.email,
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "10m",
    },
  )
  const refreshToken = jwt.sign(
    {
      __id: user._id,
      email: user.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  )
  return {
    data: { accessToken, refreshToken },
  }
}

export const confirmEmail = async ({ email, otp }) => {
  const user = await userModel.findOne({
    email,
    confirmedat: {
      $exists: false,
    },
  })
  if (!user) {
    errorRes("User not found or already confirmed", 404)
  }

  await checkOtp(user, otp)
  user.confirmedat = new Date()
  user.otp = undefined
  await user.save()
  return { data: {} }
}

export const forgetpasssendotp = async (email) => {
  const user = await userModel.findOne({ email })
  if (!user) {
    errorRes("user not found", 404)
  }
  if (user.otp?.expireIn > Date.now()) {
    errorRes("wait 5 mints", 400)
  }

  const otp = random(6)
  user.otp = {
    otp: await createHash(otp),
    expireIn: Date.now() + 5 * 60 * 1000,
  }
  await user.save()
  sendEmail({
    to: email,
    subject: "forget password",
    html: emailTemplate({
      otp,
      subject: "forget password",
    }),
  })
  return { data: {} }
}

export const resetpassword = async (email, otp, password) => {
  const user = await userModel.findOne({ email })
  if (!user) {
    errorRes("User not found or already confirmed", 404)
  }
  await checkOtp(user, otp)
  user.password = await createHash(password)
  user.otp = undefined
  await user.save()
  return {
    data: {},
  }
}

export const checkOtp = async (user, otp) => {
  if (!user.otp || user.otp.expireIn < Date.now()) {
    errorRes("Invalid or expired OTP", 400)
  }
  const isOtpMatch = await compareHash(String(otp), user.otp.otp)
  if (!isOtpMatch) {
    errorRes("Invalid OTP", 400)
  }
}
