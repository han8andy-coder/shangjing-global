export default function Section({ children, className = "", id }) {
  return (
    <section id={id} className={`py-16 px-4 max-w-6xl mx-auto ${className}`}>
      {children}
    </section>
  );
}
