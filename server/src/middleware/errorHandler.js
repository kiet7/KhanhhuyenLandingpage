export function notFound(req, res) {
  res.status(404).json({ message: `Không tìm thấy route: ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Đã có lỗi xảy ra ở server",
  });
}
