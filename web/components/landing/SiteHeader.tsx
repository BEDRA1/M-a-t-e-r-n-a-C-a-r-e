import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { BrandMark } from "@/components/ui/BrandMark";
import { BrandName } from "@/components/ui/BrandName";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark className="size-9" />
          <BrandName className="text-lg" />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-foreground/80 sm:flex">
          <a
            href="#features"
            className="relative pb-1 transition-colors duration-200 hover:text-primary-600 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:bg-primary-500 after:transition-transform after:duration-300 hover:after:scale-x-100"
          >
            الخدمات
          </a>
          <a
            href="#how-it-works"
            className="relative pb-1 transition-colors duration-200 hover:text-primary-600 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:bg-primary-500 after:transition-transform after:duration-300 hover:after:scale-x-100"
          >
            كيف تعمل المنصة
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="transition-transform duration-200 hover:scale-105 active:scale-100"
            >
              تسجيل الدخول
            </Button>
          </Link>
          <Link href="/register">
            <Button
              variant="primary"
              size="sm"
              className="transition-transform duration-200 hover:scale-105 hover:shadow-lg active:scale-100"
            >
              إنشاء حساب
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
