export const errorRes = (msg = " error", statusCode = 500, options) => {
  const error = new Error(msg, { cause: statusCode })
  error.options = options
  throw error
}
