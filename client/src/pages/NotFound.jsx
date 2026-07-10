import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
      <p className="font-display text-6xl font-extrabold text-primary-300">404</p>
      <p className="text-primary-900/60">Không tìm thấy trang bạn yêu cầu.</p>
      <Button as={Link} to="/">
        Về trang chủ
      </Button>
    </div>
  );
}
