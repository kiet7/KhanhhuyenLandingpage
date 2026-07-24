import { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ImageUploader from "./ImageUploader";

const DEFAULT_DURATION_WEEKS = 8;

export const emptyCourse = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  level: "Sơ cấp",
  durationWeeks: "",
  schedule: "",
  sessions: [],
  price: "",
  imageUrl: "",
  syllabus: [],
  featured: false,
  order: 0,
  isActive: true,
};

const DAYS = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "Chủ Nhật" },
];

const inputClass =
  "w-full rounded-xl border border-primary-200 px-4 py-2.5 outline-none focus:border-primary-400";

// Form dùng chung cho tạo/sửa khóa học ở cả trang Quản lý khóa học và modal
// "Tạo khóa học nhanh" ở Tổng quan. `compact` ẩn các trường thứ yếu
// (slug, lịch dạng văn bản, mô tả, nội dung, ảnh, nổi bật) cho luồng tạo nhanh.
export default function CourseForm({
  initial,
  onSubmit,
  saving = false,
  submitLabel = "Lưu khóa học",
  compact = false,
}) {
  const [form, setForm] = useState(() => ({ ...emptyCourse, ...initial }));
  const [syllabusText, setSyllabusText] = useState((initial.syllabus || []).join("\n"));
  const [sessionsByDay, setSessionsByDay] = useState(() => {
    const map = {};
    (initial.sessions || []).forEach((s) => {
      map[s.day] = { startTime: s.startTime || "19:00", endTime: s.endTime || "21:00" };
    });
    return map;
  });

  function toggleDay(day) {
    setSessionsByDay((prev) => {
      if (day in prev) {
        const next = { ...prev };
        delete next[day];
        return next;
      }
      return { ...prev, [day]: { startTime: "19:00", endTime: "21:00" } };
    });
  }

  function updateDayTime(day, field, value) {
    setSessionsByDay((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const sessions = Object.entries(sessionsByDay).map(([day, t]) => ({
      day: Number(day),
      startTime: t.startTime,
      endTime: t.endTime,
    }));
    onSubmit({
      ...form,
      durationWeeks: form.durationWeeks === "" ? DEFAULT_DURATION_WEEKS : Number(form.durationWeeks),
      price: form.price === "" ? 0 : Number(form.price),
      syllabus: syllabusText.split("\n").map((s) => s.trim()).filter(Boolean),
      sessions,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            required
            autoFocus
            placeholder="Tên khóa học"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
          />
          {!compact && (
            <input
              placeholder="Slug (để trống sẽ tự tạo)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className={inputClass}
            />
          )}
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            className={inputClass}
          >
            <option>Sơ cấp</option>
            <option>Trung cấp</option>
            <option>Cao cấp</option>
          </select>
          <input
            type="number"
            placeholder="Số tuần"
            value={form.durationWeeks}
            onChange={(e) => setForm({ ...form, durationWeeks: e.target.value === "" ? "" : Number(e.target.value) })}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Học phí (VNĐ)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value === "" ? "" : Number(e.target.value) })}
            className={inputClass}
          />
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-primary-900">Ngày học trong tuần</p>
          <div className="flex flex-col gap-2">
            {DAYS.map((d) => {
              const active = d.value in sessionsByDay;
              return (
                <div key={d.value} className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={`w-28 shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-primary-500 text-white"
                        : "bg-primary-50 text-primary-600 hover:bg-primary-100"
                    }`}
                  >
                    {d.label}
                  </button>
                  {active && (
                    <>
                      <input
                        type="time"
                        value={sessionsByDay[d.value].startTime}
                        onChange={(e) => updateDayTime(d.value, "startTime", e.target.value)}
                        className={`${inputClass} w-32`}
                      />
                      <span className="text-sm text-primary-900/40">đến</span>
                      <input
                        type="time"
                        value={sessionsByDay[d.value].endTime}
                        onChange={(e) => updateDayTime(d.value, "endTime", e.target.value)}
                        className={`${inputClass} w-32`}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!compact && (
          <>
            <input
              placeholder="Lịch học dạng văn bản (để trống sẽ tự tạo từ ngày/giờ ở trên)"
              value={form.schedule}
              onChange={(e) => setForm({ ...form, schedule: e.target.value })}
              className={`${inputClass} mt-4`}
            />
            <input
              placeholder="Mô tả ngắn (hiển thị ở danh sách)"
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              className={`${inputClass} mt-4`}
            />
            <textarea
              placeholder="Mô tả chi tiết"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className={`${inputClass} mt-4`}
            />
            <textarea
              placeholder={"Nội dung khóa học, mỗi dòng 1 mục"}
              value={syllabusText}
              onChange={(e) => setSyllabusText(e.target.value)}
              rows={4}
              className={`${inputClass} mt-4`}
            />
            <div className="mt-4">
              <ImageUploader
                label="Ảnh khóa học"
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
              />
            </div>
          </>
        )}

        <div className="mt-4 flex flex-wrap gap-6">
          {!compact && (
            <label className="flex items-center gap-2 text-sm text-primary-900">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Nổi bật (hiển thị ở trang chủ)
            </label>
          )}
          <label className="flex items-center gap-2 text-sm text-primary-900">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Đang mở (hiển thị công khai)
          </label>
        </div>
      </Card>

      <Button type="submit" disabled={saving} className="w-fit">
        {saving ? "Đang lưu..." : submitLabel}
      </Button>
    </form>
  );
}
