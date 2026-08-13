import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import MailDashboardClient from "@/components/admin/MailDashboardClient";

export const metadata = {
  title: "System Mail Audit & Communications | Muhyo Tech Control Center",
  description: "Super Admin portal to monitor system emails, password resets, account setup notifications, and user access appeals.",
};

export default async function AdminMailsPage() {
  const session = await getAuthSession();

  if (!session || !["super-admin", "root-super-admin"].includes(session.role)) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <MailDashboardClient userSession={session} />
    </main>
  );
}
