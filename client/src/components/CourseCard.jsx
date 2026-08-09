import { Link } from "react-router-dom";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import { formatPrice, formatDate } from "../lib/format";

export default function CourseCard({ course }) {
  return (
    <Card className="overflow-hidden">
      <Link to={`/khoa-hoc/${course.slug}`}>
        <div className="aspect-video w-full bg-linear-to-br from-primary-100 to-accent-100">
          {course.imageUrl && (
            <img src={course.imageUrl} alt={course.title} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="p-5">
          <Badge>{course.level}</Badge>
          <h3 className="mt-3 font-display text-lg font-bold text-primary-900">{course.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-primary-900/60">{course.shortDescription}</p>
          {course.schedule && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-primary-900/50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0">
                <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5V12l3 2" />
              </svg>
              {course.schedule}
            </p>
          )}
          {course.startDate && (
            <p className="mt-2 text-sm text-primary-900/50">Khai giảng {formatDate(course.startDate)}</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <p className="font-semibold text-accent-600">{formatPrice(course.price)}</p>
            <p className="text-xs text-primary-900/50">{course.durationWeeks} tuần</p>
          </div>
        </div>
      </Link>
    </Card>
  );
}
