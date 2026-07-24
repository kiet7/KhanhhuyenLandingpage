import { useEffect, useState } from "react";
import { listCourses, createCourse, updateCourse, deleteCourse } from "../../api/courses";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import CourseForm, { emptyCourse } from "../components/CourseForm";
import { formatPrice } from "../../lib/format";

export default function ManageCourses() {
  const [courses, setCourses] = useState(null);
  const [editing, setEditing] = useState(null); // null = list view, object = form view
  const [saving, setSaving] = useState(false);

  function refresh() {
    listCourses(true).then(setCourses);
  }

  useEffect(refresh, []);

  function startCreate() {
    setEditing({ ...emptyCourse });
  }
  function startEdit(course) {
    setEditing({ ...course });
  }

  async function handleSave(payload) {
    setSaving(true);
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

  if (editing) {
    return (
      <div className="max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-primary-900">
            {editing._id ? "Sửa khóa học" : "Thêm khóa học"}
          </h1>
          <button type="button" onClick={() => setEditing(null)} className="text-sm text-primary-600 hover:underline">
            ← Quay lại danh sách
          </button>
        </div>

        <CourseForm
          initial={editing}
          onSubmit={handleSave}
          saving={saving}
          submitLabel="Lưu khóa học"
        />
      </div>
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
