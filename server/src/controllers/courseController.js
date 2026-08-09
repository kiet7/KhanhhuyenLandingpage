import Course from "../models/Course.js";

const DAY_LABELS = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function buildScheduleLabel(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) return "";
  const sorted = [...sessions].sort((a, b) => a.day - b.day);
  const groups = [];
  for (const s of sorted) {
    const key = `${s.startTime}|${s.endTime}`;
    const existing = groups.find((g) => g.key === key);
    if (existing) existing.days.push(s.day);
    else groups.push({ key, days: [s.day], startTime: s.startTime, endTime: s.endTime });
  }
  return groups
    .map((g) => {
      const daysLabel = g.days.map((d) => DAY_LABELS[d]).join(", ");
      return g.startTime && g.endTime ? `${daysLabel} · ${g.startTime} - ${g.endTime}` : daysLabel;
    })
    .join(" | ");
}

function applyScheduleLabel(data) {
  if (!data.schedule && data.sessions) {
    data.schedule = buildScheduleLabel(data.sessions);
  }
}

function normalizeStartDate(data) {
  if (data.startDate === "") {
    data.startDate = null;
  }
}

export async function listCourses(req, res) {
  const filter = req.query.all === "true" ? {} : { isActive: true };
  const courses = await Course.find(filter).sort({ order: 1, createdAt: -1 });
  res.json(courses);
}

export async function getCourseBySlug(req, res) {
  const course = await Course.findOne({ slug: req.params.slug });
  if (!course) {
    return res.status(404).json({ message: "Không tìm thấy khóa học" });
  }
  res.json(course);
}

export async function createCourse(req, res) {
  const data = { ...req.body };
  if (!data.slug) {
    data.slug = slugify(data.title);
  } else {
    data.slug = slugify(data.slug);
  }
  applyScheduleLabel(data);
  normalizeStartDate(data);
  const course = await Course.create(data);
  res.status(201).json(course);
}

export async function updateCourse(req, res) {
  const data = { ...req.body };
  if (data.slug) data.slug = slugify(data.slug);
  applyScheduleLabel(data);
  normalizeStartDate(data);
  const course = await Course.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!course) {
    return res.status(404).json({ message: "Không tìm thấy khóa học" });
  }
  res.json(course);
}

export async function deleteCourse(req, res) {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) {
    return res.status(404).json({ message: "Không tìm thấy khóa học" });
  }
  res.json({ message: "Đã xóa khóa học" });
}
