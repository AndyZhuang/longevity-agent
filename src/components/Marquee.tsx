import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  speed?: number; // pixels per second
  className?: string;
};

export default function Marquee({ children, speed = 40, className = "" }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    if (!trackRef.current) return;
    // First child is the "real" group; second is the duplicate.
    const first = trackRef.current.children[0] as HTMLElement | undefined;
    if (first) setContentWidth(first.scrollWidth);
  }, [children]);

  const duration = contentWidth / speed;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        ref={trackRef}
        className="flex w-max gap-12"
        style={{
          animation: contentWidth
            ? `marquee ${duration}s linear infinite`
            : undefined,
        }}
      >
        <div className="flex shrink-0 items-center gap-12">{children}</div>
        <div className="flex shrink-0 items-center gap-12" aria-hidden>
          {children}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
