export function formatPrice(price) {
  if (!price) return "Liên hệ";
  return price.toLocaleString("vi-VN") + " đ";
}

export function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN");
}
