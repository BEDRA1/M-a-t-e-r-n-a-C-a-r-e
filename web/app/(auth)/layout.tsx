import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { BrandName } from "@/components/ui/BrandName";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-background to-accent-50 px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <BrandMark className="size-10" />
        <BrandName className="text-xl" />
      </Link>
      <div className="w-full max-w-md lg:max-w-lg">{children}</div>
    </div>
  );
}
