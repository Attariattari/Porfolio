"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Upload,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Share2,
  Globe,
  Sparkles,
  Twitter,
  Linkedin,
  Facebook,
  FileText,
  Send,
  MessagesSquare,
  Instagram,
  Loader2,
  ImageIcon,
} from "lucide-react";

async function writeToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  const copied = document.execCommand("copy");
  textArea.remove();

  if (!copied) throw new Error("Clipboard access is unavailable.");
}

const PLATFORM_ICONS = {
  linkedin: Linkedin,
  facebook: Facebook,
  x: Twitter,
  whatsapp: Send,
  reddit: MessagesSquare,
  instagram: Instagram,
  devto: FileText,
};

export default function UploadClient({
  token,
  blogId,
  blogTitle,
  blogSlug,
  imagePrompt,
  negativePrompt,
  initialSocialKit,
}) {
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' | 'socialKit'
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [uploadData, setUploadData] = useState(null);

  // Social kit state
  const [socialKit, setSocialKit] = useState(initialSocialKit || null);
  const [socialKitLoading, setSocialKitLoading] = useState(false);
  const [socialKitError, setSocialKitError] = useState("");
  const [activeSocialPlatform, setActiveSocialPlatform] = useState("linkedin");
  const [copiedPlatform, setCopiedPlatform] = useState("");

  const copyTimerRef = useRef(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => () => {
    window.clearTimeout(copyTimerRef.current);
  }, []);

  const fetchSocialKit = async () => {
    if (socialKitLoading) return;
    setSocialKitLoading(true);
    setSocialKitError("");

    try {
      const res = await fetch(`/api/blog-image-upload/${token}/social-kit`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load AI Social Share Kit.");
      }
      setSocialKit(data.socialKit);
    } catch (err) {
      setSocialKitError(err.message || "Could not generate or load AI Social Kit.");
    } finally {
      setSocialKitLoading(false);
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === "socialKit" && (!socialKit || !socialKit.linkedin)) {
      fetchSocialKit();
    }
  };

  const onFileChange = (event) => {
    const selected = event.target.files?.[0];
    setFile(selected || null);
    setPreview(selected ? URL.createObjectURL(selected) : "");
    setStatus("idle");
    setMessage("");
  };

  const copyPromptText = async () => {
    try {
      await writeToClipboard(
        [imagePrompt, negativePrompt ? `Negative prompt: ${negativePrompt}` : ""]
          .filter(Boolean)
          .join("\n\n")
      );
      setCopiedPrompt(true);
      window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopiedPrompt(false), 2200);
    } catch {
      setStatus("error");
      setMessage("Could not copy prompt. Please select and copy it manually.");
    }
  };

  const copySocialText = async (platform, text) => {
    try {
      await writeToClipboard(text);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(""), 2000);
    } catch {
      alert("Failed to copy text to clipboard.");
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!file) {
      setMessage("Please select a cover photo file first.");
      return;
    }

    setStatus("uploading");
    setMessage("");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`/api/blog-image-upload/${token}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Image upload failed.");
      }

      setStatus("success");
      setUploadData(data);
      if (data.socialKit) {
        setSocialKit(data.socialKit);
      }
      setMessage("Image uploaded & blog published successfully!");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Image upload failed. Please try again.");
    }
  };

  const activePostText = socialKit
    ? typeof socialKit[activeSocialPlatform] === "object"
      ? socialKit[activeSocialPlatform]?.postText
      : socialKit[activeSocialPlatform]
    : "";

  return (
    <div className="space-y-6">
      {/* Navigation Mode Tabs */}
      <div className="flex rounded-2xl border border-border bg-card p-1.5 shadow-md">
        <button
          type="button"
          onClick={() => handleTabSwitch("upload")}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "upload"
              ? "bg-accent text-accent-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          📸 Upload Cover Image
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch("socialKit")}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === "socialKit"
              ? "bg-accent text-accent-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Sparkles className="h-4 w-4 text-emerald-400" />
          🚀 AI Social Share Kit
        </button>
      </div>

      {/* SECTION 1: COVER IMAGE UPLOAD TAB */}
      {activeTab === "upload" && (
        <form onSubmit={submit} className="space-y-5 animate-in fade-in duration-200">
          {/* Image Prompt Box */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-accent">
                ✨ Image Prompt
              </p>
              <button
                type="button"
                onClick={copyPromptText}
                className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-xs font-bold text-accent transition-all hover:bg-accent/20"
              >
                {copiedPrompt ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                {copiedPrompt ? "Copied" : "Copy Prompt"}
              </button>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-card-foreground font-mono bg-muted/50 p-3.5 rounded-xl border border-border">
              {imagePrompt || "Standard technical cover photo required."}
            </p>
            {negativePrompt ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Negative: {negativePrompt}
              </p>
            ) : null}
          </div>

          {/* Upload Dropzone */}
          <label className="block cursor-pointer rounded-2xl border border-dashed border-border bg-card p-8 text-center transition-all hover:border-accent/60 hover:bg-accent/5">
            <Upload className="mx-auto h-8 w-8 text-accent" />
            <span className="mt-3 block text-sm font-bold text-card-foreground">
              Choose JPG, PNG, or WEBP Cover Image
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">Max size 8MB</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onFileChange}
              className="sr-only"
            />
          </label>

          {preview ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border shadow-2xl">
              <Image
                src={preview}
                alt="Selected blog cover preview"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ) : null}

          <button
            type="submit"
            disabled={status === "uploading" || status === "success"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-accent-foreground shadow-xl transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "success" ? <CheckCircle2 className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
            {status === "uploading"
              ? "Uploading Image..."
              : status === "success"
              ? "Upload Complete"
              : "Save Cover Photo & Publish"}
          </button>

          {message && status !== "success" ? (
            <div aria-live="polite" className="flex items-center gap-2 rounded-xl border border-border bg-muted/60 p-3 text-sm text-foreground">
              {status === "error" ? <AlertCircle className="h-4 w-4 text-destructive" /> : <CheckCircle2 className="h-4 w-4 text-accent" />}
              {message}
            </div>
          ) : null}
        </form>
      )}

      {/* SECTION 2: AI SOCIAL SHARE KIT TAB */}
      {(activeTab === "socialKit" || status === "success") && (
        <div className="rounded-3xl border border-accent/40 bg-card p-6 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent border border-accent/20">
                <Share2 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI Social Share Kit
                </span>
                <h2 className="text-lg font-bold text-card-foreground">
                  1-Click Social Media Captions
                </h2>
              </div>
            </div>

            {uploadData?.redirectUrl || blogSlug ? (
              <a
                href={uploadData?.redirectUrl || `/blog/${blogSlug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-accent hover:bg-accent/10 transition-all"
              >
                <Globe className="h-4 w-4" /> View Live Blog
              </a>
            ) : null}
          </div>

          {/* Social Platform Selection Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap border-b border-border pb-3">
            {["linkedin", "facebook", "x", "whatsapp", "reddit", "instagram", "devto"].map((tab) => {
              const IconComp = PLATFORM_ICONS[tab] || Share2;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveSocialPlatform(tab)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    activeSocialPlatform === tab
                      ? "bg-accent text-accent-foreground border border-accent shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  <IconComp className="h-4 w-4" />
                  {tab === "x" ? "X (Twitter)" : tab === "devto" ? "Dev.to" : tab}
                </button>
              );
            })}
          </div>

          {/* Platform Post Preview & Copy Container */}
          {socialKitLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="text-sm font-bold text-foreground">Generating AI Social Share Kit...</p>
              <p className="text-xs text-muted-foreground">Writing 1-click captions for LinkedIn, X, Facebook & Dev.to</p>
            </div>
          ) : socialKitError ? (
            <div className="p-6 text-center space-y-3 rounded-2xl border border-destructive/30 bg-destructive/5">
              <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
              <p className="text-sm font-bold text-destructive">{socialKitError}</p>
              <button
                type="button"
                onClick={fetchSocialKit}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-accent-foreground"
              >
                Retry Social Kit Generation
              </button>
            </div>
          ) : socialKit ? (
            <div className="relative rounded-2xl border border-border bg-background p-5 space-y-4">
              {activeSocialPlatform === "instagram" && (
                <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-3 text-xs text-pink-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-pink-400">
                    📸 Instagram 3-Step Pro Publisher:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-[11px]">
                    <div className="bg-background/50 p-2 rounded-lg border border-pink-500/20">
                      <strong className="text-pink-300">1. Download Image:</strong> Save cover image above.
                    </div>
                    <div className="bg-background/50 p-2 rounded-lg border border-pink-500/20">
                      <strong className="text-pink-300">2. Copy Caption:</strong> Copies caption & hashtags.
                    </div>
                    <div className="bg-background/50 p-2 rounded-lg border border-pink-500/20">
                      <strong className="text-pink-300">3. Post on Instagram:</strong> Upload image & paste caption!
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold capitalize text-accent flex items-center gap-2">
                  {activeSocialPlatform === "x" ? "X / Twitter" : activeSocialPlatform} Optimized Post
                </span>
                <button
                  type="button"
                  onClick={() => copySocialText(activeSocialPlatform, activePostText || "")}
                  disabled={!activePostText}
                  className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-accent text-accent-foreground shadow-md hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {copiedPlatform === activeSocialPlatform ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-300" /> Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copy {activeSocialPlatform === "x" ? "X" : activeSocialPlatform} Caption
                    </>
                  )}
                </button>
              </div>

              <div className="text-xs leading-relaxed text-foreground font-mono bg-muted/40 p-4 rounded-xl max-h-72 overflow-y-auto whitespace-pre-wrap border border-border">
                {activePostText || "Select a platform tab above to view the AI post."}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-3 rounded-2xl border border-border bg-muted/20">
              <Sparkles className="mx-auto h-8 w-8 text-accent" />
              <p className="text-sm font-bold text-foreground">AI Social Share Kit</p>
              <p className="text-xs text-muted-foreground">Click below to generate 1-click captions for all social platforms.</p>
              <button
                type="button"
                onClick={fetchSocialKit}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-black uppercase tracking-wider text-accent-foreground shadow-md"
              >
                Load / Generate AI Social Kit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
