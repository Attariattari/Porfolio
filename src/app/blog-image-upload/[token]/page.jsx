import Link from "next/link";
import { ShieldCheck, AlertTriangle, Lock } from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import { validateBlogImageUploadToken } from "@/lib/server/blogImageUploadToken";
import UploadClient from "./UploadClient";

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

export default async function BlogImageUploadPage({ params }) {
  const { token } = await params;
  const tokenResult = await validateBlogImageUploadToken(token);

  if (!tokenResult.valid) {
    const expired = tokenResult.code === "EXPIRED";
    return (
      <Panel
        icon={<AlertTriangle className="h-6 w-6" />}
        title={expired ? "Secure Link Expired" : "Secure Link Unavailable"}
      >
        <p className="leading-7">
          {expired
            ? "This secure upload link has expired. Please log in to the admin dashboard to upload the blog image or generate a new secure link."
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
  const callbackUrl = `/blog-image-upload/${token}`;

  if (!session) {
    return (
      <Panel icon={<Lock className="h-6 w-6" />} title="Super Admin Login Required">
        <p className="leading-7">
          This upload page is connected to one blog only. Please log in as Super Admin to continue.
        </p>
        <Link
          href={`/admin/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="mt-6 inline-flex rounded-2xl bg-accent px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-accent-foreground"
        >
          Login and Return
        </Link>
      </Panel>
    );
  }

  const isSuperAdmin =
    session.role === "super-admin" || session.role === "root-super-admin";
  const emailMatches =
    !tokenResult.link.targetEmail ||
    session.email?.toLowerCase() === tokenResult.link.targetEmail.toLowerCase();

  if (!isSuperAdmin || !emailMatches) {
    return (
      <Panel icon={<ShieldCheck className="h-6 w-6" />} title="Access Restricted">
        <p className="leading-7">
          This secure upload link can only be used by the Super Admin email it was issued to.
        </p>
      </Panel>
    );
  }

  const blog = tokenResult.blog;

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground transition-colors">
      <section className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-2xl md:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-accent">
              Secure Blog Image Upload
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight">
              {blog.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              {blog.summary}
            </p>
          </div>
          <Link
            href={`/admin/blogs`}
            className="rounded-2xl border border-border px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-card-foreground transition-colors hover:border-accent/50 hover:bg-accent/10"
          >
            Open Review
          </Link>
        </div>

        <UploadClient
          token={token}
          imagePrompt={blog.imagePrompt || blog.image_prompt || ""}
          negativePrompt={blog.imageNegativePrompt || ""}
        />

        <p className="mt-6 rounded-2xl border border-border bg-muted/50 p-4 text-xs leading-6 text-muted-foreground">
          Security note: this link is one-time use, tied to this blog, and expires automatically.
        </p>
      </section>
    </main>
  );
}

