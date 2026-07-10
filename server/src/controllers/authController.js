import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const COOKIE_NAME = "token";

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Vui lòng nhập tên đăng nhập và mật khẩu" });
  }

  const admin = await Admin.findOne({ username });
  if (!admin) {
    return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
  }

  const isMatch = await bcrypt.compare(password, admin.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
  }

  const token = jwt.sign(
    { id: admin._id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  res.cookie(COOKIE_NAME, token, cookieOptions());
  res.json({ id: admin._id, username: admin.username });
}

export function logout(req, res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  res.json({ message: "Đã đăng xuất" });
}

export function me(req, res) {
  res.json({ id: req.admin.id, username: req.admin.username });
}
