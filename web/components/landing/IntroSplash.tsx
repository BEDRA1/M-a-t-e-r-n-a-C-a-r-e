"use client";

import { useState } from "react";

export function IntroSplash() {
  const [visible, setVisible] = useState(true);

  const handleEnd = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <video
        src="/videos/hero-intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleEnd}
        onClick={handleEnd}
        className="h-full w-full object-cover"
      />
      {/* زر تخطي */}
      <button
        onClick={handleEnd}
        className="absolute top-4 left-4 rounded-full bg-black/40 px-4 py-2 text-sm text-white"
      >
        تخطي ←
      </button>
    </div>
  );
}
