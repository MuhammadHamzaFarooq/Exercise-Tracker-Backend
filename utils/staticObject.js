import fs from "fs";
export const cloudinaryOptions = (image) => {
  let options = {
    method: "POST",
    url: "https://api.cloudinary.com/v1_1/bng/image/upload",
    headers: {
      "cache-control": "no-cache",
      "content-type":
        "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
    },
    formData: {
      file: {
        value: fs.readFileSync(image),
        options: { filename: "r.png", contentType: null },
      },
      upload_preset: "uploadApi",
      cloud_name: "bng",
    },
  };
  return options;
};
