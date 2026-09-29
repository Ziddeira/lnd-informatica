import type { Metadata } from "next";
import AdminPanel from "@/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Painel de contatos",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPanel />;
}
