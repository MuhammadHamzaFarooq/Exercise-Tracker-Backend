import { mongoose, Schema } from "mongoose";

const activitySchema = new mongoose.Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User" },
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
    type: Date,
    default: undefined,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Activity = new mongoose.model("Activity", activitySchema);

export default Activity;
