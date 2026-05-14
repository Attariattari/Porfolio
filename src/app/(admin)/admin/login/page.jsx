import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthContainer from "./AuthContainer";

export const metadata = {
  title: "Admin Login",
  description: "Secure Access to Muhyo Tech Control Center",
};

export default async function AdminLoginPage() {
    const session = await getAuthSession();

    // If session exists and is valid, redirect to the secure dashboard
    if (session) {
        redirect("/admin/dashboard");
    }

    // Otherwise, present the secure authorization gateway
    return <AuthContainer />;
}
