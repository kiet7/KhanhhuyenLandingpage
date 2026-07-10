import ContactSubmission from "../models/ContactSubmission.js";

export async function createSubmission(req, res) {
  const { name, phone, email, message, courseInterested } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ message: "Vui lòng nhập họ tên và số điện thoại" });
  }
  const submission = await ContactSubmission.create({
    name,
    phone,
    email,
    message,
    courseInterested: courseInterested || null,
  });
  res.status(201).json(submission);
}

export async function listSubmissions(req, res) {
  const submissions = await ContactSubmission.find()
    .populate("courseInterested", "title slug")
    .sort({ createdAt: -1 });
  res.json(submissions);
}

export async function updateSubmissionStatus(req, res) {
  const { status } = req.body;
  const submission = await ContactSubmission.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!submission) {
    return res.status(404).json({ message: "Không tìm thấy liên hệ" });
  }
  res.json(submission);
}
