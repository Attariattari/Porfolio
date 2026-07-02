"use client";

import { useState } from "react";
import { Upload, Copy, CheckCircle2, AlertCircle } from "lucide-react";

export default function UploadClient({ token, imagePrompt, negativePrompt }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const onFileChange = (event) => {
    const selected = event.target.files?.[0];
    setFile(selected || null);
    setPreview(selected ? URL.createObjectURL(selected) : "");
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(
      [imagePrompt, negativePrompt ? `Negative prompt: ${negativePrompt}` : ""]
        .filter(Boolean)
        .join("\n\n"),
    );
    setMessage("Prompt copied.");
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

    const res = await fetch(`/api/blog-image-upload/${token}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.success) {
      setStatus("success");
      setMessage(data.message);
    } else {
      setStatus("error");
      setMessage(data.message || "Upload failed.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
            Image Prompt
          </p>
          <button
            type="button"
            onClick={copyPrompt}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/10"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">
          {imagePrompt}
        </p>
        {negativePrompt ? (
          <p className="mt-3 text-xs leading-6 text-slate-400">
            Negative: {negativePrompt}
          </p>
        ) : null}
      </div>

      <label className="block rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-6 text-center hover:bg-white/[0.06]">
        <Upload className="mx-auto h-8 w-8 text-emerald-300" />
        <span className="mt-3 block text-sm font-bold text-white">
          Choose JPG, PNG, or WEBP image
        </span>
        <span className="mt-1 block text-xs text-slate-400">Max size 8MB</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileChange}
          className="sr-only"
        />
      </label>

      {preview ? (
        <img
          src={preview}
          alt="Selected blog cover preview"
          className="aspect-video w-full rounded-2xl object-cover"
        />
      ) : null}

      <button
        type="submit"
        disabled={status === "uploading" || status === "success"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-950 disabled:opacity-60"
      >
        {status === "success" ? <CheckCircle2 className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
        {status === "uploading"
          ? "Uploading..."
          : status === "success"
            ? "Uploaded"
            : "Save Blog Image"}
      </button>

      {message ? (
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200">
          {status === "error" ? <AlertCircle className="h-4 w-4 text-red-400" /> : <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
          {message}
        </div>
      ) : null}
    </form>
  );
}

