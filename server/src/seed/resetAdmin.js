import "dotenv/config";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";

// Đặt lại mật khẩu admin (tạo mới nếu chưa có), dùng ADMIN_USERNAME / ADMIN_PASSWORD trong env.
// Liệt kê các admin hiện có để biết DB đang chứa tài khoản nào.
async function resetAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error("Cần ADMIN_USERNAME và ADMIN_PASSWORD");
  }

  await connectDB();
  console.log(`[reset] Database: ${mongoose.connection.name}`);

  const existing = await Admin.find({}, { username: 1 }).lean();
  console.log(`[reset] Admin hiện có: ${existing.map((a) => a.username).join(", ") || "(không có)"}`);

  const passwordHash = await bcrypt.hash(password, 10);
  await Admin.updateOne({ username }, { $set: { passwordHash } }, { upsert: true });
  console.log(`[reset] Đã đặt mật khẩu cho admin: ${username}`);

  await mongoose.disconnect();
}

resetAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
