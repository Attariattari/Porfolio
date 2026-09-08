import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import { validateServiceImageUploadToken } from "@/lib/server/serviceImageUploadToken";
import ServiceUploadClient from "./ServiceUploadClient";

export const dynamic = "force-dynamic";

function Panel({ icon, title, children }) {
  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground transition-colors">
      <section className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 text-card-foreground shadow-2xl">
        <div className="mb-5 inline-flex rounded-2xl bg-accent/10 p-3 text-accent">
          {icon}
        </div>
        <h1 className="text-3xl font-black tracking-tight">{title}</h1>
        <div className="mt-5 text-muted-foreground">{children}</div>
      </section>
    </main>
  );
}

export default async function ServiceImageUploadPage({ params }) {
  const { token } = await params;
  const tokenResult = await validateServiceImageUploadToken(token);

  if (!tokenResult.valid) {
    const expired = tokenResult.code === "EXPIRED";
    return (
      <Panel
        icon={<AlertTriangle className="h-6 w-6" />}
        title={expired ? "Secure Upload Link Expired" : "Secure Link Unavailable"}
      >
        <p className="leading-7">
          {expired
            ? "This secure service upload link has expired. Please log in to the admin dashboard to upload the service image or generate a new prompt."
            : "This secure upload link is invalid, used, or revoked."}
        </p>
        <Link
          href="/admin/login"
          className="mt-6 inline-flex rounded-2xl bg-accent px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-accent-foreground"
        >
          Admin Login
        </Link>
      </Panel>
    );
  }

  const session = await getAuthSession();
  const callbackUrl = `/service-image-upload/${token}`;

  // If no session exists, seamlessly redirect to login with the callbackUrl attached
  if (!session) {
    redirect(`/admin/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const isSuperAdminRole =
    session.role === "super-admin" ||
    session.role === "root-super-admin";
  const isAuthorizedAdmin =
    isSuperAdminRole ||
    session.role === "admin";
  const emailMatches =
    !tokenResult.link?.targetEmail ||
    isSuperAdminRole ||
    session.email?.toLowerCase() === tokenResult.link?.targetEmail?.toLowerCase();

  if (!isAuthorizedAdmin || !emailMatches) {
    return (
      <Panel icon={<ShieldCheck className="h-6 w-6" />} title="Access Restricted">
        <p className="leading-7">
          This secure upload link can only be used by authorized Muhyo Tech admin personnel it was issued to.
        </p>
      </Panel>
    );
  }

  const service = tokenResult.service;

  const promptCandidates = [service.imagePrompt, service.imagePromptEnhanced].filter(Boolean);
  const fullImagePrompt = promptCandidates.sort((a, b) => b.length - a.length)[0] || "";

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground transition-colors">
      <section className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-2xl md:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-accent">
              Secure Service Image Upload & 4K Studio
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight">
              {service.title}
            </h1>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Category: {service.category || "Web Development"}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              {service.shortDescription || service.overview}
            </p>
          </div>
          <Link
            href={`/admin/services`}
            className="rounded-2xl border border-border px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-card-foreground transition-colors hover:border-accent/50 hover:bg-accent/10"
          >
            All Services
          </Link>
        </div>

        <ServiceUploadClient
          token={token}
          serviceId={service._id?.toString()}
          serviceTitle={service.title}
          serviceSlug={service.slug}
          serviceCategory={service.category}
          imagePrompt={fullImagePrompt}
          negativePrompt={service.imageNegativePrompt || ""}
          initialImage={service.heroImage || service.banner || service.image || ""}
          currentServiceImage={service.heroImage || service.banner || service.image || ""}
          isAlreadyUploaded={Boolean(tokenResult.isUsed || tokenResult.link?.status === "used")}
        />

        <p className="mt-6 rounded-2xl border border-border bg-muted/50 p-4 text-xs leading-6 text-muted-foreground">
          Security note: this upload link is tokenized, tied directly to this service, and expires automatically.
        </p>
      </section>
    </main>
  );
}
