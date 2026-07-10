import Course from "../models/Course.js";

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
  const course = await Course.create(data);
  res.status(201).json(course);
}

export async function updateCourse(req, res) {
  const data = { ...req.body };
  if (data.slug) data.slug = slugify(data.slug);
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
