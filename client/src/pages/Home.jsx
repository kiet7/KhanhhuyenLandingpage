import { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { listCourses } from "../api/courses";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import CourseCard from "../components/CourseCard";

export default function Home() {
  const { profile } = useOutletContext();
  const [courses, setCourses] = useState(null);

  useEffect(() => {
    listCourses()
      .then((data) => setCourses(data.filter((c) => c.featured).slice(0, 3)))
      .catch(() => setCourses([]));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center gap-6 text-center md:text-left">
            <Badge className="mx-auto md:mx-0 w-fit bg-accent-100 text-accent-700">
              {profile?.title || "Giảng viên tiếng Trung"}
            </Badge>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-primary-900 sm:text-5xl">
              Học tiếng Trung <span className="text-primary-500">vui, dễ, hiệu quả</span> cùng{" "}
              {profile?.name || "Khánh Huyền"}
            </h1>
            <p className="text-lg text-primary-900/70">
              {profile?.bio
                ? profile.bio.slice(0, 180) + (profile.bio.length > 180 ? "..." : "")
                : "Đồng hành cùng bạn chinh phục tiếng Trung từ con số 0 đến thành thạo."}
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              <Button as={Link} to="/khoa-hoc">
                Xem khóa học
              </Button>
              <Button as={Link} to="/gioi-thieu" variant="outline">
                Về giảng viên
              </Button>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-linear-to-br from-primary-200 to-accent-200 shadow-2xl shadow-primary-500/20">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-8xl text-white/80">
                中
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-primary-900/5 sm:grid-cols-2 md:grid-cols-2">
          <div className="text-center">
            <p className="font-display text-3xl font-extrabold text-primary-500">
              {profile?.yearsExperience || 0}+
            </p>
            <p className="text-sm text-primary-900/60">Năm kinh nghiệm</p>
          </div>
          <div className="text-center">
            <p className="font-display text-3xl font-extrabold text-accent-500">
              {profile?.studentsCount || 0}+
            </p>
            <p className="text-sm text-primary-900/60">Học viên đã đồng hành</p>
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-primary-900 sm:text-3xl">
              Khóa học nổi bật
            </h2>
            <p className="text-primary-900/60">Được nhiều học viên lựa chọn nhất</p>
          </div>
          <Link to="/khoa-hoc" className="hidden text-sm font-semibold text-primary-600 hover:underline sm:block">
            Xem tất cả →
          </Link>
        </div>

        {courses === null ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : courses.length === 0 ? (
          <p className="text-center text-primary-900/50">Chưa có khóa học nổi bật nào.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      {profile?.testimonials?.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl font-bold text-primary-900 sm:text-3xl">
              Học viên nói gì
            </h2>
            <p className="text-primary-900/60">Cảm nhận thực tế từ những người đã học cùng {profile?.name || "Khánh Huyền"}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {profile.testimonials.map((t) => (
              <Card key={t._id} className="flex flex-col gap-4 p-6">
                <div className="flex text-accent-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < t.rating ? "★" : "☆"}</span>
                  ))}
                </div>
                <p className="text-sm text-primary-900/70">“{t.content}”</p>
                <div className="mt-auto flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary-100">
                    {t.avatarUrl && (
                      <img src={t.avatarUrl} alt={t.studentName} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <p className="font-semibold text-primary-900">{t.studentName}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-linear-to-br from-primary-500 to-accent-500 px-6 py-12 text-center text-white">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Sẵn sàng bắt đầu hành trình tiếng Trung?
          </h2>
          <p className="max-w-xl text-white/90">
            Liên hệ ngay để được tư vấn lộ trình học phù hợp nhất với bạn.
          </p>
          <Button as={Link} to="/khoa-hoc" variant="white">
            Khám phá khóa học
          </Button>
        </div>
      </section>
    </div>
  );
}
