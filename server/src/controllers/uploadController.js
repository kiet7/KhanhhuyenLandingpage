import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

export async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file nào được gửi lên" });
  }

  const streamUpload = () =>
    new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "khanhhuyen" },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

  try {
    const result = await streamUpload();
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: "Upload ảnh thất bại", error: err.message });
  }
}
