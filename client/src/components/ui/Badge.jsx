const styles = {
  "Sơ cấp": "bg-accent-100 text-accent-700",
  "Trung cấp": "bg-primary-100 text-primary-700",
  "Cao cấp": "bg-primary-500/15 text-primary-800",
};

export default function Badge({ children, className = "" }) {
  const style = styles[children] || "bg-primary-100 text-primary-700";
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${style} ${className}`}
    >
      {children}
    </span>
  );
}
