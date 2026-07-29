"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { CheckCircle2, Copy, Download, ExternalLink, Facebook, FileText, ImageIcon, Instagram, Linkedin, Loader2, MessagesSquare, RefreshCw, Save, Send, Share2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import useModalScrollLock from "@/hooks/useModalScrollLock";
import { getSafeImageSrc } from "@/lib/images/getSafeImageSrc";

const platforms = [
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin, active: "border-[#67a8ff]/40 bg-[#0a66c2]/20 text-[#8dc0ff]", dot: "bg-[#0a66c2]" },
  { key: "facebook", label: "Facebook", Icon: Facebook, active: "border-[#6da0ff]/40 bg-[#1877f2]/20 text-[#91b6ff]", dot: "bg-[#1877f2]" },
  { key: "x", label: "X", Icon: X, active: "border-white/25 bg-white/10 text-white", dot: "bg-white" },
  { key: "whatsapp", label: "WhatsApp", Icon: Send, active: "border-emerald-300/30 bg-emerald-400/15 text-emerald-200", dot: "bg-emerald-400" },
  { key: "reddit", label: "Reddit", Icon: MessagesSquare, active: "border-orange-300/30 bg-orange-400/15 text-orange-200", dot: "bg-orange-400" },
  { key: "instagram", label: "Instagram", Icon: Instagram, active: "border-pink-300/30 bg-pink-400/15 text-pink-200", dot: "bg-pink-400" },
];
const emptyPosts = { linkedin: "", facebook: "", x: "", whatsapp: "", reddit: "", instagram: "" };

