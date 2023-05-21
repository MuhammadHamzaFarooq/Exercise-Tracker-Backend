import jwt from "jsonwebtoken";
import User from "../../../models/auth/user/User.js";
import httpStatus from "http-status-codes";

const checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      // Get Token from header
      try {
        token = authorization.split(" ")[1];
        if (!token) {
          res.status(httpStatus.UNAUTHORIZED).send({
            status: "failed",
            message: "Unauthorized User, No Token",
            success: false,
          });
        } else {
          // Verify Token
          const { email } = jwt.verify(token, process.env.JWT_SECRET);

          // Get User from Token
          let user = await User.findOne({ email });
          if (user) {
            next();
          } else {
            res.status(401).send({
              status: "failed",
              message: "Unauthorized User",
              success: false,
            });
          }
        }
      } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
          status: "failed",
          message: error.message,
          success: false,
        });
        throw new Error(error.message);
      }
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        status: "failed",
        message: error.message,
        success: false,
      });
      throw new Error(error.message);
    }
  }
  if (!token) {
    res.status(httpStatus.UNAUTHORIZED).send({
      status: "failed",
      message: "Unauthorized User, No Token",
      success: false,
    });
  }
};

export default checkUserAuth;
