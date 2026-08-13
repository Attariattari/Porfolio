"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Facebook,
  FileText,
  ImageIcon,
  Instagram,
  Linkedin,
  Loader2,
  MessagesSquare,
  RefreshCw,
  Send,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { getSafeImageSrc } from "@/lib/images/getSafeImageSrc";

const platforms = [
  { key: "linkedin",  label: "LinkedIn",  Icon: Linkedin,       tone: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
  { key: "facebook",  label: "Facebook",  Icon: Facebook,       tone: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { key: "x",         label: "X",         Icon: X,              tone: "text-foreground bg-foreground/5 border-border" },
  { key: "whatsapp",  label: "WhatsApp",  Icon: Send,           tone: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  { key: "reddit",    label: "Reddit",    Icon: MessagesSquare, tone: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  { key: "instagram", label: "Instagram", Icon: Instagram,      tone: "text-pink-500 bg-pink-500/10 border-pink-500/20" },
  { key: "devto",     label: "Dev.to",    Icon: FileText,       tone: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
];

const emptyPosts = { linkedin: "", facebook: "", x: "", whatsapp: "", reddit: "", instagram: "", devto: "" };

function ActionButton({ onClick, disabled, icon: Icon, children, spinning = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-[10px] font-bold text-foreground transition hover:bg-muted disabled:opacity-40"
    >
      <Icon className={`size-3.5 ${spinning ? "animate-spin" : ""}`} />
      {children}
    </button>
  );
}

function SectionLabel({ children }) {
  return <p className="text-[9px] font-black uppercase tracking-[.18em] text-muted-foreground">{children}</p>;
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <Icon className="size-3.5 text-accent" />
      <p className="mt-2 text-[8px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-[10px] font-bold capitalize text-foreground">{value}</p>
    </div>
  );
}

export default function SocialKitPageClient({ token, blog: initialBlog }) {
  const [blog, setBlog] = useState(initialBlog);
  const [active, setActive] = useState("linkedin");
  const [posts, setPosts] = useState(() => ({ ...emptyPosts, ...(initialBlog?.socialKit || {}) }));
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [kitLoaded, setKitLoaded] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  // Auto-load social kit from token API if not yet available
  useEffect(() => {
    const hasSomeContent = platforms.some(({ key }) => posts[key]?.trim());
    if (hasSomeContent) { setKitLoaded(true); return; }
    (async () => {
      setGenerating(true);
      try {
        const res = await fetch(`/api/blog-image-upload/${token}/social-kit`);
        const data = await res.json();
        if (data.success && data.socialKit) {
          setPosts((p) => ({ ...emptyPosts, ...p, ...data.socialKit }));
          setKitLoaded(true);
        }
      } catch {
        // Silent — user can manually regenerate
      } finally {
        setGenerating(false);
        setKitLoaded(true);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPlatform = platforms.find(({ key }) => key === active) || platforms[0];
  const SelectedIcon = selectedPlatform.Icon;
  const imageUrl = blog?.socialKit?.imageUrl || blog?.featuredImage?.url || blog?.image || "";
  const blogUrl = useMemo(
    () => (blog?.slug ? `${typeof window !== "undefined" ? window.location.origin : "https://www.muhyotech.com"}/blog/${blog.slug}` : ""),
    [blog?.slug]
  );
  const readyCount = platforms.filter(({ key }) => Boolean(posts[key]?.trim())).length;
  const missingPlatforms = platforms.filter(({ key }) => !posts[key]?.trim()).map(({ key }) => key);
  const allReady = readyCount === platforms.length;

  const downloadCoverPhoto = async () => {
    if (!imageUrl) return showToast("No image available to download.", "error");
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${blog.slug || "muhyo-tech-blog"}-instagram-cover.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
      showToast("Cover image downloaded! Ready for Instagram.");
    } catch {
      window.open(imageUrl, "_blank");
      showToast("Opening cover image in new tab.");
    }
  };

  const copyPost = async () => {
    await navigator.clipboard.writeText(posts[active]);
    showToast(`${selectedPlatform.label} post copied.`);
  };

  const platformUrl = () => {
    if (active === "linkedin") return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(blogUrl)}`;
    if (active === "facebook") return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogUrl)}`;
    if (active === "x") return `https://twitter.com/intent/tweet?text=${encodeURIComponent(posts.x)}`;
    if (active === "whatsapp") return `https://api.whatsapp.com/send?text=${encodeURIComponent(posts.whatsapp || blogUrl)}`;
    if (active === "reddit") return `https://www.reddit.com/submit?url=${encodeURIComponent(blogUrl)}&title=${encodeURIComponent(blog.title)}`;
    if (active === "devto") return "https://dev.to/new";
    return "https://www.instagram.com/create/select/";
  };

  const copyAndOpen = async () => {
    await copyPost();
    if (active === "instagram") await downloadCoverPhoto();
    window.open(platformUrl(), "_blank", "noopener,noreferrer");
  };

  const nativeShare = async () => {
    if (!navigator.share) return showToast("Native sharing not supported in this browser.", "error");
    const shareData = { title: blog.title, text: posts[active], url: blogUrl };
    try {
      if (imageUrl) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `${blog.slug || "muhyo-tech-blog"}.jpg`, { type: blob.type || "image/jpeg" });
        if (navigator.canShare?.({ files: [file] })) shareData.files = [file];
      }
      await navigator.share(shareData);
    } catch (error) {
      if (error.name !== "AbortError") showToast("Use Copy & Open if the platform cannot accept the full package.", "error");
    }
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`/api/blog-image-upload/${token}/social-kit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || result.message || "Could not generate social posts.");
      const newKit = result.data || result.socialKit || {};
      setPosts((current) => ({ ...emptyPosts, ...current, ...newKit }));
      showToast("Social kit generated successfully.");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/blog-image-upload/${token}/social-kit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(posts),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Could not save social posts.");
      setPosts((current) => ({ ...emptyPosts, ...current, ...(result.data || {}) }));
      showToast("Social Share Kit saved.");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-2xl border px-5 py-3 text-xs font-bold shadow-2xl transition-all ${toast.type === "error" ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border/70 bg-card px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/blog-image-upload/${token}`}
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-background text-muted-foreground transition hover:text-foreground"
            aria-label="Back to upload"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
            <Share2 className="size-4" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[9px] font-black uppercase tracking-[.2em] text-accent">Social publishing studio</p>
              <span className={`rounded-full px-2 py-1 text-[8px] font-black uppercase ${allReady ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                {readyCount}/{platforms.length} ready
              </span>
            </div>
            <h1 className="mt-1 truncate text-base font-black tracking-tight text-foreground sm:text-xl">
              Social Share Kit
            </h1>
            <p className="mt-0.5 max-w-[65vw] truncate text-[10px] text-muted-foreground sm:text-xs">{blog.title}</p>
          </div>
        </div>
        {blog?.slug && (
          <a
            href={`/blog/${blog.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-accent hover:bg-accent/10 transition-all"
          >
            <ExternalLink className="size-4" /> View Blog
          </a>
        )}
      </header>

      {/* Body */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Left sidebar */}
        <aside className="hidden min-h-0 overflow-y-auto border-r border-border/70 bg-card/45 p-5 lg:block">
          <SectionLabel>Campaign asset</SectionLabel>
          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
            <div className="relative aspect-video bg-muted/30">
              {imageUrl
                ? <Image src={getSafeImageSrc(imageUrl)} alt={blog.featuredImage?.alt || `${blog.title} social image`} fill sizes="320px" className="object-cover" />
                : <div className="grid size-full place-items-center"><ImageIcon className="size-8 text-muted-foreground/40" /></div>}
            </div>
            <div className="border-t border-border/70 p-3">
              <p className="line-clamp-2 text-xs font-bold leading-5 text-foreground">{blog.title}</p>
              {imageUrl && (
                <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-border text-[10px] font-bold text-muted-foreground hover:text-foreground">
                  <Download className="size-3.5" />Open visual
                </a>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-accent/10 text-accent"><Sparkles className="size-4" /></span>
              <div>
                <p className="text-xs font-bold text-foreground">Creative direction</p>
                <p className="text-[9px] text-muted-foreground">Guide the next generation</p>
              </div>
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder="Example: founder-focused, clearer technical lesson…"
              className="mt-4 h-24 w-full resize-none overflow-y-auto rounded-xl border border-border bg-card p-3 text-xs leading-5 text-foreground outline-none placeholder:text-muted-foreground focus:border-accent"
            />
            <button
              onClick={generate}
              disabled={generating}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-accent text-xs font-bold text-accent-foreground shadow-lg shadow-accent/15 disabled:opacity-50"
            >
              {generating ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              {missingPlatforms.length ? `Generate ${missingPlatforms.length} missing` : "Regenerate all"}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <InfoCard icon={FileText} label="Article" value={blog.articleType || "Standard"} />
            <InfoCard icon={CheckCircle2} label="Source" value={blog.socialKit?.source || "Pending"} />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex min-h-0 flex-col bg-background">
          {/* Mobile generate bar */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-card/40 px-4 py-3 lg:hidden">
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-accent">Kit controls</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {missingPlatforms.length ? `${missingPlatforms.length} missing post${missingPlatforms.length === 1 ? "" : "s"}` : "All platforms ready"}
              </p>
            </div>
            <button
              onClick={generate}
              disabled={generating}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-accent px-3 text-[10px] font-bold text-accent-foreground disabled:opacity-50"
            >
              {generating ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              {missingPlatforms.length ? "Generate missing" : "Regenerate"}
            </button>
          </div>

          {/* Platform tabs */}
          <nav className="flex shrink-0 gap-2 overflow-x-auto border-b border-border/70 bg-card/25 px-4 py-3 sm:px-5">
            {platforms.map(({ key, label, Icon, tone }) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-[10px] font-bold transition ${active === key ? tone : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"}`}
              >
                <Icon className="size-3.5" />{label}
                {posts[key] && <CheckCircle2 className="size-3 text-emerald-400" />}
              </button>
            ))}
          </nav>

          {/* Editor + Preview */}
          <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="flex min-h-0 flex-col p-4 sm:p-5">
              <div className="mb-3 flex shrink-0 items-end justify-between gap-4">
                <div>
                  <SectionLabel>Post editor</SectionLabel>
                  <h3 className="mt-1 text-sm font-black text-foreground">{selectedPlatform.label} copy</h3>
                </div>
                <span className={`rounded-lg border px-2 py-1 text-[9px] font-bold ${active === "x" && (posts.x.length < 270 || posts.x.length > 280) ? "border-red-500/30 bg-red-500/10 text-red-400" : "border-border text-muted-foreground"}`}>
                  {posts[active].length}{active === "x" ? "/280" : " chars"}
                </span>
              </div>

              {active === "instagram" && (
                <div className="mb-3 rounded-xl border border-pink-500/30 bg-pink-500/10 p-3 text-xs text-pink-300">
                  <p className="font-bold flex items-center gap-1.5 text-pink-400">📸 Instagram 3-Step Pro Publisher:</p>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-[11px] sm:grid-cols-3">
                    <div className="rounded-lg border border-pink-500/20 bg-background/50 p-2"><strong className="text-pink-300">1. Download Image:</strong> Click "Download Cover Image" below.</div>
                    <div className="rounded-lg border border-pink-500/20 bg-background/50 p-2"><strong className="text-pink-300">2. Copy Caption:</strong> Copies formatted post text & hashtags.</div>
                    <div className="rounded-lg border border-pink-500/20 bg-background/50 p-2"><strong className="text-pink-300">3. Create Post:</strong> Upload image & paste caption!</div>
                  </div>
                </div>
              )}

              {generating && !kitLoaded ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  <p className="text-sm font-bold text-foreground">Generating AI Social Share Kit...</p>
                  <p className="text-xs text-muted-foreground">Writing 1-click captions for LinkedIn, X, Facebook & Dev.to</p>
                </div>
              ) : (
                <textarea
                  value={posts[active]}
                  onChange={(e) => setPosts((p) => ({ ...p, [active]: e.target.value }))}
                  placeholder="Generate this platform post to begin editing."
                  className="h-[42dvh] min-h-64 w-full flex-1 resize-none overflow-y-auto rounded-2xl border border-border bg-card p-4 text-sm leading-7 text-foreground shadow-inner outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/5 md:h-auto"
                />
              )}
            </div>

            {/* Live preview */}
            <aside className="hidden min-h-0 overflow-y-auto border-l border-border/70 bg-card/35 p-5 xl:block">
              <SectionLabel>Live preview</SectionLabel>
              <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
                <div className="flex items-center gap-3 border-b border-border/70 p-4">
                  <span className={`grid size-9 place-items-center rounded-full border ${selectedPlatform.tone}`}>
                    <SelectedIcon className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-foreground">Muhyo Tech</p>
                    <p className="text-[9px] text-muted-foreground">Prepared for {selectedPlatform.label}</p>
                  </div>
                </div>
                <p className="max-h-72 overflow-y-auto whitespace-pre-wrap p-4 text-[11px] leading-5 text-muted-foreground">
                  {posts[active] || "Your generated post preview will appear here."}
                </p>
                {imageUrl && (
                  <div className="relative aspect-video border-t border-border/70">
                    <Image src={getSafeImageSrc(imageUrl)} alt="" fill sizes="300px" className="object-cover" />
                  </div>
                )}
              </div>
              <p className="mt-3 rounded-xl border border-border bg-background p-3 text-[10px] leading-5 text-muted-foreground">
                {active === "instagram"
                  ? "Instagram requires uploading an image file. Click Download Cover Image to get the file, then paste caption."
                  : "Copy & Open copies the final text first before redirecting to platform share screen."}
              </p>
            </aside>
          </div>

          {/* Footer actions */}
          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border/70 bg-card px-4 py-3 sm:px-5">
            {imageUrl && <ActionButton onClick={downloadCoverPhoto} icon={Download}>Download Cover Image</ActionButton>}
            <ActionButton onClick={copyPost} disabled={!posts[active]} icon={Copy}>Copy</ActionButton>
            <ActionButton onClick={nativeShare} disabled={!posts[active]} icon={Share2}>Share</ActionButton>
            <ActionButton
              onClick={save}
              disabled={saving || readyCount !== platforms.length}
              icon={saving ? Loader2 : CheckCircle2}
              spinning={saving}
            >
              Save kit
            </ActionButton>
            <button
              onClick={copyAndOpen}
              disabled={!posts[active]}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-[10px] font-bold text-accent-foreground shadow-lg shadow-accent/15 disabled:opacity-40"
            >
              <ExternalLink className="size-3.5" />Copy & open {selectedPlatform.label}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
