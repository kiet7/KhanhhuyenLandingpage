import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCourses } from "../../api/courses";
import { listSubmissions } from "../../api/contact";
import Card from "../../components/ui/Card";

export default function Dashboard() {
  const [stats, setStats] = useState({ courses: null, newContacts: null });

  useEffect(() => {
    listCourses(true).then((courses) => setStats((s) => ({ ...s, courses: courses.length })));
    listSubmissions().then((subs) =>
      setStats((s) => ({ ...s, newContacts: subs.filter((c) => c.status === "new").length }))
    );
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary-900">Tổng quan</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <p className="text-sm text-primary-900/60">Tổng số khóa học</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-primary-600">
            {stats.courses ?? "..."}
          </p>
          <Link to="/admin/khoa-hoc" className="mt-2 inline-block text-sm text-primary-600 hover:underline">
            Quản lý khóa học →
          </Link>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-primary-900/60">Liên hệ mới chưa xử lý</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-accent-600">
            {stats.newContacts ?? "..."}
          </p>
          <Link to="/admin/lien-he" className="mt-2 inline-block text-sm text-primary-600 hover:underline">
            Xem liên hệ →
          </Link>
        </Card>
      </div>
    </div>
  );
}
