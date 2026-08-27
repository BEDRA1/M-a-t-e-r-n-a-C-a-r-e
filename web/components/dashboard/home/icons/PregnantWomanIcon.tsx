/** رسمة مبسّطة لامرأة حامل — مخطط وردي، لبانر الترحيب */
export function PregnantWomanIcon({ className }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="امرأة حامل">
      <svg viewBox="0 0 120 140" className="size-full">
        <circle cx="60" cy="80" r="52" fill="#FCE4EC" />
        <path d="M40 30c0-14 40-14 40 0v18c-8-6-32-6-40 0Z" fill="#F79FC4" />
        <circle cx="60" cy="34" r="13" fill="#F274AB" />
        <path
          d="M45 48c-10 6-16 20-14 42 2 20 10 34 29 34s27-14 29-34c2-22-4-36-14-42-6 10-24 10-30 0Z"
          fill="#ED4A93"
        />
        <circle cx="60" cy="88" r="22" fill="#F274AB" />
        <path d="M40 78c-6 6-6 18 0 24" fill="none" stroke="#F274AB" strokeWidth="7" strokeLinecap="round" />
        <path d="M80 78c6 6 6 18 0 24" fill="none" stroke="#F274AB" strokeWidth="7" strokeLinecap="round" />
      </svg>
    </div>
  );
}
