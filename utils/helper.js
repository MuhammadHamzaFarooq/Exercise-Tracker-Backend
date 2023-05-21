import { HTTP_STATUS } from "./constant.js";

export const constructResponse = (res, responseData) => {
  const { success, message, status, data } = responseData;
  if (success)
    return res.status(status).json({
      data,
      message,
      success: true,
    });
  if (data)
    return res.status(status).json({
      data,
      message,
      success: false,
    });
  return res.status(status).json({
    message,
    success: false,
  });
};

export const successResponse = (data, status, message) => ({
  data,
  status: status || HTTP_STATUS.OK,
  message,
  success: true,
});

export const errorResponse = (status, message, data = null) => ({
  data,
  status: status || HTTP_STATUS.INTERNAL_SERVER_ERROR,
  message: message || "Internal server error",
  success: false,
});

