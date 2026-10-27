import { Router } from "express"
import {
  confirmEmail,
  forgetpasssendotp,
  googlelogin,
  loginservice,
  refreshTokenService,
  resetpassword,
  signupservice,
} from "./user.servies.js"
import { successRes } from "../../utils/success.js"
import { auth, authorizetone } from "../../middlewares/auth.middleware.js"
import { RoleEnum } from "./user.types.js"
import { validate } from "../../middlewares/validation.middleware.js"
import { confirmEmailSchema, signupschema } from "./user.validation.js"
import multer, { MulterError } from "multer"
import { uploadFile } from "../../utils/multer.js"
export const routes = {
  base: "/user",
  signup: "/signup", //post
  login: "/login", //post
  me: "/me", //get
  refreshToken: "/refreshToken", //get
  googleSignup: "/signup/google", //post
  confirmEmail: "/confirmEmail", //patch
  forgotPassword: "/forgotPassword", //patch
  resetpassword: "/resetpassword", //patch
  uploadfiles: "/uploadfiles", //post
}

export const userrouter = Router()

userrouter.post(routes.signup, async (req, res) => {
  const { data } = await signupservice(req.body)
  return successRes({
    res,
    statusCode: 201,
    data,
  })
})

userrouter.post(routes.login, async (req, res) => {
  const { identifier, password } = req.body
  const { data } = await loginservice({ identifier, password })
  return successRes({ res, statusCode: 200, data })
})

userrouter.get(
  routes.me,
  auth,
  authorizetone(RoleEnum.USER),
  async (req, res) => {
    successRes({ res, data: req.user })
  },
)
userrouter.get(routes.refreshToken, async (req, res) => {
  const { authorization } = req.headers
  const { data } = await refreshTokenService({ authorization })

  return successRes({
    res,
    statusCode: 200,
    data,
  })
})

userrouter.post(routes.googleSignup, async (req, res) => {
  const { data } = await googlelogin({ token: req.body.idToken })
  successRes({ res, data })
  console.log(data)
})

userrouter.patch(
  routes.confirmEmail,
  validate(confirmEmailSchema),
  async (req, res) => {
    const { email, otp } = req.body
    const { data } = await confirmEmail({ email, otp })
    successRes({ res, data })
  },
)

userrouter.patch(routes.forgotPassword, async (req, res) => {
  const { email } = req.body
  await forgetpasssendotp(email)
  return successRes({ res })
})

userrouter.patch(routes.resetpassword, async (req, res) => {
  const { email, otp, password } = req.body
  await resetpassword(email, otp, password)

  successRes({ res })
})
userrouter.post(
  routes.uploadfiles,
  auth,
  uploadFile("general").single("image"),
  async (req, res) => {
    console.log({
      body: req.body,
      file: req.file,
    })
    req.user.profileImage = req.file.path
    await req.user.save()
    return successRes({ res })
  },
)

export default userrouter
