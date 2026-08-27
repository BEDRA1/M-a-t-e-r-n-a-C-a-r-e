import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/get-current-user";
import { SpecialistNav } from "@/components/specialist/SpecialistNav";

export default async function SpecialistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/specialist");
  }
  if (user.role !== "specialist") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SpecialistNav user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}
