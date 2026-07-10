import { useEffect, useState } from "react";
import { listCourses } from "../api/courses";
import CourseCard from "../components/CourseCard";
import Spinner from "../components/ui/Spinner";

const LEVELS = ["Tất cả", "Sơ cấp", "Trung cấp", "Cao cấp"];

export default function Courses() {
  const [courses, setCourses] = useState(null);
  const [level, setLevel] = useState("Tất cả");

  useEffect(() => {
    listCourses()
      .then(setCourses)
      .catch(() => setCourses([]));
  }, []);

  const filtered =
    courses && (level === "Tất cả" ? courses : courses.filter((c) => c.level === level));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold text-primary-900 sm:text-4xl">
          Các khóa học tiếng Trung
        </h1>
        <p className="mt-2 text-primary-900/60">
          Lộ trình phù hợp cho mọi trình độ, từ mất gốc đến luyện thi HSK nâng cao.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              level === l
                ? "bg-primary-500 text-white"
                : "bg-white text-primary-700 ring-1 ring-primary-200 hover:bg-primary-50"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {filtered === null ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-16 text-center text-primary-900/50">Không có khóa học nào.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
