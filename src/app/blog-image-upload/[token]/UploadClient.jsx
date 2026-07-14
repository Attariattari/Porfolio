"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload, Copy, Check, CheckCircle2, AlertCircle } from "lucide-react";

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

export default function UploadClient({ token, imagePrompt, negativePrompt }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);
  const redirectTimerRef = useRef(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => () => {
    window.clearTimeout(copyTimerRef.current);
    window.clearTimeout(redirectTimerRef.current);
  }, []);

  const onFileChange = (event) => {
    const selected = event.target.files?.[0];
    setFile(selected || null);
    setPreview(selected ? URL.createObjectURL(selected) : "");
    setStatus("idle");
    setMessage("");
  };

  const copyPrompt = async () => {
    try {
      await writeToClipboard(
        [imagePrompt, negativePrompt ? `Negative prompt: ${negativePrompt}` : ""]
          .filter(Boolean)
          .join("\n\n"),
      );
      setCopied(true);
      window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setStatus("error");
      setMessage("Could not copy the prompt. Please select and copy it manually.");
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!file) {
      setMessage("Please choose an image first.");
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
        throw new Error(data.message || "Upload failed.");
      }

      setStatus("success");
      setMessage("Image uploaded. Opening the blog...");
      redirectTimerRef.current = window.setTimeout(() => {
        window.location.assign(data.redirectUrl);
      }, 700);
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Image upload failed. Please try again.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-2xl border border-border bg-muted/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-accent">
            Image Prompt
          </p>
          <button
            type="button"
            onClick={copyPrompt}
            aria-label={copied ? "Prompt copied" : "Copy image prompt"}
            className="inline-flex min-w-24 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-card-foreground transition-colors hover:border-accent/50 hover:bg-accent/10"
          >
            {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
          {imagePrompt}
        </p>
        {negativePrompt ? (
          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            Negative: {negativePrompt}
          </p>
        ) : null}
      </div>

      <label className="block cursor-pointer rounded-2xl border border-dashed border-border bg-card p-6 text-center transition-colors hover:border-accent/60 hover:bg-accent/5">
        <Upload className="mx-auto h-8 w-8 text-accent" />
        <span className="mt-3 block text-sm font-bold text-card-foreground">
          Choose JPG, PNG, or WEBP image
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
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border">
          <Image
            src={preview}
            alt="Muhyo Tech selected blog cover preview"
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      ) : null}

      <button
        type="submit"
        disabled={status === "uploading" || status === "success"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "success" ? <CheckCircle2 className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
        {status === "uploading"
          ? "Uploading..."
          : status === "success"
            ? "Uploaded"
            : "Save Blog Image"}
      </button>

      {message ? (
        <div aria-live="polite" className="flex items-center gap-2 rounded-xl border border-border bg-muted/60 p-3 text-sm text-foreground">
          {status === "error" ? <AlertCircle className="h-4 w-4 text-destructive" /> : <CheckCircle2 className="h-4 w-4 text-accent" />}
          {message}
        </div>
      ) : null}
    </form>
  );
}

