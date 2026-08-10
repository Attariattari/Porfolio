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
  Share2,
  Globe,
  Sparkles,
  Twitter,
  Linkedin,
  Facebook,
  FileText,
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

export default function UploadClient({ token, imagePrompt, negativePrompt }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [uploadData, setUploadData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeSocialTab, setActiveSocialTab] = useState("linkedin"); // linkedin, twitter, devto
  const [copiedPlatform, setCopiedPlatform] = useState("");

  const copyTimerRef = useRef(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => () => {
    window.clearTimeout(copyTimerRef.current);
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
          .join("\n\n")
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
      setUploadData(data);
      setShowSuccessModal(true);
      setMessage("Image uploaded successfully! Choose an option below.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Image upload failed. Please try again.");
    }
  };

  const copySocialText = async (platform, text) => {
    try {
      await writeToClipboard(text);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(""), 2000);
    } catch {
      alert("Failed to copy text");
    }
  };

  return (
    <div className="space-y-6">
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
            ? "Uploading Image..."
            : status === "success"
            ? "Upload Complete"
            : "Save Blog Image"}
        </button>

        {message ? (
          <div aria-live="polite" className="flex items-center gap-2 rounded-xl border border-border bg-muted/60 p-3 text-sm text-foreground">
            {status === "error" ? <AlertCircle className="h-4 w-4 text-destructive" /> : <CheckCircle2 className="h-4 w-4 text-accent" />}
            {message}
          </div>
        ) : null}
      </form>

      {/* Glassmorphic Success Options Card */}
      {status === "success" && uploadData && (
        <div className="mt-8 overflow-hidden rounded-3xl border border-accent/40 bg-card p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                Workflow Complete
              </span>
              <h2 className="text-lg font-bold text-card-foreground">
                Image Saved & Blogger Post Triggered!
              </h2>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            What would you like to do next for <strong>"{uploadData.blogTitle}"</strong>?
          </p>

          {/* 2 Big Action Option Buttons */}
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href={uploadData.redirectUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col items-center justify-center p-5 rounded-2xl border border-border bg-muted/40 hover:bg-accent/10 hover:border-accent/50 transition-all text-center space-y-2"
            >
              <Globe className="h-7 w-7 text-accent group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-card-foreground">1. Open Website Blog</span>
              <span className="text-[11px] text-muted-foreground">View live article on muhyotech.com</span>
            </a>

            <button
              type="button"
              onClick={() => setShowSuccessModal(!showSuccessModal)}
              className="group flex flex-col items-center justify-center p-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all text-center space-y-2"
            >
              <Share2 className="h-7 w-7 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-cyan-300">2. Open AI Social Share Kit</span>
              <span className="text-[11px] text-muted-foreground">1-Click Twitter, LinkedIn & Dev.to posts</span>
            </button>
          </div>

          {/* Embedded AI Social Share Kit Container */}
          {showSuccessModal && uploadData.socialKit && (
            <div className="mt-6 border-t border-border pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" /> AI Generated Social Posts
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {["linkedin", "facebook", "x", "whatsapp", "reddit", "instagram", "devto"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveSocialTab(tab)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        activeSocialTab === tab
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab === "x" ? "X / Twitter" : tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Content Box */}
              <div className="relative rounded-2xl border border-border bg-background p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold capitalize text-accent">
                    {activeSocialTab} Share Post
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copySocialText(
                        activeSocialTab,
                        uploadData.socialKit[activeSocialTab]?.postText ||
                          uploadData.socialKit[activeSocialTab] ||
                          ""
                      )
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all"
                  >
                    {copiedPlatform === activeSocialTab ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy Post
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs leading-relaxed text-muted-foreground font-mono bg-muted/30 p-3 rounded-xl max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {typeof uploadData.socialKit[activeSocialTab] === "object"
                    ? uploadData.socialKit[activeSocialTab]?.postText
                    : uploadData.socialKit[activeSocialTab] || "Generating post..."}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
