export default function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-3xl bg-white shadow-sm shadow-primary-900/5 ring-1 ring-primary-900/5 transition-shadow duration-200 hover:shadow-lg hover:shadow-primary-500/10 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
