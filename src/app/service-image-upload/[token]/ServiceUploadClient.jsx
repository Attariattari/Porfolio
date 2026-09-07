"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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

export default function ServiceUploadClient({
  token,
  serviceId,
  serviceTitle,
  serviceSlug,
  serviceCategory,
  imagePrompt,
  negativePrompt,
  initialImage = "",
  currentServiceImage = "",
  isAlreadyUploaded = false,
}) {
  const [file, setFile] = useState(null);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [liveImage, setLiveImage] = useState(initialImage || currentServiceImage || "");
  const [status, setStatus] = useState(isAlreadyUploaded ? "success" : "idle"); // 'idle' | 'uploading' | 'success' | 'error'
  const [message, setMessage] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [uploadData, setUploadData] = useState(null);
  const [isReplacing, setIsReplacing] = useState(false);

  const copyTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => () => {
    if (selectedPreview && selectedPreview.startsWith("blob:")) {
      URL.revokeObjectURL(selectedPreview);
    }
  }, [selectedPreview]);

  useEffect(() => () => {
    window.clearTimeout(copyTimerRef.current);
  }, []);

  const onFileChange = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setStatus("error");
      setMessage("Please select a valid JPG, PNG, or WEBP image file.");
      return;
    }

    if (selected.size > 12 * 1024 * 1024) {
      setStatus("error");
      setMessage("Image file size must be under 12MB.");
      return;
    }

    if (selectedPreview && selectedPreview.startsWith("blob:")) {
      URL.revokeObjectURL(selectedPreview);
    }

    setFile(selected);
    setSelectedPreview(URL.createObjectURL(selected));
    setStatus("idle");
    setMessage("");
  };

  const clearSelectedFile = () => {
    if (selectedPreview && selectedPreview.startsWith("blob:")) {
      URL.revokeObjectURL(selectedPreview);
    }
    setFile(null);
    setSelectedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyPromptText = async () => {
    try {
      const fullCopy = [
        imagePrompt,
        negativePrompt ? `Negative prompt: ${negativePrompt}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      await writeToClipboard(fullCopy);
      setCopiedPrompt(true);
      window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopiedPrompt(false), 2400);
    } catch {
      setStatus("error");
      setMessage("Could not copy prompt automatically. Please select and copy it manually.");
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!file) {
      setStatus("error");
      setMessage("Please select a cover image file first.");
      return;
    }

    setStatus("uploading");
    setMessage("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("file", file);

    try {
      const res = await fetch(`/api/service-image-upload/${token}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Image upload failed.");
      }

      setStatus("success");
      setIsReplacing(false);
      setUploadData(data);
      if (data.imageUrl) {
        setLiveImage(data.imageUrl);
      }
      setMessage(`Image uploaded & service '${serviceTitle}' updated successfully!`);
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Image upload failed. Please try again.");
    }
  };

  const serviceUrl = uploadData?.redirectUrl || (serviceSlug ? `/services/${serviceSlug}` : null);
  const displayLiveImage = uploadData?.imageUrl || liveImage;

  // ─── SUCCESS STATE (Only when token was already used or just completed) ───
  if (status === "success" && !isReplacing) {
    return (
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
        {/* Success Banner */}
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card px-8 py-8 text-center w-full shadow-xl">
          <div className="grid h-16 w-16 place-items-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 shadow-inner">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-card-foreground">
            Service Cover Image is Published & Live!
          </p>
          <p className="text-sm font-medium text-muted-foreground max-w-md leading-relaxed">
            Your 4K service cover photo is live on Cloudinary and displayed across all public service showcases and client presentations.
          </p>
        </div>

        {/* Live Image Preview */}
        {displayLiveImage ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border shadow-2xl">
            <Image
              src={displayLiveImage}
              alt="Live service cover"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        ) : null}

        {/* 2 Main Action Buttons */}
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          {serviceUrl && (
            <a
              href={serviceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-4 text-sm font-black uppercase tracking-[0.15em] text-card-foreground shadow-lg transition-all hover:border-accent/50 hover:bg-accent/10"
            >
              <ExternalLink className="h-5 w-5" />
              View Live Service
            </a>
          )}

          <Link
            href="/admin/services"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 text-sm font-black uppercase tracking-[0.15em] text-accent-foreground shadow-xl transition-all hover:opacity-90"
          >
            <Sparkles className="h-5 w-5" />
            Manage Services
          </Link>
        </div>

        {/* Replace Button to upload a new one */}
        <button
          type="button"
          onClick={() => {
            clearSelectedFile();
            setIsReplacing(true);
            setStatus("idle");
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all pt-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Replace With New 4K Picture
        </button>
      </div>
    );
  }

  // ─── UPLOAD STATE: FULL PROMPT + EMPTY UPLOADER DROPZONE ──────────────────
  return (
    <form onSubmit={submit} className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Full 4K Image Prompt Box */}
      <div className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.22em] text-accent">
              <Sparkles className="h-4 w-4" />
              Professional 4K Image Prompt
            </span>
            {imagePrompt?.length ? (
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-mono font-bold text-accent border border-accent/20">
                {imagePrompt.length} chars
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={copyPromptText}
            className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-accent transition-all hover:bg-accent/20 hover:scale-105 active:scale-95 shadow-sm"
          >
            {copiedPrompt ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Full Prompt</span>
              </>
            )}
          </button>
        </div>

        {/* Full prompt without restrictive clipping */}
        <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4 md:p-5 font-mono text-xs md:text-sm leading-relaxed text-foreground select-all whitespace-pre-wrap break-words">
          {imagePrompt || "Standard technical service cover photo required."}
        </div>

        {negativePrompt ? (
          <div className="mt-4 border-t border-border pt-3.5 text-xs leading-relaxed text-muted-foreground">
            <span className="font-bold text-destructive">Negative Prompt:</span>{" "}
            <span className="font-mono text-[11px] text-foreground/80">{negativePrompt}</span>
          </div>
        ) : null}
      </div>

      {/* 2. Empty Upload Dropzone */}
      <div className="space-y-4">
        <label className="group relative block cursor-pointer rounded-2xl border-2 border-dashed border-border bg-card p-8 md:p-10 text-center transition-all hover:border-accent/60 hover:bg-accent/5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-transform group-hover:scale-110 shadow-inner">
            <Upload className="h-7 w-7" />
          </div>
          <span className="mt-4 block text-base font-bold text-card-foreground">
            Choose JPG, PNG, or WEBP Service Cover Image
          </span>
          <span className="mt-1.5 block text-xs font-medium text-muted-foreground">
            Click to browse or drag and drop your image (Ultra-HD 4K recommended • Max 12MB)
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onFileChange}
            className="sr-only"
          />
        </label>

        {/* 3. Selected New Image Preview (Only when file is chosen) */}
        {file && selectedPreview ? (
          <div className="space-y-3 rounded-2xl border border-accent/40 bg-accent/5 p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold text-accent">
                <ImageIcon className="h-4 w-4" />
                Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
              <button
                type="button"
                onClick={clearSelectedFile}
                className="text-xs font-bold text-muted-foreground hover:text-destructive transition-colors"
              >
                Remove
              </button>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border shadow-2xl">
              <Image
                src={selectedPreview}
                alt="Selected service cover preview"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* 4. Action Buttons */}
      <div className="flex gap-3">
        {isReplacing && (
          <button
            type="button"
            onClick={() => {
              clearSelectedFile();
              setIsReplacing(false);
              setStatus("success");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-4 text-sm font-bold text-foreground hover:bg-muted transition"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={status === "uploading" || !file}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-accent-foreground shadow-xl transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "uploading" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Uploading to Cloudinary...</span>
            </>
          ) : file ? (
            <>
              <Upload className="h-5 w-5" />
              <span>Save Cover Photo & Publish</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span>Select an Image to Publish</span>
            </>
          )}
        </button>
      </div>

      {/* 5. Status / Error Message Banner */}
      {message ? (
        <div
          aria-live="polite"
          className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/60 p-3.5 text-sm text-foreground"
        >
          {status === "error" ? (
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          )}
          <span>{message}</span>
        </div>
      ) : null}
    </form>
  );
}
