import { mongoose, Schema, ObjectId } from "mongoose";

const activitySchema = new mongoose.Schema({
  user_id: [{ type: ObjectId, ref: "User" }],
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 100,
  },
  duration: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: undefined,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  activityType: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  url: {
    type: String,
  },
});

const Activity = new mongoose.model("Activity", activitySchema);

export default Activity;
