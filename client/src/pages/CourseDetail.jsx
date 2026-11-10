import { useEffect, useState } from "react";
import { useParams, useOutletContext, Link } from "react-router-dom";
import { getCourseBySlug } from "../api/courses";
import { submitContact } from "../api/contact";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { formatPrice, formatDate } from "../lib/format";
import { readCache } from "../lib/cache";
import { BRAND, buildCourseOg, courseUrl } from "../lib/og";
import { usePageMeta } from "../lib/seo";
import ShareButtons from "../components/ShareButtons";

// Lấy khóa học từ danh sách đã cache (trang chủ / danh sách khóa học) để hiện ngay.
function cachedCourse(slug) {
  return readCache("courses")?.find((c) => c.slug === slug);
}

export default function CourseDetail() {
  const { slug } = useParams();
  const { profile } = useOutletContext();
  const [course, setCourse] = useState(() => cachedCourse(slug));
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  // Form đăng ký ẩn mặc định; link có #dang-ky thì mở sẵn
  const [formOpen, setFormOpen] = useState(() => window.location.hash === "#dang-ky");

  function openRegisterForm() {
    setFormOpen(true);
    document.getElementById("dang-ky")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    setCourse(cachedCourse(slug));
    getCourseBySlug(slug)
      .then(setCourse)
      // 404 = khóa học đã bị xóa/ẩn; lỗi khác (mạng, server ngủ) thì giữ bản cache
      .catch((err) => setCourse((prev) => (err.response?.status === 404 ? null : prev ?? null)));
  }, [slug]);

  const og = course ? buildCourseOg(course) : null;
  usePageMeta({
    title: og && `${og.title} | ${BRAND}`,
    description: og?.description,
    path: `/khoa-hoc/${slug}`,
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      await submitContact({ ...form, courseInterested: course._id });
      setStatus("sent");
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch (err) {
      // 403 = admin vừa tắt nhận đăng ký khóa này → chuyển sang thông báo tạm ngưng
      if (err.response?.status === 403) setCourse((c) => ({ ...c, registrationOpen: false }));
      setStatus(err.response?.status === 403 ? "idle" : "error");
    }
  }

  if (course === undefined) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (course === null) {
    return (
      <div className="py-24 text-center">
        <p className="text-primary-900/60">Không tìm thấy khóa học này.</p>
        <Link to="/khoa-hoc" className="mt-4 inline-block text-primary-600 hover:underline">
          ← Quay lại danh sách khóa học
        </Link>
      </div>
    );
  }

  const registrationOpen = course.registrationOpen !== false; // khóa cũ chưa có trường này = đang nhận

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link to="/khoa-hoc" className="text-sm font-semibold text-primary-600 hover:underline">
        ← Tất cả khóa học
      </Link>

      <div className="mt-4 aspect-video w-full overflow-hidden rounded-3xl bg-linear-to-br from-primary-100 to-accent-100">
        {course.imageUrl && (
          <img src={course.imageUrl} alt={course.title} className="h-full w-full object-cover" />
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Badge>{course.level}</Badge>
        <span className="text-sm text-primary-900/50">{course.durationWeeks} tuần</span>
        {course.schedule && <span className="text-sm text-primary-900/50">· {course.schedule}</span>}
        {course.startDate && (
          <span className="text-sm text-primary-900/50">· Khai giảng {formatDate(course.startDate)}</span>
        )}
      </div>

      <h1 className="mt-3 font-display text-3xl font-extrabold text-primary-900">{course.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <p className="text-xl font-semibold text-accent-600">{formatPrice(course.price)}</p>
        {registrationOpen ? (
          <Button type="button" onClick={openRegisterForm}>
            Đăng ký khóa học
          </Button>
        ) : (
          <Badge className="bg-amber-100 text-amber-700">Tạm ngưng nhận đăng ký</Badge>
        )}
      </div>
      <div className="mt-4">
        <ShareButtons url={courseUrl(course)} />
      </div>
      <p className="mt-4 whitespace-pre-line leading-relaxed text-primary-900/80">{course.description}</p>

      {course.syllabus?.length > 0 && (
        <Card className="mt-8 p-6">
          <h2 className="font-display text-lg font-bold text-primary-900">Nội dung khóa học</h2>
          <ul className="mt-3 space-y-2">
            {course.syllabus.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-primary-900/80">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-xs text-primary-600">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {!registrationOpen ? (
        <RegistrationClosed contact={profile?.socialLinks} />
      ) : (
      <Card className="mt-8 scroll-mt-24 p-6 sm:p-8" id="dang-ky">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-primary-900">
            Đăng ký / Liên hệ về khóa học này
          </h2>
          {status !== "sent" && (
            <button
              type="button"
              onClick={() => setFormOpen((open) => !open)}
              aria-expanded={formOpen}
              aria-controls="form-dang-ky"
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                formOpen
                  ? "bg-primary-50 text-primary-600 hover:bg-primary-100"
                  : "bg-primary-500 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-600"
              }`}
            >
              {formOpen ? "Thu gọn ▴" : "Đăng ký ngay ▾"}
            </button>
          )}
        </div>

        {status !== "sent" && !formOpen ? (
          <p className="mt-2 text-sm text-primary-900/60">
            Để lại họ tên và số điện thoại, giảng viên sẽ liên hệ tư vấn lịch học và học phí cho bạn.
          </p>
        ) : status === "sent" ? (
          <p className="mt-4 rounded-2xl bg-primary-50 p-4 text-primary-700">
            Cảm ơn bạn! Thông tin đã được gửi, giảng viên sẽ liên hệ lại sớm nhất.
          </p>
        ) : (
          <form id="form-dang-ky" onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              required
              autoFocus
              placeholder="Họ và tên"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-primary-200 px-4 py-2.5 outline-none focus:border-primary-400"
            />
            <input
              required
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-xl border border-primary-200 px-4 py-2.5 outline-none focus:border-primary-400"
            />
            <input
              type="email"
              placeholder="Email (không bắt buộc)"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-xl border border-primary-200 px-4 py-2.5 outline-none focus:border-primary-400 sm:col-span-2"
            />
            <textarea
              placeholder="Lời nhắn (không bắt buộc)"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              className="rounded-xl border border-primary-200 px-4 py-2.5 outline-none focus:border-primary-400 sm:col-span-2"
            />
            <Button type="submit" disabled={status === "sending"} className="sm:col-span-2">
              {status === "sending" ? "Đang gửi..." : "Gửi đăng ký"}
            </Button>
            {status === "error" && (
              <p className="text-sm text-red-500 sm:col-span-2">Có lỗi xảy ra, vui lòng thử lại.</p>
            )}
          </form>
        )}
      </Card>
      )}
    </div>
  );
}

// Zalo trong admin có thể là link hoặc chỉ là số điện thoại
function zaloHref(value) {
  if (!value) return null;
  return /^https?:\/\//.test(value) ? value : `https://zalo.me/${value.replace(/\D/g, "")}`;
}

// Thay cho form đăng ký khi admin tắt "Nhận đăng ký" (lớp đã đủ học viên)
function RegistrationClosed({ contact }) {
  const phone = contact?.phone;
  const zalo = zaloHref(contact?.zaloUrl);
  return (
    <Card className="mt-8 scroll-mt-24 p-6 sm:p-8" id="dang-ky">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg">⏸</span>
        <div>
          <h2 className="font-display text-lg font-bold text-primary-900">Khóa học tạm ngưng nhận đăng ký</h2>
          <p className="mt-1 text-sm text-primary-900/60">
            Lớp hiện đã đủ học viên. Liên hệ để được báo lịch khai giảng khóa tiếp theo hoặc tư vấn khóa học phù hợp.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {zalo && (
              <a href={zalo} target="_blank" rel="noreferrer" className="rounded-full bg-[#0068ff] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                Nhắn Zalo
              </a>
            )}
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-100">
                Gọi {phone}
              </a>
            )}
            <Link to="/khoa-hoc" className="rounded-full px-4 py-2 text-sm font-semibold text-primary-600 hover:underline">
              Xem khóa học khác →
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
