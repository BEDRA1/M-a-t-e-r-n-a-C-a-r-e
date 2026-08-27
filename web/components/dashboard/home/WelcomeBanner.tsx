import Link from "next/link";
import { Heart } from "lucide-react";
import { PregnantWomanIcon } from "./icons/PregnantWomanIcon";

export function WelcomeBanner() {
  return (
    <div className="mx-4 mt-4 rounded-2xl bg-white p-4">
      <div className="flex items-center gap-4">
        {/* النص أولًا في DOM كي يظهر يمينًا تحت RTL (أول عنصر flex = أقصى اليمين)، والرسمة
            بعده لتظهر يسارًا — مطابقةً لموضعي "يمين: نص" و"يسار: SVG" في المرجع */}
        <div className="min-w-0 flex-1 text-start">
          <p className="flex items-center gap-1.5 text-xl font-bold text-foreground">
            <Heart className="size-4 shrink-0 fill-primary-500 text-primary-500" strokeWidth={0} />
            نحن معك في كل خطوة
          </p>
          <p className="mt-1 text-sm text-gray-500">من الحمل حتى أول سنتين</p>
          <Link
            href="/dashboard/pregnancy-calculator"
            className="mt-3 inline-block rounded-full bg-primary-500 px-4 py-2 text-sm text-white"
          >
            استكشفي المزيد
          </Link>
        </div>
        <PregnantWomanIcon className="size-24 shrink-0" />
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden="true">
        <div className="size-2 rounded-full bg-primary-500" />
        <div className="size-2 rounded-full bg-gray-200" />
        <div className="size-2 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}
