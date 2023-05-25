import { HTTP_STATUS } from "../../../utils/constant.js";
import { errorResponse, successResponse } from "../../../utils/helper.js";
import User from "../../../models/auth/user/User.js";
import bcrypt, { compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import httpStatus from "http-status-codes";
import crypto from "crypto";
import { Transport } from "../../../lib/mailers/index.js";
import fs from "fs";
import request from "request";
import { cloudinaryOptions } from "../../../utils/staticObject.js";
import { helper } from "../../../utils/helperFunctions.js";
import Activity from "../../../models/auth/user/Activity.js";
import mongoose from "mongoose";

const register = async (data) => {
  try {
    const { name, email, password } = data;
    if (name !== undefined && email !== undefined && password !== undefined) {
      let user = await User.findOne({ email });
      if (user === null) {
        try {
          const salt = bcrypt.genSaltSync(10);
          const hashPassword = bcrypt.hashSync(password, salt);
          let userDetail = {
            name,
            email,
            password: hashPassword,
          };

          let save_user = await User.create(userDetail);
          let payload = {
            _id: save_user._id,
            name: save_user.name,
            email: save_user.email,
            password: save_user.password,
          };

          let result = {
            user: payload,
          };
          return successResponse(
            result,
            HTTP_STATUS.OK,
            "MESSAGE.USER_SIGNUP_SUCCESS"
          );
        } catch (error) {
          return errorResponse(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            "MESSAGE.USER_SIGNUP_FAILED",
            null
          );
        }
      } else {
        return errorResponse(
          httpStatus.OK,
          "MESSAGE.EMAIL_ALREADY_EXIST_TRY_UNIQUE_EMAIL_SIGNUP_FAILED",
          null
        );
      }
    } else {
      return errorResponse(
        httpStatus.OK,
        "MESSAGE_ALL_FIELDS_REQUIRED_SIGNUP_FAILED",
        null
      );
    }
  } catch (error) {
    return errorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error?.message,
      null
    );
  }
};

const login = async (data) => {
  try {
    const { email, password } = data;
    if (email !== undefined && password !== undefined) {
      let user = await User.findOne({ email });
      if (user !== null) {
        let hasPassword = user?.password;
        let isMatch = bcrypt.compareSync(password, hasPassword);

        let payload = {
          _id: user?._id,
          email: user?.email,
        };

        if (isMatch) {
          //Generate Token
          let token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1d",
          });

          let result = {
            token,
            user: user,
          };
          return successResponse(
            result,
            HTTP_STATUS.OK,
            "MESSAGE.LOGIN_SUCCESS"
          );
        } else {
          return errorResponse(
            httpStatus.OK,
            "MESSAGE.INVALID_PASSWORD_LOGIN_FAILED",
            null
          );
        }
      } else {
        return errorResponse(
          httpStatus.OK,
          "MESSAGE.UNAUTHORIZED_USER_LOGIN_FAILED",
          null
        );
      }
    } else {
      return errorResponse(
        HTTP_STATUS.OK,
        "MESSAGE.FIELDS_REQUIRED_LOGIN_FAILED",
        null
      );
    }
  } catch (error) {
    console.log(error);
    return errorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error?.message,
      null
    );
  }
};

