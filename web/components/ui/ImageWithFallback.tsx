"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/** صورة بديلة موحّدة: أيقونة على خلفية بلون العلامة عند غياب الرابط أو فشل تحميله (onError) — لا مربع رمادي فارغ ولا أيقونة صورة مكسورة أبداً */
export function ImageWithFallback({
  src,
  alt,
  icon: Icon,
  className,
  iconClassName,
}: {
  src: string | null | undefined;
  alt: string;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={cn("flex items-center justify-center bg-primary-50", className)}>
        <Icon className={cn("size-6 text-primary-300", iconClassName)} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={cn("object-cover", className)} onError={() => setFailed(true)} />
  );
}
