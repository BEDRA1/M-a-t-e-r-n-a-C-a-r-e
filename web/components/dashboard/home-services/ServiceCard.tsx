"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { homeServiceDisplayName } from "@/lib/format";
import type { HomeService } from "@/lib/types";
import { ServiceBookingForm } from "./ServiceBookingForm";

export function ServiceCard({ service }: { service: HomeService }) {
  const [showForm, setShowForm] = useState(false);
  const displayName = homeServiceDisplayName(service.name);

  return (
    <Card>
      <div className="aspect-video overflow-hidden rounded-xl">
        <ImageWithFallback
          src={service.imageUrl}
          alt={displayName}
          icon={Sparkles}
          className="size-full"
          iconClassName="size-9"
        />
      </div>

      <div className="mt-3">
        <Badge tone="neutral">{service.category}</Badge>
      </div>

      <p className="mt-3 font-bold text-foreground">{displayName}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{service.description}</p>

      {!showForm && (
        <Button className="mt-4 w-full" onClick={() => setShowForm(true)}>
          احجزي هذه الخدمة
        </Button>
      )}

      {showForm && (
        <ServiceBookingForm serviceId={service.id} price={service.basePrice} onDone={() => setShowForm(false)} />
      )}
    </Card>
  );
}
