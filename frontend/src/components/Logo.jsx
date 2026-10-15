const Logo = ({ inverted = false }) => {
  const base = inverted ? "#FFFFFF" : "#172033";
  const needle = inverted ? "#172033" : "#FFFFFF";

  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill={base} />
        <path d="M16 5 L19.5 16 L16 27 L12.5 16 Z" fill={needle} />
        <path d="M16 5 L19.5 16 H12.5 Z" fill="#E8590C" />
        <circle cx="16" cy="16" r="2" fill={base} />
      </svg>
      <span className={`text-lg font-extrabold tracking-tight ${inverted ? "text-white" : "text-ink"}`}>
        Career Compass
      </span>
    </span>
  );
};

export default Logo;
