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
const VIEWS = [
  { value: "course", label: "Theo khóa học" },
  { value: "all", label: "Tất cả" },
];
const GENERAL_KEY = "general";

// Gom liên hệ theo khóa học quan tâm. Nhóm có đăng ký mới nhất lên đầu,
// "Liên hệ chung" (không chọn khóa / khóa đã bị xóa) luôn ở cuối.
function groupByCourse(submissions) {
  const groups = new Map();
  for (const s of submissions) {
    const key = s.courseInterested?._id || GENERAL_KEY;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        title: s.courseInterested?.title || "Liên hệ chung (không chọn khóa học)",
        items: [],
      });
    }
    groups.get(key).items.push(s); // API đã sắp xếp mới nhất trước
  }
  return [...groups.values()].sort((a, b) => {
    if (a.key === GENERAL_KEY) return 1;
    if (b.key === GENERAL_KEY) return -1;
    return new Date(b.items[0].createdAt) - new Date(a.items[0].createdAt);
  });
}

export default function ContactSubmissions() {
  const [submissions, setSubmissions] = useState(null);
  const [view, setView] = useState("course");
  const [statusFilter, setStatusFilter] = useState("all");

  function refresh() {
    listSubmissions().then(setSubmissions);
  }

  useEffect(refresh, []);

  async function handleStatusChange(id, status) {
    await updateSubmissionStatus(id, status);
    refresh();
  }

  const counts = { all: submissions?.length ?? 0 };
  submissions?.forEach((s) => (counts[s.status] = (counts[s.status] || 0) + 1));
  const visible = submissions?.filter((s) => statusFilter === "all" || s.status === statusFilter) ?? [];

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
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {["all", ...Object.keys(STATUS_LABEL)].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                    statusFilter === status
                      ? "bg-primary-500 font-semibold text-white"
                      : "bg-white text-primary-900/70 ring-1 ring-primary-100 hover:bg-primary-50"
                  }`}
                >
                  {status === "all" ? "Tất cả" : STATUS_LABEL[status]} ({counts[status] || 0})
                </button>
              ))}
            </div>
            <div className="flex rounded-full bg-white p-1 ring-1 ring-primary-100">
              {VIEWS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setView(v.value)}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    view === v.value ? "bg-primary-500 font-semibold text-white" : "text-primary-900/70"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="mt-6 text-primary-900/50">Không có liên hệ nào ở trạng thái này.</p>
          ) : view === "all" ? (
            <div className="mt-4 flex flex-col gap-3">
              {visible.map((s) => (
                <SubmissionCard key={s._id} s={s} showCourse onStatusChange={handleStatusChange} />
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              {groupByCourse(visible).map((g) => {
                const newCount = g.items.filter((s) => s.status === "new").length;
                return (
                  <details key={g.key} open className="group rounded-3xl bg-primary-50/50 ring-1 ring-primary-100">
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4">
                      <span className="text-primary-400 transition-transform group-open:rotate-90">▶</span>
                      <span className="flex-1 font-semibold text-primary-900">{g.title}</span>
                      {newCount > 0 && (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE.new}`}>
                          {newCount} mới
                        </span>
                      )}
                      <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-primary-900/60 ring-1 ring-primary-100">
                        {g.items.length} đăng ký
                      </span>
                    </summary>
                    <div className="flex flex-col gap-3 px-3 pb-3 sm:px-4 sm:pb-4">
                      {g.items.map((s) => (
                        <SubmissionCard key={s._id} s={s} onStatusChange={handleStatusChange} />
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SubmissionCard({ s, showCourse = false, onStatusChange }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-primary-900">{s.name}</p>
          <p className="text-sm text-primary-900/60">
            {s.phone} {s.email && `· ${s.email}`}
          </p>
          {showCourse && s.courseInterested && (
            <p className="mt-1 text-xs text-primary-500">Quan tâm khóa học: {s.courseInterested.title}</p>
          )}
          {s.message && <p className="mt-2 text-sm text-primary-900/80">{s.message}</p>}
          <p className="mt-2 text-xs text-primary-900/40">{new Date(s.createdAt).toLocaleString("vi-VN")}</p>
        </div>
        <select
          value={s.status}
          onChange={(e) => onStatusChange(s._id, e.target.value)}
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
  );
}