const forgotPassword = async (data) => {
  try {
    const { email } = data;
    if (email) {
      try {
        let user = await User.findOne({ email: email });
        if (!user) {
          return errorResponse(
            httpStatus.BAD_REQUEST,
            "NO ACCOUNT WITH THAD EMAIL ADDRESS EXISTS",
            null
          );
        }
        const resetToken = crypto.randomBytes(20).toString("hex");

        // Save the reset token and expiration date to the user account
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        const save = () => {
          return new Promise((resolve, reject) => {
            user.save(async (err, result) => {
              if (err) reject(err);
              resolve(result);
            });
          });
        };
        let saveUser = await save();
        if (!saveUser) {
          return errorResponse(
            httpStatus.INTERNAL_SERVER_ERROR,
            "USER DETAILS CAN'T UPDATED. REQUEST FAILED",
            null
          );
        }
        const mailOptions = {
          from: process.env.SMTP_USERNAME,
          to: email,
          subject: "Password Reset Confirmation",
          recipients: [`Dear ${saveUser?.name}`],
          text: `Dear ${saveUser?.name},\n\nI hope this email finds you well. This is to inform you that your password has been successfully reset. We have taken this measure to ensure the security of your account and to prevent unauthorized access.\n\nPlease open the app and follow the steps to update your new password. If you experience any difficulties or have any questions, please don't hesitate to reach out to our support team for assistance.\n\nThank you for your understanding and cooperation.\n\nBest regards,\nExercise Tracker Team
          `,
        };
        const sendForgotEmail = () => {
          return new Promise((resolve, reject) => {
            Transport().sendMail(mailOptions, async (err, result) => {
              if (err) reject(err);
              resolve(result);
            });
          });
        };
        let sendForgotEmailFromUser = await sendForgotEmail();
        if (!sendForgotEmailFromUser) {
          return errorResponse(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            "Email Not Send. Request Failed",
            null
          );
        }
        let payload = {
          _id: saveUser?._id,
          name: saveUser?.name,
          email: saveUser?.email,
          password: saveUser?.password,
        };
        return successResponse(
          payload,
          HTTP_STATUS.OK,
          `An email has been sent to ${email} with further instructions`
        );
      } catch (error) {
        console.log("line 370 in forgot api =>", error);
        return errorResponse(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          error?.message,
          null
        );
      }
    } else {
      return errorResponse(httpStatus.OK, "EMAIL IS REQUIRED", null);
    }
  } catch (error) {
    console.log("error in line forgotPasswordAPI catch ", error);
    return errorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error?.message,
      null
    );
  }
};

