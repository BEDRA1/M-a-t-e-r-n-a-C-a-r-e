import Link from "next/link";
import { DoulaRobotIcon } from "./icons/DoulaRobotIcon";

export function HomeDoulaCard() {
  return (
    <div className="rounded-2xl bg-purple-50 p-3">
      <DoulaRobotIcon className="size-12" />
      <p className="mt-2 text-sm font-bold text-purple-700">الدولا الرقمية</p>
      <p className="mt-1 text-xs text-gray-500">مساعدتك الذكية على مدار الساعة</p>
      <Link
        href="/dashboard/doula"
        className="mt-2 block w-full rounded-full bg-emerald-500 py-2 text-center text-xs text-white"
      >
        تحدثي الآن
      </Link>
    </div>
  );
}
