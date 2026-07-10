import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCourseBySlug } from "../api/courses";
import { submitContact } from "../api/contact";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { formatPrice } from "../lib/format";

export default function CourseDetail() {
  const { slug } = useParams();
  const [course, setCourse] = useState(undefined);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  useEffect(() => {
    getCourseBySlug(slug)
      .then(setCourse)
      .catch(() => setCourse(null));
  }, [slug]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      await submitContact({ ...form, courseInterested: course._id });
      setStatus("sent");
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch {
      setStatus("error");
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
      </div>

      <h1 className="mt-3 font-display text-3xl font-extrabold text-primary-900">{course.title}</h1>
      <p className="mt-2 text-xl font-semibold text-accent-600">{formatPrice(course.price)}</p>
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

      <Card className="mt-8 p-6 sm:p-8" id="dang-ky">
        <h2 className="font-display text-lg font-bold text-primary-900">
          Đăng ký / Liên hệ về khóa học này
        </h2>

        {status === "sent" ? (
          <p className="mt-4 rounded-2xl bg-primary-50 p-4 text-primary-700">
            Cảm ơn bạn! Thông tin đã được gửi, giảng viên sẽ liên hệ lại sớm nhất.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              required
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
    </div>
  );
}
