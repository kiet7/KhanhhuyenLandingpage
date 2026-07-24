import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";

const DAY_COLUMNS = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 0, label: "Chủ Nhật" },
];

export default function CourseCalendar({ courses }) {
  const scheduled = courses.filter((c) => c.sessions?.length > 0);

  const timeSlots = [
    ...new Set(scheduled.flatMap((c) => c.sessions.map((s) => s.startTime || "?"))),
  ].sort();

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-x-auto p-4">
        {timeSlots.length === 0 ? (
          <p className="py-8 text-center text-sm text-primary-900/50">
            Chưa có khóa học nào được đăng ký lịch tuần.
          </p>
        ) : (
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-20 border-b border-primary-100 p-2 text-left text-xs font-semibold text-primary-900/50">
                  Giờ
                </th>
                {DAY_COLUMNS.map((day) => (
                  <th
                    key={day.value}
                    className="border-b border-primary-100 p-2 text-left text-xs font-semibold text-primary-900/50"
                  >
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot) => (
                <tr key={slot}>
                  <td className="border-b border-primary-50 p-2 align-top text-xs font-semibold text-primary-900/60">
                    {slot === "?" ? "Chưa đặt" : slot}
                  </td>
                  {DAY_COLUMNS.map((day) => {
                    const matches = scheduled
                      .map((c) => ({
                        course: c,
                        session: c.sessions.find(
                          (s) => s.day === day.value && (s.startTime || "?") === slot
                        ),
                      }))
                      .filter((m) => m.session);
                    return (
                      <td key={day.value} className="border-b border-primary-50 p-2 align-top">
                        <div className="flex flex-col gap-1">
                          {matches.map(({ course: c, session }) => (
                            <Link
                              key={c._id}
                              to="/admin/khoa-hoc"
                              title={`${c.title}${session.endTime ? ` (đến ${session.endTime})` : ""}`}
                              className={`truncate rounded-lg px-2 py-1 text-xs font-semibold ${
                                c.isActive
                                  ? "bg-primary-100 text-primary-700 hover:bg-primary-200"
                                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                              }`}
                            >
                              {c.title}
                            </Link>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
