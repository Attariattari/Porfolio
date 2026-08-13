"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Upload,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Loader2,
  RefreshCw,
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

export default function UploadClient({
  token,
  blogId,
  blogTitle,
  blogSlug,
  imagePrompt,
  negativePrompt,
  initialImage = "",
  isAlreadyUploaded = false,
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initialImage || "");
  const [status, setStatus] = useState(isAlreadyUploaded || initialImage ? "success" : "idle"); // 'idle' | 'uploading' | 'success' | 'error'
  const [message, setMessage] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [uploadData, setUploadData] = useState(null);
  const [isReplacing, setIsReplacing] = useState(false);

  const copyTimerRef = useRef(null);

  useEffect(() => () => {
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => () => {
    window.clearTimeout(copyTimerRef.current);
  }, []);

  const onFileChange = (event) => {
    const selected = event.target.files?.[0];
    setFile(selected || null);
    setPreview(selected ? URL.createObjectURL(selected) : initialImage || "");
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
      if (!res.ok || !data.success) throw new Error(data.message || "Image upload failed.");
      setStatus("success");
      setIsReplacing(false);
      setUploadData(data);
      if (data.imageUrl) setPreview(data.imageUrl);
      setMessage("Image uploaded & blog published successfully!");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Image upload failed. Please try again.");
    }
  };

  const blogUrl = uploadData?.redirectUrl || (blogSlug ? `/blog/${blogSlug}` : null);

  // ─── SUCCESS STATE: Show only 2 action buttons + option to replace ────────
  if (status === "success" && !isReplacing) {
    return (
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
        {/* Success Banner */}
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-8 py-8 text-center w-full">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <p className="text-lg font-black text-emerald-300">
            {isAlreadyUploaded ? "Blog Cover Image is Published & Live!" : "Image Uploaded & Blog Published!"}
          </p>
          <p className="text-sm text-emerald-200/70 max-w-sm">
            Your blog cover photo is live. Choose what you would like to do next.
          </p>
        </div>

        {/* Uploaded image preview */}
        {preview && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border shadow-2xl">
            <Image src={preview} alt="Uploaded blog cover" fill unoptimized className="object-cover" />
          </div>
        )}

        {/* 2 Main Action Buttons */}
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          {/* View Blog */}
          {blogUrl && (
            <a
              href={blogUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-4 text-sm font-black uppercase tracking-[0.15em] text-card-foreground shadow-lg transition-all hover:border-accent/50 hover:bg-accent/10"
            >
              <ExternalLink className="h-5 w-5" />
              View Live Blog
            </a>
          )}

          {/* Open Social Kit */}
          <a
            href={`/blog-image-upload/${token}/social-kit`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 text-sm font-black uppercase tracking-[0.15em] text-accent-foreground shadow-xl transition-all hover:opacity-90"
          >
            <Sparkles className="h-5 w-5" />
            Open Social Kit
          </a>
        </div>

        {/* Option to replace image if needed */}
        <button
          type="button"
          onClick={() => setIsReplacing(true)}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all pt-2"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Replace Cover Photo
        </button>
      </div>
    );
  }

  // ─── UPLOAD STATE ────────────────────────────────────────────────────────
  return (
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
          <p className="mt-3 text-xs text-muted-foreground">Negative: {negativePrompt}</p>
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
          <Image src={preview} alt="Selected blog cover preview" fill unoptimized className="object-cover" />
        </div>
      ) : null}

      <div className="flex gap-3">
        {isReplacing && (
          <button
            type="button"
            onClick={() => { setIsReplacing(false); setStatus("success"); }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-4 text-sm font-bold text-foreground"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={status === "uploading"}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-accent-foreground shadow-xl transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "uploading" ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Uploading Image...</>
          ) : (
            <><Upload className="h-5 w-5" /> Save Cover Photo & Publish</>
          )}
        </button>
      </div>

      {message ? (
        <div aria-live="polite" className="flex items-center gap-2 rounded-xl border border-border bg-muted/60 p-3 text-sm text-foreground">
          {status === "error" ? (
            <AlertCircle className="h-4 w-4 text-destructive" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-accent" />
          )}
          {message}
        </div>
      ) : null}
    </form>
  );
}
