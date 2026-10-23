/** شارة عدد الإشعارات غير المقروءة — توضع داخل عنصر بـposition: relative فوق أيقونة الجرس.
 * لا تُعرَض إطلاقًا عند 0، وتُقصَر على "9+" لأي عدد أكبر من 9 */
export function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className="absolute -top-1 -end-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}
