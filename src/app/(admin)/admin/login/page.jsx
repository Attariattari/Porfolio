import { getAuthSession, getDefaultAuthRedirect } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthContainer from "./AuthContainer";

export const metadata = {
  title: "Admin Login",
  description: "Secure Access to Muhyo Tech Control Center",
};

export default async function AdminLoginPage({ searchParams }) {
    const resolvedSearchParams = await searchParams;
    const rawCallbackUrl = resolvedSearchParams?.callbackUrl || "/admin/dashboard";
    const callbackUrl = getDefaultAuthRedirect(null, rawCallbackUrl);
    const session = await getAuthSession();

    // If session exists and is valid, redirect to the secure dashboard
    if (session) {
        redirect(callbackUrl);
    }

    // Otherwise, present the secure authorization gateway
    return (
        <AuthContainer
            callbackUrl={callbackUrl}
            googleLinkToken={resolvedSearchParams?.linkToken || ""}
            googleLinkEmail={resolvedSearchParams?.oauthEmail || ""}
            googleError={resolvedSearchParams?.googleError || ""}
        />
    );
}
