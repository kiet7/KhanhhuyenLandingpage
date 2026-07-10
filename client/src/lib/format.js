export function formatPrice(price) {
  if (!price) return "Liên hệ";
  return price.toLocaleString("vi-VN") + " đ";
}
