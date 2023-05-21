import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import { BASE_URL } from "./utils/constant.js";
import { AuthRouter } from "./api/routes/auth/user/authRouter.js";
import connectDB from "./config/dbConnection.js";
import cors from "cors";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";
import { v2 as cloudinary } from "cloudinary";
import cloudinaryConfig from "./config/cloudinaryConfig.js";
import multer from "multer";

dotenv.config();
cloudinaryConfig();
const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});
app.use(morgan("dev"));
// Set up the storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Set up the file filter for Multer
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed"));
  }
};

// Set up Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100000000 }, // 100MB
});

mongoose.set("strictQuery", true);
connectDB(process.env.MONGODB_URL);

// Routes
app.use(`${BASE_URL}`, AuthRouter); // user routes

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}${BASE_URL} `);
});
