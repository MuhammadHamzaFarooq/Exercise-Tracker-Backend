import authServices from "../../../services/auth/user/authServices.js";
import { constructResponse } from "../../../utils/helper.js";

const register = async (req, res) => {
  const response = await authServices.register(req.body);
  return constructResponse(res, response);
};

const login = async (req, res) => {
  const response = await authServices.login(req.body);
  return constructResponse(res, response);
};

const forgotPassword = async (req, res) => {
  const response = await authServices.forgotPassword(req.body);
  return constructResponse(res, response);
};

const ResetPassword = async (req, res) => {
  const response = await authServices.ResetPassword(req.body);
  return constructResponse(res, response);
};

const ResetPasswordVerify = async (req, res) => {
  const response = await authServices.ResetPasswordVerify(req.body);
  return constructResponse(res, response);
};

// Activity Api's
const createActivity = async (req, res) => {
  const response = await authServices.createActivity(req);
  return constructResponse(res, response);
};

const editActivity = async (req, res) => {
  const response = await authServices.editActivity(req.params.id, req.body);
  return constructResponse(res, response);
};

const deleteActivity = async (req, res) => {
  const response = await authServices.deleteActivity(req.params.activityId);
  return constructResponse(res, response);
};

const getAllActivities = async (req, res) => {
  const response = await authServices.getAllActivities(req);
  return constructResponse(res, response);
};

const getAllActivityCount = async (req, res) => {
  const response = await authServices.getAllActivityCount();
  return constructResponse(res, response);
};

const getUser = async (req, res) => {
  const response = await authServices.getUser(req.body);
  return constructResponse(res, response);
};

const updateUser = async (req, res) => {
  const response = await authServices.updateUser(req.body);
  return constructResponse(res, response);
};

const deleteUser = async (req, res) => {
  const response = await authServices.deleteUser(req.body);
  return constructResponse(res, response);
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
