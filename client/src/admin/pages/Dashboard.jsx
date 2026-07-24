import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCourses } from "../../api/courses";
import { listSubmissions } from "../../api/contact";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import CourseCalendar from "../components/CourseCalendar";

export default function Dashboard() {
  const [courses, setCourses] = useState(null);
  const [newContacts, setNewContacts] = useState(null);

  useEffect(() => {
    listCourses(true).then(setCourses);
    listSubmissions().then((subs) =>
      setNewContacts(subs.filter((c) => c.status === "new").length)
    );
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary-900">Tổng quan</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <p className="text-sm text-primary-900/60">Tổng số khóa học</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-primary-600">
            {courses?.length ?? "..."}
          </p>
          <Link to="/admin/khoa-hoc" className="mt-2 inline-block text-sm text-primary-600 hover:underline">
            Quản lý khóa học →
          </Link>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-primary-900/60">Liên hệ mới chưa xử lý</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-accent-600">
            {newContacts ?? "..."}
          </p>
          <Link to="/admin/lien-he" className="mt-2 inline-block text-sm text-primary-600 hover:underline">
            Xem liên hệ →
          </Link>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-primary-900">Lịch khóa học</h2>
      </div>

      <div className="mt-4">
        {courses === null ? (
          <div className="flex justify-center py-24">
            <Spinner />
          </div>
        ) : (
          <CourseCalendar courses={courses} />
        )}
      </div>
    </div>
  );
}
