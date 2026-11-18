import { errorRes } from "../utils/error.res.js"

export const validate = (schema) => {
  return async (req, res, next) => {
    const validationErrors = []
    Object.keys(schema).map((ele) => {
      const value = schema[ele].safeParse(req[ele])
      console.log(req[ele])
      if (!value.success) {
        validationErrors.push({
          [ele]: value.error.issues,
        })
      }
    })
    if (validationErrors.length) {
      console.log(validationErrors)
      errorRes("Invalid input data", 400, validationErrors)
    }
    next()
  }
}
