import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";

const HOUR_HEIGHT = 48; // px cho mỗi giờ trên lưới
const DEFAULT_START_HOUR = 7;
const DEFAULT_END_HOUR = 23;
const DEFAULT_SESSION_MINUTES = 90; // dùng khi buổi học chưa có giờ kết thúc
const MONTH_CHIPS_LIMIT = 3;

const WEEKDAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const WEEKDAY_LONG = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const VIEWS = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
];

// Mỗi khóa học 1 màu cố định (theo thứ tự trong danh sách) để dễ phân biệt giữa các ngày.
const COLORS = [
  "border-primary-500 bg-primary-100 text-primary-800",
  "border-accent-500 bg-accent-100 text-accent-800",
  "border-emerald-500 bg-emerald-100 text-emerald-800",
  "border-sky-500 bg-sky-100 text-sky-800",
  "border-violet-500 bg-violet-100 text-violet-800",
  "border-amber-500 bg-amber-100 text-amber-800",
];
const INACTIVE_COLOR = "border-gray-400 bg-gray-100 text-gray-500";

// ---- Helper ngày giờ (tính theo giờ địa phương) ----

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function startOfWeek(date) {
  const d = startOfDay(date);
  return addDays(d, -((d.getDay() + 6) % 7)); // tuần bắt đầu từ Thứ 2
}

function isSameDay(a, b) {
  return a.toDateString() === b.toDateString();
}

// Tuần theo năm dương lịch: tuần 1 là tuần (T2 - CN) chứa ngày 1/1.
// Tuần vắt qua năm mới (vd 29/12 - 04/01) tính là tuần 1 của năm mới.
function weekOfYear(date) {
  const weekStart = startOfWeek(date);
  const year = addDays(weekStart, 6).getFullYear();
  const firstWeekStart = startOfWeek(new Date(year, 0, 1));
  return Math.round((weekStart - firstWeekStart) / (7 * 86400000)) + 1;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatDay(date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

// startDate từ API là "YYYY-MM-DDT00:00:00.000Z" — lấy phần ngày để tránh lệch múi giờ.
function parseLocalDate(value) {
  const [y, m, d] = String(value).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toMinutes(time) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time || "");
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function hourLabel(hour) {
  const h = hour % 24;
  return { value: h % 12 === 0 ? 12 : h % 12, suffix: h < 12 ? "sa" : "ch" };
}

// ---- Dữ liệu lịch ----

function isCourseRunning(course, date) {
  if (!course.startDate) return true;
  const start = parseLocalDate(course.startDate);
  if (date < start) return false;
  if (!course.durationWeeks) return true;
  return date < addDays(start, course.durationWeeks * 7);
}

function eventsOnDate(courses, date) {
  const events = [];
  courses.forEach((course, index) => {
    if (!isCourseRunning(course, date)) return;
    const color = course.isActive ? COLORS[index % COLORS.length] : INACTIVE_COLOR;
    course.sessions
      .filter((s) => s.day === date.getDay())
      .forEach((session, i) => {
        const start = toMinutes(session.startTime);
        let end = toMinutes(session.endTime);
        if (start !== null && (end === null || end <= start)) end = start + DEFAULT_SESSION_MINUTES;
        events.push({
          key: `${course._id}-${i}`,
          course,
          session,
          color,
          allDay: start === null,
          start,
          end: end === null ? null : Math.min(end, 24 * 60),
        });
      });
  });
  return events.sort((a, b) => (a.start ?? -1) - (b.start ?? -1));
}

// Chia cột cho các buổi học trùng giờ trong cùng 1 ngày.
function layoutOverlaps(events) {
  const placed = [];
  let cluster = [];
  let clusterEnd = -1;
  const flush = () => {
    const cols = Math.max(...cluster.map((e) => e.col)) + 1;
    cluster.forEach((e) => (e.cols = cols));
    cluster = [];
  };
  for (const ev of events) {
    if (cluster.length && ev.start >= clusterEnd) flush();
    const used = cluster.filter((e) => e.end > ev.start).map((e) => e.col);
    let col = 0;
    while (used.includes(col)) col++;
    const item = { ...ev, col };
    cluster.push(item);
    placed.push(item);
    clusterEnd = Math.max(clusterEnd, ev.end);
  }
  if (cluster.length) flush();
  return placed;
}

function eventTitle(ev) {
  const time = ev.allDay ? "Chưa đặt giờ" : `${ev.session.startTime} - ${ev.session.endTime || "?"}`;
  return `${ev.course.title}\n${time}${ev.course.isActive ? "" : "\n(Đang ẩn)"}`;
}

// ---- Component ----

export default function CourseCalendar({ courses }) {
  const scheduled = useMemo(() => courses.filter((c) => c.sessions?.length > 0), [courses]);
  const [view, setView] = useState("week");
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
  const [show24h, setShow24h] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  function move(step) {
    if (view === "day") setAnchor(addDays(anchor, step));
    else if (view === "week") setAnchor(addDays(anchor, step * 7));
    else setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + step, 1));
  }

  function openDay(date) {
    setAnchor(date);
    setView("day");
  }

  const weekStart = startOfWeek(anchor);
  const weekEnd = addDays(weekStart, 6);
  let title;
  let rangeLabel;
  if (view === "day") {
    title = `Lịch dạy ${WEEKDAY_LONG[anchor.getDay()]}, ${formatDay(anchor)}`;
    rangeLabel = formatDay(anchor);
  } else if (view === "week") {
    rangeLabel = `${formatDay(weekStart)} - ${formatDay(weekEnd)}`;
    title = `Lịch dạy Tuần ${weekOfYear(weekStart)}: ${rangeLabel}`;
  } else {
    rangeLabel = `Tháng ${anchor.getMonth() + 1}/${anchor.getFullYear()}`;
    title = `Lịch dạy ${rangeLabel}`;
  }

  return (
    <Card className="overflow-hidden hover:shadow-sm">
      <div className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2.5 text-sm font-semibold text-white">
        <span aria-hidden>📅</span>
        {title}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-primary-100 bg-primary-50/60 px-3 py-2">
        <div className="flex items-center gap-1">
          <NavButton label="Trước" onClick={() => move(-1)}>‹</NavButton>
          <NavButton label="Sau" onClick={() => move(1)}>›</NavButton>
          <button
            type="button"
            onClick={() => setAnchor(startOfDay(new Date()))}
            className="ml-1 rounded-full px-3 py-1 text-sm text-primary-900/70 hover:bg-white"
          >
            Hôm nay
          </button>
        </div>
        <p className="flex-1 text-center text-base font-semibold text-primary-900">{rangeLabel}</p>
        <div className="flex gap-1">
          {VIEWS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => setView(v.value)}
              className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                view === v.value
                  ? "bg-primary-500 font-semibold text-white"
                  : "text-primary-900/70 hover:bg-white"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {scheduled.length === 0 ? (
        <p className="py-16 text-center text-sm text-primary-900/50">
          Chưa có khóa học nào được đăng ký lịch tuần.
        </p>
      ) : view === "month" ? (
        <MonthGrid courses={scheduled} anchor={anchor} today={now} onOpenDay={openDay} />
      ) : (
        <TimeGrid
          courses={scheduled}
          days={view === "day" ? [anchor] : Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))}
          now={now}
          show24h={show24h}
          onOpenDay={openDay}
        />
      )}

      {view !== "month" && scheduled.length > 0 && (
        <button
          type="button"
          onClick={() => setShow24h(!show24h)}
          className="w-full border-t border-primary-100 bg-primary-50/60 px-3 py-1.5 text-left text-xs text-primary-900/70 hover:bg-primary-50"
        >
          ↕ {show24h ? "Thu gọn lịch (7 giờ - 23 giờ)" : "Hiển thị Lịch 24 giờ"}
        </button>
      )}
    </Card>
  );
}

function NavButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-primary-200 bg-white text-lg leading-none text-primary-700 hover:bg-primary-100"
    >
      {children}
    </button>
  );
}

function TimeGrid({ courses, days, now, show24h, onOpenDay }) {
  const columns = days.map((date) => {
    const events = eventsOnDate(courses, date);
    return {
      date,
      allDay: events.filter((e) => e.allDay),
      timed: layoutOverlaps(events.filter((e) => !e.allDay)),
    };
  });

  // Mở rộng khung giờ nếu có buổi học nằm ngoài 7h - 23h để không bị mất.
  let startHour = 0;
  let endHour = 24;
  if (!show24h) {
    const timed = columns.flatMap((c) => c.timed);
    startHour = Math.min(DEFAULT_START_HOUR, ...timed.map((e) => Math.floor(e.start / 60)));
    endHour = Math.max(DEFAULT_END_HOUR, ...timed.map((e) => Math.ceil(e.end / 60)));
  }
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const gridStyle = { gridTemplateColumns: `60px repeat(${days.length}, minmax(0, 1fr))` };
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  function dayBackground(date) {
    if (isSameDay(date, now)) return "bg-cream-200/60";
    return date.getDay() === 0 || date.getDay() === 6 ? "bg-gray-50" : "";
  }

  return (
    <div className="overflow-x-auto">
      <div className={days.length > 1 ? "min-w-[720px]" : ""}>
        <div className="grid border-b border-primary-100 text-xs" style={gridStyle}>
          <div />
          {columns.map(({ date }) => (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onOpenDay(date)}
              className={`border-l border-primary-100 py-1.5 text-center hover:bg-primary-50 ${
                isSameDay(date, now) ? "font-bold text-primary-600" : "text-primary-900/70"
              } ${dayBackground(date)}`}
            >
              {WEEKDAY_SHORT[date.getDay()]}, {date.getDate()}
            </button>
          ))}
        </div>

        <div className="grid border-b border-primary-100 text-xs" style={gridStyle}>
          <div className="whitespace-nowrap px-1 py-1 text-right font-semibold text-primary-900/60">Cả ngày</div>
          {columns.map(({ date, allDay }) => (
            <div
              key={date.toISOString()}
              className={`flex min-h-6 flex-col gap-0.5 border-l border-primary-100 p-0.5 ${dayBackground(date)}`}
            >
              {allDay.map((ev) => (
                <EventLink key={ev.key} ev={ev} className="truncate px-1.5 py-0.5">
                  {ev.course.title}
                </EventLink>
              ))}
            </div>
          ))}
        </div>

        <div className="grid" style={gridStyle}>
          <div>
            {hours.map((h) => {
              const label = hourLabel(h);
              return (
                <div
                  key={h}
                  style={{ height: HOUR_HEIGHT }}
                  className="border-b border-primary-100 pr-1.5 text-right text-xs font-semibold text-primary-900/70"
                >
                  {label.value}
                  <sup className="ml-0.5 text-[10px] font-normal text-primary-600">{label.suffix}</sup>
                </div>
              );
            })}
          </div>

          {columns.map(({ date, timed }) => (
            <div
              key={date.toISOString()}
              className={`relative border-l border-primary-100 ${dayBackground(date)}`}
            >
              {hours.map((h) => (
                <div key={h} style={{ height: HOUR_HEIGHT }} className="border-b border-primary-100">
                  <div style={{ height: HOUR_HEIGHT / 2 }} className="border-b border-dashed border-primary-50" />
                </div>
              ))}

              {timed.map((ev) => {
                const top = ((ev.start - startHour * 60) / 60) * HOUR_HEIGHT;
                const height = Math.max(((ev.end - ev.start) / 60) * HOUR_HEIGHT - 2, 20);
                return (
                  <EventLink
                    key={ev.key}
                    ev={ev}
                    className="absolute overflow-hidden px-1.5 py-1 leading-tight"
                    style={{
                      top,
                      height,
                      left: `calc(${(ev.col / ev.cols) * 100}% + 2px)`,
                      width: `calc(${100 / ev.cols}% - 4px)`,
                    }}
                  >
                    <span className="block text-[11px] opacity-80">
                      {ev.session.startTime} - {ev.session.endTime || "?"}
                    </span>
                    <span className="block font-semibold">{ev.course.title}</span>
                  </EventLink>
                );
              })}

              {isSameDay(date, now) && nowMinutes >= startHour * 60 && nowMinutes <= endHour * 60 && (
                <div
                  className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-red-500"
                  style={{ top: ((nowMinutes - startHour * 60) / 60) * HOUR_HEIGHT }}
                >
                  <span className="absolute -left-1 -top-[5px] h-2 w-2 rounded-full bg-red-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthGrid({ courses, anchor, today, onOpenDay }) {
  const gridStart = startOfWeek(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[720px] grid-cols-7 text-xs">
        {[1, 2, 3, 4, 5, 6, 0].map((d) => (
          <div
            key={d}
            className="border-b border-l border-primary-100 py-1.5 text-center font-semibold text-primary-900/60 first:border-l-0"
          >
            {WEEKDAY_LONG[d]}
          </div>
        ))}
        {days.map((date, i) => {
          const events = eventsOnDate(courses, date);
          const inMonth = date.getMonth() === anchor.getMonth();
          const isToday = isSameDay(date, today);
          return (
            <div
              key={date.toISOString()}
              className={`flex min-h-24 flex-col gap-0.5 border-b border-primary-100 p-1 ${
                i % 7 ? "border-l" : ""
              } ${isToday ? "bg-cream-200/60" : inMonth ? "" : "bg-gray-50"}`}
            >
              <button
                type="button"
                onClick={() => onOpenDay(date)}
                className={`self-end rounded-full px-1.5 hover:bg-primary-100 ${
                  isToday
                    ? "bg-primary-500 font-bold text-white hover:bg-primary-600"
                    : inMonth
                      ? "text-primary-900/80"
                      : "text-primary-900/30"
                }`}
              >
                {date.getDate()}
              </button>
              {events.slice(0, MONTH_CHIPS_LIMIT).map((ev) => (
                <EventLink key={ev.key} ev={ev} className="truncate px-1 py-0.5">
                  {!ev.allDay && <span className="mr-1 opacity-80">{ev.session.startTime}</span>}
                  <span className="font-semibold">{ev.course.title}</span>
                </EventLink>
              ))}
              {events.length > MONTH_CHIPS_LIMIT && (
                <button
                  type="button"
                  onClick={() => onOpenDay(date)}
                  className="text-left text-primary-600 hover:underline"
                >
                  +{events.length - MONTH_CHIPS_LIMIT} khóa khác
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventLink({ ev, className = "", style, children }) {
  return (
    <Link
      to="/admin/khoa-hoc"
      title={eventTitle(ev)}
      style={style}
      className={`block rounded-md border-l-4 text-xs transition-opacity hover:opacity-80 ${ev.color} ${className}`}
    >
      {children}
    </Link>
  );
}
