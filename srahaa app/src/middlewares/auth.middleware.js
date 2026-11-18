import jwt from "jsonwebtoken"

import { userModel } from "../DB/models/user.model.js"

import { errorRes } from "../utils/error.res.js"
import { redisclient } from "../DB/redis.counncaiton.js"

export const tokenEnum = {
  ACCESS: "accessToken",
  REFRESH: "refreshToken",
}

export const auth = async (req, res, next) => {
  const { user, payload } = await decodeToken({
    authorization: req.headers.authorization,
  })

  req.user = user
  req.payload = payload // fe el jti (we need it in logout)

  next()
}

export const decodeToken = async ({
  authorization,
  tokentype = tokenEnum.ACCESS,
}) => {
  // console.log({ authorization })

  if (!authorization || !authorization.startsWith("Bearer ")) {
    errorRes("Unauthorized", 401)
  }

  const token = authorization.split(" ")[1]

  // console.log({ token })

  const payload = jwt.verify(
    token,
    tokentype === tokenEnum.ACCESS
      ? process.env.TOKEN_SECRET
      : process.env.REFRESH_TOKEN_SECRET,
  )

  // console.log({ payload })

  // jti check: if token has no id or its id in blacklist => user logged out
  if (!payload.jti) {
    errorRes("Invalid token, please login again", 401)
  }
  const isBlacklisted = await redisclient.get(`blacklist:${payload.jti}`)
  if (isBlacklisted) {
    errorRes("Token revoked, please login again", 401)
  }

  const user = await userModel.findById(payload.__id)

  if (!user) {
    errorRes("User not found", 404)
  }

  return { user, payload }
}

export const authorizetone = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      errorRes("Unauthorized", 404)
    }
    next()
  }
}
