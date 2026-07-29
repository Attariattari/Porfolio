"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import {
  CheckCircle2, Copy, Download, ExternalLink, Facebook, FileText, ImageIcon,
  Instagram, Linkedin, Loader2, MessagesSquare, RefreshCw, Save, Send,
  Share2, Sparkles, X,
} from "lucide-react";
import { toast } from "sonner";
import useModalScrollLock from "@/hooks/useModalScrollLock";
import { getSafeImageSrc } from "@/lib/images/getSafeImageSrc";

const platforms = [
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin, tone: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
  { key: "facebook", label: "Facebook", Icon: Facebook, tone: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { key: "x", label: "X", Icon: X, tone: "text-foreground bg-foreground/5 border-border" },
  { key: "whatsapp", label: "WhatsApp", Icon: Send, tone: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  { key: "reddit", label: "Reddit", Icon: MessagesSquare, tone: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  { key: "instagram", label: "Instagram", Icon: Instagram, tone: "text-pink-500 bg-pink-500/10 border-pink-500/20" },
];

const emptyPosts = { linkedin: "", facebook: "", x: "", whatsapp: "", reddit: "", instagram: "" };

export default function SocialShareKitModal({ blog, isOpen, onClose, onUpdated }) {
  const [active, setActive] = useState("linkedin");
  const [posts, setPosts] = useState(emptyPosts);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isTouchMobile, setIsTouchMobile] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  useModalScrollLock(isOpen);

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent || "";
      const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
        || (/Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1);
      const touchMobile = mobileUserAgent;
      setIsTouchMobile(touchMobile);
      setShowPreview(!touchMobile && window.innerWidth >= 1100);
    };
    detectDevice();
    window.addEventListener("resize", detectDevice);
    return () => window.removeEventListener("resize", detectDevice);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setPosts({ ...emptyPosts, ...(blog?.socialKit || {}) });
    setFeedback("");
  }, [blog?._id, isOpen]);

  const selectedPlatform = platforms.find(({ key }) => key === active) || platforms[0];
  const SelectedIcon = selectedPlatform.Icon;
  const imageUrl = blog?.socialKit?.imageUrl || blog?.featuredImage?.url || blog?.image || "";
  const blogUrl = useMemo(() => typeof window === "undefined" || !blog?.slug ? "" : `${window.location.origin}/blog/${blog.slug}`, [blog?.slug]);
  const readyCount = platforms.filter(({ key }) => Boolean(posts[key]?.trim())).length;
  const missingPlatforms = platforms.filter(({ key }) => !posts[key]?.trim()).map(({ key }) => key);
  const allReady = readyCount === platforms.length;

  if (!isOpen || !blog || typeof document === "undefined") return null;

  const copyPost = async () => {
    await navigator.clipboard.writeText(posts[active]);
    toast.success(`${selectedPlatform.label} post copied.`);
  };

  const platformUrl = () => {
    if (active === "linkedin") return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(blogUrl)}`;
    if (active === "facebook") return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogUrl)}`;
    if (active === "x") return `https://twitter.com/intent/tweet?text=${encodeURIComponent(posts.x)}`;
    if (active === "whatsapp") return `https://wa.me/?text=${encodeURIComponent(posts.whatsapp)}`;
    if (active === "reddit") return `https://www.reddit.com/submit?url=${encodeURIComponent(blogUrl)}&title=${encodeURIComponent(blog.title)}`;
    return "https://www.instagram.com/";
  };

  const copyAndOpen = async () => {
    await copyPost();
    window.open(platformUrl(), "_blank", "noopener,noreferrer");
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const requestedPlatforms = missingPlatforms.length ? missingPlatforms : platforms.map(({ key }) => key);
      const response = await fetch(`/api/admin/blogs/${blog._id}/social-kit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback, platforms: requestedPlatforms }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Could not generate social posts.");
      setPosts({ ...emptyPosts, ...result.data });
      toast.success(missingPlatforms.length ? "Missing platform posts prepared." : "Social kit regenerated.");
      await onUpdated?.();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/blogs/${blog._id}/social-kit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(posts),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Could not save social posts.");
      setPosts({ ...emptyPosts, ...result.data });
      toast.success("Social Share Kit saved.");
      await onUpdated?.();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) return toast.error("Native sharing is not supported in this browser.");
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
      if (error.name !== "AbortError") toast.error("Use Copy & Open if the platform cannot accept the full package.");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex h-[100dvh] w-screen items-center justify-center bg-foreground/35 p-0 backdrop-blur-md md:p-5" role="dialog" aria-modal="true" aria-labelledby="social-kit-title">
      <button className="absolute inset-0" onClick={onClose} aria-label="Close Social Share Kit" />
      <section className="relative flex h-[100dvh] w-full max-w-[1440px] flex-col overflow-hidden border border-border bg-background shadow-2xl md:h-[94dvh] md:rounded-[2rem]">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border/70 bg-card px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent"><Share2 className="size-4" /></span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[9px] font-black uppercase tracking-[.2em] text-accent">Social publishing studio</p>
                <span className={`rounded-full px-2 py-1 text-[8px] font-black uppercase ${allReady ? "bg-status-success/10 text-status-success" : "bg-status-warning/10 text-status-warning"}`}>{readyCount}/{platforms.length} ready</span>
              </div>
              <h2 id="social-kit-title" className="mt-1 truncate text-base font-black tracking-tight text-foreground sm:text-xl">Social Share Kit</h2>
              <p className="mt-0.5 max-w-[65vw] truncate text-[10px] text-muted-foreground sm:text-xs">{blog.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-background text-muted-foreground transition hover:text-foreground" aria-label="Close"><X className="size-4" /></button>
        </header>

        <div className={`grid min-h-0 flex-1 ${isTouchMobile ? "grid-cols-1" : "grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]"}`}>
          <aside className={`${isTouchMobile ? "hidden" : "block"} min-h-0 overflow-y-auto border-r border-border/70 bg-card/45 p-5`}>
            <SectionLabel>Campaign asset</SectionLabel>
            <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
              <div className="relative aspect-video bg-muted/30">
                {imageUrl ? <Image src={getSafeImageSrc(imageUrl)} alt={blog.featuredImage?.alt || `${blog.title} social image`} fill sizes="320px" className="object-cover" /> : <div className="grid size-full place-items-center"><ImageIcon className="size-8 text-muted-foreground/40" /></div>}
              </div>
              <div className="border-t border-border/70 p-3">
                <p className="line-clamp-2 text-xs font-bold leading-5 text-foreground">{blog.title}</p>
                {imageUrl && <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-border text-[10px] font-bold text-muted-foreground hover:text-foreground"><Download className="size-3.5" />Open visual</a>}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-accent/10 text-accent"><Sparkles className="size-4" /></span><div><p className="text-xs font-bold text-foreground">Creative direction</p><p className="text-[9px] text-muted-foreground">Guide the next generation</p></div></div>
              <textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={4} placeholder="Example: founder-focused, clearer technical lesson…" className="mt-4 h-24 w-full resize-none overflow-y-auto rounded-xl border border-border bg-card p-3 text-xs leading-5 text-foreground outline-none placeholder:text-muted-foreground focus:border-accent" />
              <button onClick={generate} disabled={generating} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-accent text-xs font-bold text-accent-foreground shadow-lg shadow-accent/15 disabled:opacity-50">{generating ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}{missingPlatforms.length ? `Generate ${missingPlatforms.length} missing` : "Regenerate all"}</button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2"><InfoCard icon={FileText} label="Article" value={blog.articleType || "Standard"} /><InfoCard icon={CheckCircle2} label="Source" value={blog.socialKit?.source || "Pending"} /></div>
          </aside>

          <div className="flex min-h-0 flex-col bg-background">
            <div className={`${isTouchMobile ? "flex" : "hidden"} shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-card/40 px-4 py-3`}>
              <div><p className="text-[9px] font-black uppercase tracking-wider text-accent">Kit controls</p><p className="mt-0.5 text-[10px] text-muted-foreground">{missingPlatforms.length ? `${missingPlatforms.length} missing post${missingPlatforms.length === 1 ? "" : "s"}` : "All platforms ready"}</p></div>
              <button onClick={generate} disabled={generating} className="inline-flex h-9 items-center gap-2 rounded-xl bg-accent px-3 text-[10px] font-bold text-accent-foreground disabled:opacity-50">{generating ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}{missingPlatforms.length ? "Generate missing" : "Regenerate"}</button>
            </div>

            <nav className="flex shrink-0 gap-2 overflow-x-auto border-b border-border/70 bg-card/25 px-4 py-3 sm:px-5">
              {platforms.map(({ key, label, Icon, tone }) => <button key={key} onClick={() => setActive(key)} className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-[10px] font-bold transition ${active === key ? tone : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"}`}><Icon className="size-3.5" />{label}{posts[key] && <CheckCircle2 className="size-3 text-status-success" />}</button>)}
            </nav>

            <div className={`grid min-h-0 flex-1 ${showPreview ? "grid-cols-[minmax(0,1fr)_300px]" : "grid-cols-1"}`}>
              <div className="flex min-h-0 flex-col p-4 sm:p-5">
                <div className="mb-3 flex shrink-0 items-end justify-between gap-4">
                  <div><SectionLabel>Post editor</SectionLabel><h3 className="mt-1 text-sm font-black text-foreground">{selectedPlatform.label} copy</h3></div>
                  <span className={`rounded-lg border px-2 py-1 text-[9px] font-bold ${active === "x" && (posts.x.length < 270 || posts.x.length > 280) ? "border-status-danger/30 bg-status-danger/10 text-status-danger" : "border-border text-muted-foreground"}`}>{posts[active].length}{active === "x" ? "/280" : " characters"}</span>
                </div>
                <textarea value={posts[active]} onChange={(event) => setPosts((current) => ({ ...current, [active]: event.target.value }))} placeholder="Generate this platform post to begin editing." className="h-[42dvh] min-h-64 w-full flex-1 resize-none overflow-y-auto rounded-2xl border border-border bg-card p-4 text-sm leading-7 text-foreground shadow-inner outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/5 md:h-auto" />
              </div>

              <aside className={`${showPreview ? "block" : "hidden"} min-h-0 overflow-y-auto border-l border-border/70 bg-card/35 p-5`}>
                <SectionLabel>Live preview</SectionLabel>
                <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
                  <div className="flex items-center gap-3 border-b border-border/70 p-4"><span className={`grid size-9 place-items-center rounded-full border ${selectedPlatform.tone}`}><SelectedIcon className="size-4" /></span><div><p className="text-xs font-bold text-foreground">Muhyo Tech</p><p className="text-[9px] text-muted-foreground">Prepared for {selectedPlatform.label}</p></div></div>
                  <p className="max-h-72 overflow-y-auto whitespace-pre-wrap p-4 text-[11px] leading-5 text-muted-foreground">{posts[active] || "Your generated post preview will appear here."}</p>
                  {imageUrl && <div className="relative aspect-video border-t border-border/70"><Image src={getSafeImageSrc(imageUrl)} alt="" fill sizes="300px" className="object-cover" /></div>}
                </div>
                <p className="mt-3 rounded-xl border border-border bg-background p-3 text-[10px] leading-5 text-muted-foreground">Copy & Open copies the final text first. Instagram requires pasting the caption after the app opens.</p>
              </aside>
            </div>

            <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border/70 bg-card px-4 py-3 sm:px-5">
              <ActionButton onClick={copyPost} disabled={!posts[active]} icon={Copy}>Copy</ActionButton>
              <ActionButton onClick={nativeShare} disabled={!posts[active]} icon={Share2}>Share</ActionButton>
              <ActionButton onClick={save} disabled={saving || readyCount !== platforms.length} icon={saving ? Loader2 : Save} spinning={saving}>Save kit</ActionButton>
              <button onClick={copyAndOpen} disabled={!posts[active]} className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-[10px] font-bold text-accent-foreground shadow-lg shadow-accent/15 disabled:opacity-40"><ExternalLink className="size-3.5" />Copy & open {selectedPlatform.label}</button>
            </footer>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function SectionLabel({ children }) {
  return <p className="text-[9px] font-black uppercase tracking-[.18em] text-muted-foreground">{children}</p>;
}

function InfoCard({ icon: Icon, label, value }) {
  return <div className="rounded-xl border border-border bg-background p-3"><Icon className="size-3.5 text-accent" /><p className="mt-2 text-[8px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 truncate text-[10px] font-bold capitalize text-foreground">{value}</p></div>;
}

function ActionButton({ onClick, disabled, icon: Icon, children, spinning = false }) {
  return <button onClick={onClick} disabled={disabled} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-[10px] font-bold text-foreground transition hover:bg-muted disabled:opacity-40"><Icon className={`size-3.5 ${spinning ? "animate-spin" : ""}`} />{children}</button>;
}