const ResetPassword = async (data) => {
  try {
    const { password, email } = data;
    console.log(" password, email", password, password);
    if (password === null && email == null) {
      return errorResponse(
        httpStatus.BAD_REQUEST,
        "PASSWORD AND EMAIL NO IS REQUIRED. REQUEST FAILED",
        null
      );
    }
    let user = await User.findOne({ email: email }).exec();
    if (!user) {
      return errorResponse(
        httpStatus.OK,
        "USER DOES NOT EXISTS. REQUEST FAILED",
        null
      );
    }
    const digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    user.otp = OTP;
    const save = () => {
      return new Promise((resolve, reject) => {
        user.save(async (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });
    };
    let saveOpt = await save();
    if (!saveOpt) {
      return errorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "OTP NOT SAVE IN DB. REQUEST FAILED",
        null
      );
    }
    const mailOptions = {
      from: process.env.SMTP_USERNAME,
      to: email,
      subject: "One-Time Passcode (OTP)",
      recipients: [`Dear ${saveOpt?.name}`],
      text: `Dear ${saveOpt?.name},\n\nThis email contains your One-Time Passcode (OTP) for verifying your account with us. Please use the code provided below to complete the verification process:\n\nOTP: ${saveOpt?.otp}\n\nPlease be aware that this code is only valid for a limited time, so it is important to take action as soon as possible. Once you have entered the OTP, your account will be verified and you will be able to access all the features and services associated with it.\n\nThank you for your understanding and cooperation.\n\nIf you have any issues or questions, please don't hesitate to reach out to us for assistance. We are here to help.\n\nBest regards,\nVenue Wizard Team
      `,
    };
    const sendOTPEmail = () => {
      return new Promise((resolve, reject) => {
        Transport().sendMail(mailOptions, async (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });
    };
    let sendOTPEmailFromUser = await sendOTPEmail();
    return successResponse(
      null,
      HTTP_STATUS.OK,
      "OTP SEND SUCCESSFULLY. PLEASE VERIFY OTP"
    );
  } catch (error) {
    console.log(error);
    return errorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error?.message,
      null
    );
  }
};

const ResetPasswordVerify = async (data) => {
  try {
    const { password, email, otp } = data;
    console.log(" password, email", password, password, otp);
    if (password === null && email == null) {
      return errorResponse(
        httpStatus.BAD_REQUEST,
        "PASSWORD, EMAIL, AND OTP IS REQUIRED. REQUEST FAILED",
        null
      );
    }
    let user = await User.findOne({ email: email }).exec();
    if (!user) {
      return errorResponse(
        httpStatus.OK,
        "USER DOES NOT EXISTS. REQUEST FAILED",
        null
      );
    }
    const save = () => {
      return new Promise((resolve, reject) => {
        user.save(async (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });
    };
    if (user?.otp === otp) {
      const salt = bcrypt.genSaltSync(10);
      const hashPassword = bcrypt.hashSync(password, salt);
      user.password = hashPassword;
      let saveUser = await save();
      if (!saveUser) {
        return errorResponse(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          "USER DETAILS NOT SAVE IN DB. REQUEST FAILED",
          null
        );
      }
      const mailOptions = {
        from: process.env.SMTP_USERNAME,
        to: email,
        subject: "Password Update Confirmation",
        recipients: [`Dear ${saveUser?.name}`],
        text: `Dear ${saveUser?.name},\n\nThis is to confirm that your password has been successfully updated. We are happy to inform you that you can now log in to your account using your updated credentials.\n\nPlease be assured that your account is now secure and protected. If you have any questions or concerns, please do not hesitate to reach out to us. We are here to help.\n\nThank you for your understanding and cooperation.\n\nThank you for taking the time to update your password. We appreciate your cooperation in keeping your account secure.\n\nBest regards,\nExercise Tracker Team
        `,
      };
      const sendUpdatePasswordEmail = () => {
        return new Promise((resolve, reject) => {
          Transport().sendMail(mailOptions, async (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        });
      };
      let sendUpdatePasswordEmailFromUser = await sendUpdatePasswordEmail();
      let payload = {
        _id: saveUser?._id,
        name: saveUser?.name,
        email: saveUser?.email,
        password: saveUser?.password,
      };
      return successResponse(
        payload,
        HTTP_STATUS.OK,
        "PASSWORD UPDATED SUCCESSFULLY."
      );
    } else {
      return errorResponse(httpStatus.OK, "INVALID OTP. REQUEST FAILED", null);
    }
  } catch (error) {
    console.log(error);
    return errorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error?.message,
      null
    );
  }
};

const createActivity = async (req) => {
  try {
    const {
      name,
      description,
      date,
      duration,
      activityType,
      startTime,
      endTime,
    } = req.body;

    // Check if all required fields are present
    if (
      name &&
      description &&
      date &&
      duration &&
      activityType &&
      startTime &&
      endTime
    ) {
      // let endTime = calculateEndTime(startTime, duration); // Calculate the end time based on the duration
      // Find activities with the same date and overlapping duration
      let allActivities = await Activity.find({
        date,
        $or: [
          { startTime: { $lte: startTime }, endTime: { $gte: startTime } },
          { startTime: { $lte: endTime }, endTime: { $gte: endTime } },
          { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
        ],
      });

      console.log("allActivities", allActivities);

      // Check if any activities were found
      if (allActivities.length === 0) {
        let token;
        const { authorization } = req.headers;
        if (authorization && authorization.startsWith("Bearer")) {
          try {
            token = authorization.split(" ")[1];
            if (!token) {
              return errorResponse(
                httpStatus.UNAUTHORIZED,
                "UNAUTHORIZED.USER",
                null
              );
            } else {
              // Verify Token
              const { email } = jwt.verify(token, process.env.JWT_SECRET);
              // Get User from Token
              let user = await User.findOne({ email });
              if (user) {
                if (!mongoose.Types.ObjectId.isValid(user._id)) {
                  return errorResponse(
                    HTTP_STATUS.BAD_REQUEST,
                    "Invalid user ID",
                    null
                  );
                }
                let url = "";
                console.log("activityType => ", activityType);
                switch (activityType) {
                  case "Run":
                    url =
                      "https://res.cloudinary.com/ddpxcjmjn/image/upload/v1684683136/Exercise%20Tracker%20Dashboard/runing_man_generated_dfog6w.jpg";
                    break;
                  case "Swim":
                    url =
                      "https://res.cloudinary.com/ddpxcjmjn/image/upload/v1684683107/Exercise%20Tracker%20Dashboard/8si7_juh6_130430_fwsd9c.jpg";
                    break;
                  case "Hike":
                    url =
                      "https://res.cloudinary.com/ddpxcjmjn/image/upload/v1684683190/Exercise%20Tracker%20Dashboard/hiking-illustration-vector_bigs43.jpg";
                    break;
                  case "Bicycle Ride":
                    url =
                      "https://res.cloudinary.com/ddpxcjmjn/image/upload/v1684684638/Exercise%20Tracker%20Dashboard/1892_R0lVIERBTiA0NDItMDc_cosxob.jpg";
                    break;
                  case "Walk":
                    url =
                      "https://res.cloudinary.com/ddpxcjmjn/image/upload/v1684683179/Exercise%20Tracker%20Dashboard/walk_and_palying_phone_flat_vector_illustration1_generated_pp1jp2.jpg";
                    break;
                  default:
                    // Handle the default case or set a default URL if needed
                    break;
                }

                // Create a new activity
                let newActivity = await Activity.create({
                  name,
                  description,
                  date,
                  duration,
                  activityType,
                  startTime,
                  endTime,
                  user_id: user._id,
                  url,
                });

                if (!newActivity) {
                  console.log(error?.message);
                  return errorResponse(
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                    "ACTIVITY ALREADY EXISTS FOR THIS DURATION",
                    null
                  );
                }
                return successResponse(
                  newActivity,
                  HTTP_STATUS.OK,
                  "ACTIVITY.CREATE.SUCCESSFULLY"
                );
              } else {
                return errorResponse(
                  httpStatus.UNAUTHORIZED,
                  "UNAUTHORIZED.USER",
                  null
                );
              }
            }
          } catch (error) {
            // Error handling code
            console.error(error);
            return errorResponse(
              HTTP_STATUS.INTERNAL_SERVER_ERROR,
              "INTERNAL_SERVER_ERROR",
              null
            );
          }
        }
      } else {
        return errorResponse(
          HTTP_STATUS.OK,
          "ACTIVITY ALREADY EXISTS FOR THIS TIME",
          null
        );
      }
    } else {
      return errorResponse(HTTP_STATUS.OK, "ALL FIELDS REQUIRED", null);
    }
  } catch (error) {
    console.log(error);
    return errorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error?.message,
      null
    );
  }
};

// Helper function to calculate the end time based on the start time and duration
const calculateEndTime = (startTime, duration) => {
  // Convert startTime to a Date object
  const start = new Date(startTime);

  // Calculate the end time by adding the duration in milliseconds to the start time
  const end = new Date(start.getTime() + duration);

  // Return the end time as a string
  return end.toISOString();
};

const editActivity = async (activityId, newData) => {
  try {
    const {
      name,
      description,
      date,
      duration,
      activityType,
      startTime,
      endTime,
    } = newData;
    // let endTime = calculateEndTime(startTime, duration); // Calculate the end time based on the duration

    // Find the activity by its ID
    let activity = await Activity.findById(activityId);

    if (!activity) {
      return errorResponse(HTTP_STATUS.NOT_FOUND, "ACTIVITY.NOT_FOUND", null);
    }

    // Check if the edited activity conflicts with other activities
    let conflictingActivities = await Activity.find({
      date,
      _id: { $ne: activityId }, // Exclude the current activity from the search
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gte: startTime } },
        { startTime: { $lte: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
      ],
    });

    if (conflictingActivities.length > 0) {
      return errorResponse(
        HTTP_STATUS.OK,
        "ACTIVITY CONFLICTS WITH OTHER ACTIVITIES",
        null
      );
    }

    // Update the activity with the new data
    activity.name = name;
    activity.description = description;
    activity.date = date;
    activity.duration = duration;
    activity.activityType = activityType;
    activity.startTime = startTime;
    activity.endTime = endTime;

    // Save the updated activity
    await activity.save();

    return successResponse(
      activity,
      HTTP_STATUS.OK,
      "ACTIVITY.EDIT.SUCCESSFULLY"
    );
  } catch (error) {
    return errorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error?.message,
      null
    );
  }
};

const deleteActivity = async (activityId) => {
  try {
    // Find the activity by its ID
    let activity = await Activity.findById({ _id: activityId });

    if (!activity) {
      return errorResponse(HTTP_STATUS.NOT_FOUND, "ACTIVITY.NOT_FOUND", null);
    }

    // Delete the activity
    await activity.remove();

    return successResponse(
      activity,
      HTTP_STATUS.OK,
      "ACTIVITY.DELETE.SUCCESSFULLY"
    );
  } catch (error) {
    return errorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error?.message,
      null
    );
  }
};

const getAllActivities = async (req) => {
  try {
    let token;
    const { authorization } = req.headers;
    // Retrieve all activities from the database
    if (authorization && authorization.startsWith("Bearer")) {
      try {
        token = authorization.split(" ")[1];
        if (!token) {
          return errorResponse(
            httpStatus.UNAUTHORIZED,
            "UNAUTHORIZED.USER",
            null
          );
        } else {
          // Verify Token
          const { email } = jwt.verify(token, process.env.JWT_SECRET);
          // Get User from Token
          let user = await User.findOne({ email });
          if (user) {
            if (!mongoose.Types.ObjectId.isValid(user._id)) {
              return errorResponse(
                HTTP_STATUS.BAD_REQUEST,
                "Invalid user ID",
                null
              );
            }
            const activities = await Activity.find({
              user_id: user._id,
            })
              .populate("user_id")
              .exec();

            if (!activities) {
              return errorResponse(
                HTTP_STATUS.NOT_FOUND,
                "NO_ACTIVITIES_FOUND",
                null
              );
            }
            // Return the activities as a success response
            return successResponse(
              activities,
              HTTP_STATUS.OK,
              "ACTIVITY.GET_ALL_SUCCESSFULLY"
            );
          } else {
            return errorResponse(
              httpStatus.UNAUTHORIZED,
              "UNAUTHORIZED.USER",
              null
            );
          }
        }
      } catch (error) {
        // Error handling code
        console.error(error);
        return errorResponse(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          "INTERNAL_SERVER_ERROR",
          null
        );
      }
    }
  } catch (error) {
    // Error handling code
    console.error(error);
    return errorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "INTERNAL_SERVER_ERROR",
      null
    );
  }
};

const getAllActivityCount = async () => {
  try {
  } catch (error) {
    return errorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error?.message,
      null
    );
  }
};

