export default function TerminalFrame({ title, children, className = '' }) {
  return (
    <section className={`terminal-frame ${className}`}>
      {title && <h1 className="terminal-frame-title">{title}</h1>}
      {children}
    </section>
  );
}
