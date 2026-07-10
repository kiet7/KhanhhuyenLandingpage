import { useEffect, useState } from "react";
import { listSubmissions, updateSubmissionStatus } from "../../api/contact";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";

const STATUS_LABEL = { new: "Mới", contacted: "Đã liên hệ", closed: "Đã đóng" };
const STATUS_STYLE = {
  new: "bg-primary-100 text-primary-700",
  contacted: "bg-accent-100 text-accent-700",
  closed: "bg-gray-100 text-gray-500",
};

export default function ContactSubmissions() {
  const [submissions, setSubmissions] = useState(null);

  function refresh() {
    listSubmissions().then(setSubmissions);
  }

  useEffect(refresh, []);

  async function handleStatusChange(id, status) {
    await updateSubmissionStatus(id, status);
    refresh();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary-900">Liên hệ / Đăng ký</h1>

      {submissions === null ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : submissions.length === 0 ? (
        <p className="mt-6 text-primary-900/50">Chưa có liên hệ nào.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {submissions.map((s) => (
            <Card key={s._id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-primary-900">{s.name}</p>
                  <p className="text-sm text-primary-900/60">
                    {s.phone} {s.email && `· ${s.email}`}
                  </p>
                  {s.courseInterested && (
                    <p className="mt-1 text-xs text-primary-500">
                      Quan tâm khóa học: {s.courseInterested.title}
                    </p>
                  )}
                  {s.message && <p className="mt-2 text-sm text-primary-900/80">{s.message}</p>}
                  <p className="mt-2 text-xs text-primary-900/40">
                    {new Date(s.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <select
                  value={s.status}
                  onChange={(e) => handleStatusChange(s._id, e.target.value)}
                  className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold ${STATUS_STYLE[s.status]}`}
                >
                  {Object.entries(STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