const getUser = async (data) => {
  try {
    const { user_id } = data;
    if (user_id !== null && user_id !== undefined) {
      let user = await User.findById({ _id: user_id });
      if (user !== null) {
        return successResponse(
          user,
          HTTP_STATUS.OK,
          "Get User Details Successfully"
        );
      } else {
        return errorResponse(HTTP_STATUS.NOT_FOUND, "User Not Exist", null);
      }
    } else {
      return errorResponse(httpStatus.OK, T, "User id is required", null);
    }
  } catch (error) {
    return errorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
  }
};

const updateUser = async (data) => {
  try {
    const { name, email, password, user_id } = data;
    if (user_id !== null) {
      try {
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);
        let updateUser = await User.findOneAndUpdate(
          { _id: user_id },
          {
            name,
            email,
            password: hashPassword,
          }
        );
        if (
          updateUser.length === 0 ||
          updateUser === undefined ||
          updateUser === null ||
          updateUser === ""
        ) {
          return errorResponse(httpStatus.OK, "User Not Exist", null);
        } else {
          let save_user = await User.findOne({ email });
          let payload = {
            _id: save_user._id,
            name: save_user.name,
            email: save_user.email,
            password: save_user.password,
          };

          //Generate Token
          let token = jwt.sign(payload, process.env.SECERET_KEY, {
            expiresIn: "1d",
          });

          let result = {
            token,
            user: payload,
          };
          return successResponse(
            result,
            HTTP_STATUS.OK,
            "User Updated Successfully!!!"
          );
        }
      } catch (error) {
        console.log(error);
        return errorResponse(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          "Enable to Update.",
          null
        );
      }
    } else {
      return errorResponse(HTTP_STATUS.UNAUTHORIZED, "Unauthorized user", null);
    }
  } catch (error) {
    return errorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
  }
};

const deleteUser = async (data) => {
  try {
    const { user_id } = data;
    if (user_id === null || user_id === undefined) {
      return errorResponse(HTTP_STATUS.UNAUTHORIZED, "UnAuthorized User", null);
    } else {
      let deleteUser = await User.deleteOne({ _id: user_id });
      if (
        deleteUser["deletedCount"] === 0 ||
        deleteUser === null ||
        deleteUser === undefined
      ) {
        return errorResponse(
          HTTP_STATUS.NOT_FOUND,
          "User Does Not Exist",
          null
        );
      } else if (
        deleteUser["deletedCount"] === 1 ||
        deleteUser !== null ||
        deleteUser !== undefined
      ) {
        return successResponse(
          deleteUser,
          HTTP_STATUS.OK,
          "User Deleted Successfully"
        );
      }
    }
  } catch (error) {
    return errorResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
  }
};

export default {
  register,
  login,
  forgotPassword,
  ResetPassword,
  ResetPasswordVerify,
  createActivity,
  editActivity,
  deleteActivity,
  getAllActivities,
  getAllActivityCount,
  getUser,
  updateUser,
  deleteUser,
};
