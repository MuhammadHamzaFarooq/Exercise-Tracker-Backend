import { Router } from "express";
import authController from "../../../../controllers/auth/user/authController.js";
import checkUserAuth from "../../../../middleware/auth/user/authMiddleware.js";
import { check } from "express-validator";

const AuthRouter = Router();

const path = "/auth";

// Route Level Middleware => Protected Routes
AuthRouter.use(`${path}/getUser`, checkUserAuth);
AuthRouter.use(`${path}/updateUser`, checkUserAuth);
AuthRouter.use(`${path}/deleteUser`, checkUserAuth);

// Route Level Middleware => Protected Routes Activity Apis
AuthRouter.use(`${path}/createActivity`, checkUserAuth);
AuthRouter.use(`${path}/deleteActivity`, checkUserAuth);
AuthRouter.use(`${path}/editActivity`, checkUserAuth);
AuthRouter.use(`${path}/getAllActivities`, checkUserAuth);
AuthRouter.use(`${path}/getAllActivityCount`, checkUserAuth);
AuthRouter.use(`${path}/logout`, checkUserAuth);

AuthRouter.post(
  `${path}/signup`,
  [
    check("name").not().isEmpty().withMessage("Please enter name"),
    check("email", "This is not a valid email").isEmail(),
    check("password").not().isEmpty().withMessage("Please enter password"),
  ],
  authController.register
);

AuthRouter.post(
  `${path}/login`,
  [
    check("email", "This is not a valid email").isEmail(),
    check("password").not().isEmpty().withMessage("Please enter password"),
  ],
  authController.login
);

//ForgotPassword Route
AuthRouter.post(
  `${path}/forgotPassword`,
  [check("email", "This is not a valid email").isEmail()],
  authController.forgotPassword
);

//ResetPassword
AuthRouter.post(
  `${path}/reset`,
  [
    check("email", "This is not a valid email").isEmail(),
    check("password").not().isEmpty().withMessage("Please enter password"),
  ],
  authController.ResetPassword
);

//ResetPasswordVerify
AuthRouter.post(
  `${path}/verifyOtp`,
  [
    check("email", "This is not a valid email").isEmail(),
    check("password").not().isEmpty().withMessage("Please enter password"),
    check("otp").not().isEmpty().withMessage("Please enter otp"),
  ],
  authController.ResetPasswordVerify
);

// Activity Api's

// Create Activity
AuthRouter.post(
  `${path}/createActivity`,
  [
    check("name").not().isEmpty().withMessage("Please enter activity name"),
    check("description")
      .not()
      .isEmpty()
      .withMessage("Please enter description"),
    check("date").not().isEmpty().withMessage("Please enter date"),
    check("startTime").not().isEmpty().withMessage("Please enter start time"),
    check("duration").not().isEmpty().withMessage("Please enter duration"),
    check("activityType")
      .not()
      .isEmpty()
      .withMessage("Please enter activityType"),
  ],
  authController.createActivity
);

// Edit Activity
AuthRouter.put(
  `${path}/editActivity/:id`,
  [
    check("id").not().isEmpty().withMessage("Please enter activity Id"),
    check("name").not().isEmpty().withMessage("Please enter activity name"),
    check("description")
      .not()
      .isEmpty()
      .withMessage("Please enter description"),
    check("date").not().isEmpty().withMessage("Please enter date"),
    check("startTime").not().isEmpty().withMessage("Please enter start time"),
    check("duration").not().isEmpty().withMessage("Please enter duration"),
    check("activityType")
      .not()
      .isEmpty()
      .withMessage("Please enter activityType"),
  ],
  authController.editActivity
);

// Delete Activity
AuthRouter.delete(
  `${path}/deleteActivity/:activityId`,
  check("activityId").not().isEmpty().withMessage("Please enter activity Id"),
  authController.deleteActivity
);

// Get All Activities
AuthRouter.get(`${path}/getAllActivities`, authController.getAllActivities);

//  Get All Activities count
AuthRouter.get(
  `${path}/getAllActivityCount`,
  authController.getAllActivityCount
);

AuthRouter.post(
  `${path}/getUser`,
  check("user_ud").not().isEmpty().withMessage("Please enter User Id"),
  authController.getUser
);

AuthRouter.put(
  `${path}/updateUser`,
  [
    check("user_id").not().isEmpty().withMessage("Please enter User Id"),
    check("name").not().isEmpty().withMessage("Please enter name"),
    check("email", "This is not a valid email").isEmail(),
    check("password").not().isEmpty().withMessage("Please enter password"),
  ],
  authController.updateUser
);

AuthRouter.delete(
  `${path}/deleteUser`,
  check("user_id").not().isEmpty().withMessage("Please enter User Id"),
  authController.deleteUser
);

export { AuthRouter };
