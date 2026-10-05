import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGO_URI_MONGODB_URI || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGO_URI chưa được cấu hình trong .env");
  }
  await mongoose.connect(uri);
  console.log("[db] Đã kết nối MongoDB");
}
