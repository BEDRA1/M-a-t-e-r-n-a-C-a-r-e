import { BrandMark } from "@/components/ui/BrandMark";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <BrandMark className="size-7" />
          <span className="font-semibold text-foreground">Materna Care</span>
        </div>
        <p>© {new Date().getFullYear()} Materna Care. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}
