# Khánh Huyền Chinese — Website giới thiệu giảng viên tiếng Trung

Website cá nhân cho giảng viên tiếng Trung: giới thiệu bản thân, thành tích, và các khóa học. Có trang admin để tự quản trị nội dung, không cần dev can thiệp mỗi lần cập nhật.

## Kiến trúc

Monorepo 2 package độc lập, giao tiếp qua REST API:

- `client/` — React (Vite) + Tailwind CSS v4 + React Router. JavaScript thuần (không TS).
- `server/` — Node.js + Express + Mongoose (MongoDB). JWT auth qua httpOnly cookie. Ảnh upload qua Cloudinary.

```
client/src/
  api/            axios instance + 1 file/resource (courses.js, profile.js, contact.js, auth.js, upload.js)
  components/
    layout/       Navbar, Footer, FloatingContact, PublicLayout (bọc 3 trang public, fetch Profile 1 lần)
    ui/           Button, Card, Badge, Spinner — primitives tái dùng, đừng viết lại style trùng
  pages/          Home, About, Courses, CourseDetail, NotFound (public)
  admin/
    pages/        Login, Dashboard, ManageProfile, ManageCourses, ContactSubmissions
    components/   AdminLayout (sidebar), ProtectedRoute, ImageUploader (dùng chung mọi chỗ upload ảnh)
  context/        AuthContext — quản lý session admin (gọi /api/auth/me lúc load app)
  lib/            helper thuần (format.js)

server/src/
  config/         db.js (mongoose connect), cloudinary.js
  models/         Admin, Profile (singleton, chứa achievements/certificates dạng subdocument), Course, ContactSubmission
  controllers/    1 file/resource, hàm async thuần (express-async-errors bắt lỗi tự động, không cần try/catch thủ công)
  routes/         khai báo route + middleware requireAuth cho route admin
  middleware/     auth.js (verify JWT cookie), upload.js (multer memory storage), errorHandler.js
  seed/seed.js    tạo admin + Profile mẫu + Course mẫu — chạy `npm run seed`
```

## Quy ước quan trọng

- **Auth**: JWT lưu trong httpOnly cookie tên `token`, không lưu localStorage. CORS bật `credentials: true`, origin giới hạn theo `CLIENT_URL`.
- **Profile là singleton**: chỉ có đúng 1 document Profile trong DB. Achievements/certificates là subdocument nhúng trong Profile, sửa chung 1 trang admin — không tách CRUD riêng.
- **Course có CRUD đầy đủ** vì đây là danh sách sẽ tăng dần theo thời gian.
- **Ảnh luôn qua Cloudinary**: không lưu file trên server (mất khi redeploy). Mọi upload đi qua `POST /api/upload` → dùng component `ImageUploader` ở client.
- **Slug khóa học** tự sinh từ title nếu để trống (xem `slugify()` trong `courseController.js`).
- **Màu sắc**: palette custom định nghĩa trong `client/src/index.css` qua `@theme` (Tailwind v4 CSS-first config, không có `tailwind.config.js`). Tone chủ đạo: `primary` (hồng san hô), `accent` (cam đào), nền `cream`.

## Quy trình thêm 1 tính năng/resource mới

1. **Model trước** — định nghĩa/cập nhật Mongoose schema trong `server/src/models/`.
2. **Route + controller** — viết API trong `server/src/controllers/` + `server/src/routes/`, đăng ký route trong `server/src/app.js`. Test nhanh bằng curl/REST client trước khi đụng frontend.
3. **API client function** — thêm 1 hàm trong `client/src/api/<resource>.js` dùng `axiosClient`.
4. **UI** — component/page dùng hàm API ở trên, có loading + error state tối thiểu (xem pattern trong `Courses.jsx`, `CourseDetail.jsx`).
5. **Admin CRUD song song** nếu resource cần quản trị — theo đúng pattern `ManageCourses.jsx` (list view ⇄ form view trong cùng 1 component).
6. **Kiểm thử tay qua trình duyệt** theo luồng thật (không chỉ dựa vào code compile được) trước khi báo hoàn thành.

## Chạy dự án local

Xem [README.md](README.md) để biết cách cài đặt và chạy.
