import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] Đang chạy tại http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("[server] Khởi động thất bại:", err.message);
  process.exit(1);
});
