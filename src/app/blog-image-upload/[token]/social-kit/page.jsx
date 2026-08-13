import Link from "next/link";
import { ShieldCheck, AlertTriangle, Lock } from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import { validateBlogImageUploadToken } from "@/lib/server/blogImageUploadToken";
import { Blog } from "@/models/Portfolio";
import dbConnect from "@/lib/dbConnect";
import SocialKitPageClient from "./SocialKitPageClient";

export const dynamic = "force-dynamic";

function Panel({ icon, title, children }) {
  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground">
      <section className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 text-card-foreground shadow-2xl">
        <div className="mb-5 inline-flex rounded-2xl bg-accent/10 p-3 text-accent">{icon}</div>
        <h1 className="text-3xl font-black tracking-tight">{title}</h1>
        <div className="mt-5 text-muted-foreground">{children}</div>
      </section>
    </main>
  );
}

export default async function SocialKitPage({ params }) {
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
            ? "This secure upload link has expired."
            : "This secure upload link is invalid or revoked."}
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
  const callbackUrl = `/blog-image-upload/${token}/social-kit`;

  if (!session) {
    return (
      <Panel icon={<Lock className="h-6 w-6" />} title="Admin Login Required">
        <p className="leading-7">
          Please log in as Admin to access the Social Share Kit.
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

  const isAuthorizedAdmin =
    session.role === "admin" ||
    session.role === "super-admin" ||
    session.role === "root-super-admin";
  const emailMatches =
    !tokenResult.link.targetEmail ||
    session.role === "root-super-admin" ||
    session.email?.toLowerCase() === tokenResult.link.targetEmail.toLowerCase();

  if (!isAuthorizedAdmin || !emailMatches) {
    return (
      <Panel icon={<ShieldCheck className="h-6 w-6" />} title="Access Restricted">
        <p className="leading-7">
          This secure link can only be used by the authorized Admin it was issued to.
        </p>
      </Panel>
    );
  }

  await dbConnect();
  const blog = await Blog.findById(tokenResult.blog._id).lean();

  if (!blog) {
    return (
      <Panel icon={<AlertTriangle className="h-6 w-6" />} title="Blog Not Found">
        <p className="leading-7">The blog linked to this token could not be found.</p>
      </Panel>
    );
  }

  // Serialize for client
  const serializedBlog = JSON.parse(JSON.stringify(blog));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SocialKitPageClient
        token={token}
        blog={serializedBlog}
      />
    </main>
  );
}
