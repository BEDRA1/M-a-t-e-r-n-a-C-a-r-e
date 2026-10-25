import type { UserRole } from "./types";

/** الصفحة الرئيسية لكل دور بعد تسجيل الدخول */
export function homePathForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "specialist":
      return "/specialist";
    default:
      return "/dashboard";
  }
}

function isUnder(path: string, base: string): boolean {
  return path === base || path.startsWith(`${base}/`) || path.startsWith(`${base}?`);
}

/**
 * وجهة ما بعد الدخول: ?redirect= الصريح له الأولوية، إلا في ثلاث حالات يُتجاهَل فيها لصالح
 * صفحة الدور:
 * - ليس مسارًا داخليًا (يمنع open redirect مثل //evil.com أو https://...)
 * - "/dashboard" المجرّد — هذه قيمة افتراضية يضعها dashboard/layout وproxy عند انتهاء الجلسة،
 *   لا نية صريحة، وإلا لن يصل الأدمن/الأخصائي إلى لوحته أبدًا بعد أي جلسة منتهية
 * - منطقة لا يملك الدور صلاحيتها (/admin لغير الأدمن، /specialist لغير الأخصائي) — كان سيرتد على أي حال
 */
export function resolvePostLoginPath(role: UserRole, redirectParam: string | null): string {
  const home = homePathForRole(role);
  if (!redirectParam || !redirectParam.startsWith("/") || redirectParam.startsWith("//")) {
    return home;
  }
  if (redirectParam === "/dashboard" || redirectParam === "/dashboard/") {
    return home;
  }
  if (isUnder(redirectParam, "/admin") && role !== "admin") {
    return home;
  }
  if (isUnder(redirectParam, "/specialist") && role !== "specialist") {
    return home;
  }
  return redirectParam;
}
