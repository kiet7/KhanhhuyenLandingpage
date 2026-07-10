# Khánh Huyền Chinese

Website giới thiệu giảng viên tiếng Trung — trang chủ, giới thiệu bản thân, khóa học, và trang admin để tự quản trị nội dung.

## Yêu cầu

- Node.js 18+
- Docker Desktop (để chạy MongoDB local — xem lưu ý bên dưới) hoặc [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier
- Tài khoản [Cloudinary](https://cloudinary.com/users/register/free) (free tier) để upload ảnh

> **Lưu ý mạng trường/công ty:** một số mạng (VD: mạng nội bộ Đại học Duy Tân) chặn/can thiệp TLS handshake tới MongoDB Atlas, gây lỗi dạng `SSL routines:ssl3_read_bytes:tlsv1 alert internal error`. Nếu gặp lỗi này, dùng MongoDB local qua Docker thay vì Atlas (xem bên dưới) — không cần ra Internet nên không bị chặn.

## Cài đặt

### 0. MongoDB local qua Docker (khuyến nghị nếu ở mạng bị chặn Atlas)

```bash
docker compose up -d
```

Lệnh này chạy MongoDB tại `mongodb://localhost:27017`, dữ liệu được lưu lại qua Docker volume (không mất khi tắt container). Dùng `docker compose down` để dừng, `docker compose up -d` để chạy lại — dữ liệu vẫn còn.

### 1. Server

```bash
cd server
npm install
cp .env.example .env
```

Mở `.env` và điền:
- `MONGO_URI` — mặc định đã sẵn `mongodb://localhost:27017/khanhhuyen` khớp với Docker ở bước 0. Nếu dùng Atlas thay vì Docker, đổi thành connection string Atlas.
- `JWT_SECRET` — chuỗi ngẫu nhiên bất kỳ
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — lấy tại [Cloudinary Console](https://cloudinary.com/console)
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` — tài khoản đăng nhập admin sẽ được tạo khi seed

Tạo dữ liệu mẫu (tài khoản admin + profile + khóa học):

```bash
npm run seed
```

Chạy server (mặc định port 5000):

```bash
npm run dev
```

### 2. Client

```bash
cd client
npm install
cp .env.example .env
```

`.env` mặc định đã trỏ tới `http://localhost:5000/api`, chỉ cần đổi nếu server chạy port khác.

Chạy client (mặc định port 5173):

```bash
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`. Trang admin tại `http://localhost:5173/admin/login`, đăng nhập bằng `ADMIN_USERNAME`/`ADMIN_PASSWORD` đã cấu hình.

## Build production

```bash
cd client && npm run build   # ra thư mục client/dist, deploy lên Vercel/Netlify
cd server && npm start        # deploy lên Render/Railway, nhớ set env vars tương ứng
```

Khi deploy, cập nhật `CLIENT_URL` (server) và `VITE_API_URL` (client) trỏ đúng domain thật, và bật `NODE_ENV=production` ở server để cookie JWT dùng `secure: true`.
