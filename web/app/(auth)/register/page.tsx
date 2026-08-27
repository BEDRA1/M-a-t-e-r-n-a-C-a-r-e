import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "إنشاء حساب",
  description: "أنشئي حسابك في منصة Materna Care مجانًا وابدئي متابعة حملك خطوة بخطوة.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
