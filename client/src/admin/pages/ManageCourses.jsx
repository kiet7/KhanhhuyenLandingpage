import { useEffect, useState } from "react";
import { listCourses, createCourse, updateCourse, deleteCourse } from "../../api/courses";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import ImageUploader from "../components/ImageUploader";
import { formatPrice } from "../../lib/format";

const emptyCourse = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  level: "Sơ cấp",
  durationWeeks: 8,
  schedule: "",
  price: 0,
  imageUrl: "",
  syllabus: [],
  featured: false,
  order: 0,
  isActive: true,
};

export default function ManageCourses() {
  const [courses, setCourses] = useState(null);
  const [editing, setEditing] = useState(null); // null = list view, object = form view
  const [syllabusText, setSyllabusText] = useState("");
  const [saving, setSaving] = useState(false);

  function refresh() {
    listCourses(true).then(setCourses);
  }

  useEffect(refresh, []);

  function startCreate() {
    setEditing({ ...emptyCourse });
    setSyllabusText("");
  }
  function startEdit(course) {
    setEditing({ ...course });
    setSyllabusText((course.syllabus || []).join("\n"));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...editing,
      syllabus: syllabusText.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editing._id) {
        await updateCourse(editing._id, payload);
      } else {
        await createCourse(payload);
      }
      setEditing(null);
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(course) {
    if (!confirm(`Xóa khóa học "${course.title}"?`)) return;
    await deleteCourse(course._id);
    refresh();
  }

  const inputClass =
    "w-full rounded-xl border border-primary-200 px-4 py-2.5 outline-none focus:border-primary-400";

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-primary-900">
            {editing._id ? "Sửa khóa học" : "Thêm khóa học"}
          </h1>
          <button type="button" onClick={() => setEditing(null)} className="text-sm text-primary-600 hover:underline">
            ← Quay lại danh sách
          </button>
        </div>

        <Card className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Tên khóa học"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              className={inputClass}
            />
            <input
              placeholder="Slug (để trống sẽ tự tạo)"
              value={editing.slug}
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
              className={inputClass}
            />
            <select
              value={editing.level}
              onChange={(e) => setEditing({ ...editing, level: e.target.value })}
              className={inputClass}
            >
              <option>Sơ cấp</option>
              <option>Trung cấp</option>
              <option>Cao cấp</option>
            </select>
            <input
              type="number"
              placeholder="Số tuần"
              value={editing.durationWeeks}
              onChange={(e) => setEditing({ ...editing, durationWeeks: Number(e.target.value) })}
              className={inputClass}
            />
            <input
              placeholder="Lịch học (VD: Thứ 2-4-6, 19h-21h)"
              value={editing.schedule}
              onChange={(e) => setEditing({ ...editing, schedule: e.target.value })}
              className={inputClass}
            />
            <input
              type="number"
              placeholder="Học phí (VNĐ)"
              value={editing.price}
              onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
          <input
            placeholder="Mô tả ngắn (hiển thị ở danh sách)"
            value={editing.shortDescription}
            onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })}
            className={`${inputClass} mt-4`}
          />
          <textarea
            placeholder="Mô tả chi tiết"
            value={editing.description}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
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
              value={editing.imageUrl}
              onChange={(url) => setEditing({ ...editing, imageUrl: url })}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-primary-900">
              <input
                type="checkbox"
                checked={editing.featured}
                onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
              />
              Nổi bật (hiển thị ở trang chủ)
            </label>
            <label className="flex items-center gap-2 text-sm text-primary-900">
              <input
                type="checkbox"
                checked={editing.isActive}
                onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
              />
              Đang mở (hiển thị công khai)
            </label>
          </div>
        </Card>

        <Button type="submit" disabled={saving} className="w-fit">
          {saving ? "Đang lưu..." : "Lưu khóa học"}
        </Button>
      </form>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-primary-900">Khóa học</h1>
        <Button onClick={startCreate}>+ Thêm khóa học</Button>
      </div>

      {courses === null ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {courses.map((course) => (
            <Card key={course._id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-primary-50">
                  {course.imageUrl && (
                    <img src={course.imageUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-primary-900">{course.title}</p>
                    {!course.isActive && <Badge className="bg-gray-100 text-gray-500">Ẩn</Badge>}
                    {course.featured && <Badge className="bg-accent-100 text-accent-700">Nổi bật</Badge>}
                  </div>
                  <p className="text-sm text-primary-900/50">
                    {course.level} · {formatPrice(course.price)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => startEdit(course)}
                  className="rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-100"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(course)}
                  className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-100"
                >
                  Xóa
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
