import fs from "fs";
import request from "request";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

export const helper = {
  get: (options) => {
    return new Promise((resolve, reject) => {
      request(options, function (error, response, body) {
        if (error) reject(error);
        resolve(JSON.parse(body).secure_url);
      });
    });
  },
};

export const storage = multer.diskStorage({});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("video")) {
      return cb(new Error("File type not supported"));
    }
    cb(null, true);
  },
});

// Set up Cloudinary upload parameters
export const cloudinaryUpload = async (path) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      path,
      { resource_type: "video" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};
