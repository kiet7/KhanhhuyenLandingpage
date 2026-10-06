import "dotenv/config";

import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import Profile from "../models/Profile.js";
import Course from "../models/Course.js";

async function seed() {
  await connectDB();



   // Admin
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme123";
  const existingAdmin = await Admin.findOne({ username: adminUsername });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await Admin.create({ username: adminUsername, passwordHash });
    console.log(`[seed] Đã tạo tài khoản admin: ${adminUsername}`);
  } else {
    console.log("[seed] Tài khoản admin đã tồn tại, bỏ qua");
  }
  // Profile
  const existingProfile = await Profile.findOne();
  if (!existingProfile) {
    await Profile.create({
      name: "Trần Khánh Huyền",
      title: "Giảng viên tiếng Trung",
      bio: "Xin chào, mình là Khánh Huyền — giảng viên tiếng Trung với niềm đam mê giúp các bạn học viên chinh phục ngôn ngữ và văn hóa Trung Hoa một cách tự nhiên, thú vị. Mình tốt nghiệp chuyên ngành Ngôn ngữ Trung Quốc và có nhiều năm kinh nghiệm giảng dạy từ trình độ HSK 1 đến HSK 6, luyện thi HSKK, và tiếng Trung giao tiếp thương mại.",
      avatarUrl: "",
      coverUrl: "",
      yearsExperience: 6,
      studentsCount: 1200,
      socialLinks: {
        zaloUrl: "https://zalo.me/0900000000",
        messengerUrl: "https://m.me/khanhhuyen.chinese",
        phone: "0900000000",
        email: "hello@khanhhuyenchinese.vn",
      },
      achievements: [
        {
          title: "HSK 6 - Điểm tuyệt đối",
          description: "Đạt điểm tối đa kỳ thi HSK 6 do Hanban tổ chức.",
          year: "2019",
          imageUrl: "",
        },
        {
          title: "Giảng viên xuất sắc",
          description: "Được vinh danh giảng viên tiếng Trung xuất sắc tại trung tâm ngoại ngữ ABC.",
          year: "2022",
          imageUrl: "",
        },
        {
          title: "1000+ học viên đã đồng hành",
          description: "Trực tiếp giảng dạy và đồng hành cùng hơn 1000 học viên các trình độ.",
          year: "2023",
          imageUrl: "",
        },
      ],
      certificates: [
        {
          title: "Chứng chỉ HSKK Cao cấp",
          issuer: "Hanban",
          year: "2019",
          imageUrl: "",
        },
        {
          title: "Chứng chỉ nghiệp vụ sư phạm",
          issuer: "Đại học Sư phạm",
          year: "2020",
          imageUrl: "",
        },
      ],
    });
    console.log("[seed] Đã tạo Profile mẫu");
  } else {
    console.log("[seed] Profile đã tồn tại, bỏ qua");
  }

  // Courses
  const courseCount = await Course.countDocuments();
  if (courseCount === 0) {
    await Course.insertMany([
      {
        title: "Tiếng Trung giao tiếp cho người mới bắt đầu",
        slug: "tieng-trung-giao-tiep-nguoi-moi-bat-dau",
        shortDescription: "Nền tảng phát âm, từ vựng và mẫu câu giao tiếp cơ bản.",
        description:
          "Khóa học dành cho người chưa biết gì về tiếng Trung, tập trung vào phát âm chuẩn, 500+ từ vựng thông dụng và các mẫu câu giao tiếp hằng ngày.",
        level: "Sơ cấp",
        durationWeeks: 8,
        schedule: "Thứ 2 - 4 - 6, 19h-21h",
        price: 1800000,
        imageUrl: "",
        syllabus: ["Phát âm & Thanh điệu", "500 từ vựng cơ bản", "Mẫu câu giao tiếp", "Luyện nghe nói"],
        featured: true,
        order: 1,
        isActive: true,
      },
      {
        title: "Luyện thi HSK 3-4",
        slug: "luyen-thi-hsk-3-4",
        shortDescription: "Lộ trình luyện thi HSK 3-4 bài bản, cam kết đầu ra.",
        description:
          "Khóa học chuyên sâu luyện thi HSK 3-4 với đầy đủ 4 kỹ năng nghe, nói, đọc, viết, kèm đề thi thử hàng tuần.",
        level: "Trung cấp",
        durationWeeks: 10,
        schedule: "Thứ 3 - 5 - 7, 19h-21h",
        price: 2500000,
        imageUrl: "",
        syllabus: ["Ngữ pháp HSK 3-4", "Chiến thuật làm bài thi", "Luyện đề thi thử", "Luyện viết"],
        featured: true,
        order: 2,
        isActive: true,
      },
      {
        title: "Tiếng Trung thương mại - Văn phòng",
        slug: "tieng-trung-thuong-mai-van-phong",
        shortDescription: "Tiếng Trung ứng dụng trong công việc, đàm phán, email.",
        description:
          "Dành cho người đi làm cần sử dụng tiếng Trung trong môi trường công sở: họp, đàm phán, viết email, thuyết trình.",
        level: "Trung cấp",
        durationWeeks: 8,
        schedule: "Thứ 2 - 4, 19h30-21h30",
        price: 2800000,
        imageUrl: "",
        syllabus: ["Từ vựng thương mại", "Kỹ năng đàm phán", "Viết email công việc", "Thuyết trình"],
        featured: false,
        order: 3,
        isActive: true,
      },
      {
        title: "Luyện thi HSK 5-6 nâng cao",
        slug: "luyen-thi-hsk-5-6-nang-cao",
        shortDescription: "Chinh phục HSK 5-6 cùng lộ trình chuyên sâu.",
        description:
          "Khóa học nâng cao dành cho học viên đã có nền tảng HSK 4, hướng tới HSK 5-6 với khối lượng từ vựng và ngữ pháp học thuật lớn.",
        level: "Cao cấp",
        durationWeeks: 12,
        schedule: "Thứ 3 - 5 - 7, 19h30-21h30",
        price: 3500000,
        imageUrl: "",
        syllabus: ["Từ vựng học thuật", "Ngữ pháp nâng cao", "Luyện viết luận", "Luyện đề HSK 5-6"],
        featured: false,
        order: 4,
        isActive: true,
      },
    ]);
    console.log("[seed] Đã tạo 4 khóa học mẫu");
  } else {
    console.log("[seed] Đã có khóa học trong DB, bỏ qua");
  }

  await mongoose.disconnect();
  console.log("[seed] Hoàn tất");
}

seed().catch((err) => {
  console.error("[seed] Lỗi:", err);
  process.exit(1);
});
