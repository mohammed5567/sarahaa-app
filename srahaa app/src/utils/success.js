export const successRes = ({
  res,
  statusCode = 200,
  message = "done",
  data = {},
}) => {
  return res.status(statusCode).json({
    statusCode,
    message,
    data,
  });
};