export default function SocialShareKitModal({ blog, isOpen, onClose, onUpdated }) {
  const [active, setActive] = useState("linkedin");
  const [posts, setPosts] = useState(emptyPosts);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState("");
  useModalScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    setPosts({ ...emptyPosts, ...(blog?.socialKit || {}) });
    setFeedback("");
  }, [blog, isOpen]);

  const imageUrl = blog?.socialKit?.imageUrl || blog?.featuredImage?.url || blog?.image || "";
  const blogUrl = useMemo(() => typeof window === "undefined" || !blog?.slug ? "" : `${window.location.origin}/blog/${blog.slug}`, [blog?.slug]);
  const selectedPlatform = platforms.find((item) => item.key === active) || platforms[0];
  const SelectedIcon = selectedPlatform.Icon;
  const readyCount = Object.values(posts).filter(Boolean).length;
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
  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/blogs/${blog._id}/social-kit`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(posts) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Could not save social posts.");
      setPosts({ ...emptyPosts, ...result.data });
      toast.success("Social Share Kit saved.");
      await onUpdated?.();
    } catch (error) { toast.error(error.message); } finally { setSaving(false); }
  };
  const generate = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`/api/admin/blogs/${blog._id}/social-kit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ feedback }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Could not generate social posts.");
      setPosts({ ...emptyPosts, ...result.data });
      toast.success(result.data.source === "ai" ? "AI social posts generated." : "Safe social drafts prepared.");
      await onUpdated?.();
    } catch (error) { toast.error(error.message); } finally { setGenerating(false); }
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
      if (error.name !== "AbortError") toast.error("This app could not accept the full package. Use Copy & Open instead.");
    }
  };

  return createPortal(
    <div className="social-share-kit-theme fixed inset-0 z-[1200] flex h-[100dvh] w-screen items-end justify-center bg-background/90 p-0 backdrop-blur-xl md:items-center md:p-5" role="dialog" aria-modal="true" aria-labelledby="social-kit-title">
      <button className="absolute inset-0" onClick={onClose} aria-label="Close Social Share Kit" />
      <section className="relative flex h-[100dvh] w-full max-w-[1280px] flex-col overflow-hidden border border-border bg-card shadow-2xl md:h-auto md:max-h-[94vh] md:rounded-[28px]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_20%_0%,rgba(167,139,250,.17),transparent_45%),radial-gradient(circle_at_75%_0%,rgba(56,189,248,.09),transparent_35%)]" />
        <header className="relative flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-7 sm:py-5">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-violet-300 ring-1 ring-inset ring-violet-300/15 sm:size-12 sm:rounded-2xl"><Share2 className="size-4 sm:size-5" /></span>
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-[8px] font-bold uppercase tracking-[.2em] text-violet-300 sm:text-[9px]">Social publishing studio</p><span className={`rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${readyCount === platforms.length ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-300" : "border-amber-300/20 bg-amber-400/10 text-amber-300"}`}>{readyCount}/{platforms.length} ready</span></div><h2 id="social-kit-title" className="mt-1 text-base font-semibold tracking-[-.025em] text-white sm:mt-2 sm:text-2xl">Campaign-ready social content</h2><p className="mt-0.5 max-w-[65vw] truncate text-[10px] text-slate-500 sm:mt-1 sm:text-xs">{blog.title}</p></div>
          </div>
          <button onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-slate-500 transition hover:border-white/15 hover:text-white" aria-label="Close"><X className="size-4" /></button>
        </header>

        <div className="grid min-h-0 flex-1 overflow-y-auto xl:grid-cols-[360px_minmax(0,1fr)] xl:overflow-hidden">
          <aside className="order-2 border-t border-white/[0.08] bg-slate-950/20 p-4 xl:order-1 xl:min-h-0 xl:overflow-y-auto xl:border-r xl:border-t-0 sm:p-6">
            <div className="mb-3 hidden items-center justify-between sm:flex"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-600">Campaign visual</p><p className="mt-1 text-xs font-semibold text-slate-300">Featured blog image</p></div><span className={`flex items-center gap-1.5 text-[9px] font-bold ${imageUrl ? "text-emerald-300" : "text-amber-300"}`}>{imageUrl ? <CheckCircle2 className="size-3" /> : <ImageIcon className="size-3" />}{imageUrl ? "Ready" : "Missing"}</span></div>
            <div className="group relative hidden aspect-video overflow-hidden rounded-2xl border border-white/[0.1] bg-slate-950/70 shadow-xl sm:block">{imageUrl ? <Image src={getSafeImageSrc(imageUrl)} alt={blog.featuredImage?.alt || `${blog.title} social image`} fill sizes="360px" className="object-cover transition duration-700 group-hover:scale-[1.025]" /> : <div className="grid size-full place-items-center"><ImageIcon className="size-8 text-slate-700" /></div>}<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" /></div>
            {imageUrl && <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="mt-3 hidden h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] text-xs font-bold text-slate-400 transition hover:border-white/15 hover:text-white sm:inline-flex"><Download className="size-4" />Open or download visual</a>}
            <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><Sparkles className="size-4" /></span><div><p className="text-xs font-semibold text-slate-200">Creative direction</p><p className="text-[9px] text-slate-600">Guide the next regeneration</p></div></div><textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} rows={3} placeholder="Example: shorter, founder-focused, stronger technical hook…" className="mt-4 w-full resize-none rounded-xl border border-white/[0.07] bg-slate-950/45 p-3 text-xs leading-5 text-slate-200 outline-none placeholder:text-slate-700 focus:border-violet-400/40" /><button onClick={generate} disabled={generating} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-violet-300 text-xs font-bold text-slate-950 transition hover:bg-violet-200 disabled:opacity-50">{generating ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}{readyCount ? "Regenerate all posts" : "Generate social kit"}</button></div>
            <div className="mt-4 grid grid-cols-2 gap-2"><InfoCard icon={FileText} label="Article" value={blog.articleType || "Standard"} /><InfoCard icon={CheckCircle2} label="Source" value={blog.socialKit?.source || "Pending"} /></div>
          </aside>

          <div className="order-1 flex min-h-[560px] flex-col bg-[#0a1423] xl:order-2 xl:min-h-0">
            <nav className="flex gap-2 overflow-x-auto border-b border-white/[0.08] px-4 py-3 sm:px-6">{platforms.map(({ key, label, Icon, active: activeClass, dot }) => <button key={key} onClick={() => setActive(key)} className={`group inline-flex h-11 shrink-0 items-center gap-2.5 rounded-xl border px-4 text-xs font-bold transition ${active === key ? activeClass : "border-transparent text-slate-600 hover:border-white/[0.07] hover:bg-white/[0.025] hover:text-slate-300"}`}><span className={`size-1.5 rounded-full ${active === key ? dot : "bg-slate-700"}`} /><Icon className="size-4" />{label}{posts[key] && <CheckCircle2 className="ml-1 size-3 text-emerald-400" />}</button>)}</nav>
            <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="flex min-h-0 flex-col p-4 sm:p-6">
                <div className="mb-3 shrink-0 flex items-end justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-600">Post editor</p><h3 className="mt-1 text-sm font-semibold text-slate-200">{selectedPlatform.label} copy</h3></div><span className={`rounded-lg border px-2.5 py-1 text-[9px] font-bold ${active === "x" && posts.x.length > 280 ? "border-rose-300/20 bg-rose-400/10 text-rose-300" : "border-white/[0.07] text-slate-600"}`}>{posts[active].length}{active === "x" ? "/280" : " characters"}</span></div>
                <textarea value={posts[active]} onChange={(event) => setPosts((current) => ({ ...current, [active]: event.target.value }))} placeholder="Generate the Social Share Kit to prepare this platform post." className="min-h-64 w-full flex-1 resize-none rounded-2xl border border-white/[0.08] bg-slate-950/35 p-4 text-sm leading-6 text-slate-200 shadow-inner outline-none placeholder:text-slate-700 focus:border-violet-400/40 focus:ring-4 focus:ring-violet-400/[0.04] sm:p-5 sm:leading-7" />
              </div>
              <aside className="hidden border-l border-white/[0.07] bg-slate-950/20 p-5 lg:block"><p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-600">Live preview</p><div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1828] shadow-xl"><div className="flex items-center gap-3 border-b border-white/[0.06] p-4"><span className={`grid size-9 place-items-center rounded-full ${selectedPlatform.active}`}><SelectedIcon className="size-4" /></span><div><p className="text-xs font-semibold text-white">Muhyo Tech</p><p className="text-[9px] text-slate-600">Prepared for {selectedPlatform.label}</p></div></div><p className="max-h-48 overflow-hidden whitespace-pre-wrap p-4 text-[11px] leading-5 text-slate-400">{posts[active] || "Your generated post preview will appear here."}</p>{imageUrl && <div className="relative aspect-video border-t border-white/[0.06]"><Image src={getSafeImageSrc(imageUrl)} alt="" fill sizes="300px" className="object-cover" /></div>}</div><p className="mt-4 rounded-xl border border-sky-300/10 bg-sky-400/[0.04] p-3 text-[10px] leading-5 text-slate-500">Copy & Open copies the prepared text first. LinkedIn and Facebook will build their image preview from the blog link.</p></aside>
            </div>
            <footer className="flex flex-col gap-3 border-t border-white/[0.08] bg-slate-950/25 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6"><p className="hidden max-w-xs text-[9px] leading-4 text-slate-600 xl:block">Review the copy before publishing. No platform is posted to automatically.</p><div className="flex flex-wrap gap-2 sm:ml-auto"><ActionButton onClick={copyPost} disabled={!posts[active]} icon={Copy}>Copy</ActionButton><ActionButton onClick={nativeShare} disabled={!posts[active]} icon={Share2}>Native share</ActionButton><ActionButton onClick={save} disabled={saving || !posts[active]} icon={saving ? Loader2 : Save} spinning={saving}>Save kit</ActionButton><button onClick={copyAndOpen} disabled={!posts[active]} className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-300 px-5 text-xs font-bold text-slate-950 shadow-lg shadow-violet-500/15 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-40"><ExternalLink className="size-4" />Copy & open {selectedPlatform.label}</button></div></footer>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3"><Icon className="size-3.5 text-violet-300" /><p className="mt-2 text-[8px] font-bold uppercase tracking-wider text-slate-600">{label}</p><p className="mt-1 truncate text-[10px] font-semibold capitalize text-slate-300">{value}</p></div>;
}

function ActionButton({ onClick, disabled, icon: Icon, children, spinning = false }) {
  return <button onClick={onClick} disabled={disabled} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-xs font-bold text-slate-300 transition hover:border-white/15 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"><Icon className={`size-4 ${spinning ? "animate-spin" : ""}`} />{children}</button>;
}
