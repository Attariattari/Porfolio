import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthContainer from "../login/AuthContainer";

export const metadata = {
  title: "Admin Onboarding",
  description: "Secure Registration for Muhyo Tech Control Center",
};

export default async function AdminSignupPage() {
    const session = await getAuthSession();

    // If session exists, redirect to dashboard
    if (session) {
        redirect("/admin/dashboard");
    }

    // Pass "setup" to initiate the signup flow
    return <AuthContainer defaultView="setup" />;
}
