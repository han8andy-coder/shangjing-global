export default function Button({ children, href, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-dark focus:ring-brand",
    outline: "border-2 border-brand text-brand hover:bg-brand-light focus:ring-brand",
    accent: "bg-accent text-white hover:bg-accent-dark focus:ring-accent",
  };
  const cls = `${base} ${variants[variant] ?? variants.primary} ${className}`;
  if (href) {
    return <a href={href} className={cls} {...props}>{children}</a>;
  }
  return <button className={cls} {...props}>{children}</button>;
}
