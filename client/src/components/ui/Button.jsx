const variants = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/25",
  outline:
    "border-2 border-primary-400 text-primary-600 hover:bg-primary-50",
  ghost: "text-primary-600 hover:bg-primary-50",
  white: "bg-white text-primary-600 hover:bg-white/90 shadow-lg",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
