"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  ImageIcon,
  FileText,
  Search,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";

export default function AIBlogProgress({
  isOpen,
  onClose,
  onComplete,
  mode = "text",
  blogId = null,
  autoGenerateImages = false,
}) {
  const [steps, setSteps] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("STARTING");
  const [blogPreview, setBlogPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);

  const [pendingBlogId, setPendingBlogId] = useState(null);
  const activeSourceRef = useRef(null);

  const startPipeline = (url) => {
    const eventSource = new EventSource(url);
    activeSourceRef.current = eventSource;
    let finished = false;

    // Warn on long-running steps, but keep the stream open.
    let timeoutId = setTimeout(() => {
      if (!finished) {
        console.warn("No AI progress update received in 45s");
        toast.warning("AI is still working. Keeping the live connection open.");
      }
    }, 45000);

    eventSource.onmessage = (event) => {
      clearTimeout(timeoutId); // Reset long-step warning on each message
      timeoutId = setTimeout(() => {
        if (!finished) {
          console.warn("No AI progress update received in 45s");
          toast.warning("AI is still working. Keeping the live connection open.");
        }
      }, 45000);

      const data = JSON.parse(event.data);
      console.log("AI Progress:", data);

      setCurrentStatus(data.status);

      if (data.status === "CONTENT_READY") {
        setBlogPreview({
          title: data.details?.title,
          summary: data.details?.summary,
        });
      }

      if (data.status === "COMPLETED") {
        finished = true;
        eventSource.close();
        clearTimeout(timeoutId);

        if (data.details?.workflowStatus === "content_ready" && data.details?.blogId) {
          const nextBlogId = data.details.blogId;
          setPendingBlogId(nextBlogId);
          const generateImage = autoGenerateImages ? "true" : "false";
          startPipeline(
            `/api/ai/generate-blog?action=finalize&id=${encodeURIComponent(nextBlogId)}&generateImage=${generateImage}`,
          );
          return;
        }

        if (data.details?.url) setImagePreview(data.details.url);
        toast.dismiss();

        // Check if image is being generated in background
        if (data.details?.workflowStatus === "blog_completed") {
          toast.success("✅ Blog created! Image generating in background (~2 min)");
        } else if (data.details?.emailSent) {
          toast.success("Secure upload email sent to Super Admin.");
        } else if (data.details?.workflowStatus === "manual_required") {
          toast.warning("Manual upload required. Email was not confirmed.");
        } else {
          toast.success(data.details?.message || "AI workflow completed.");
        }

        setTimeout(() => {
          onComplete?.();
          onClose();
        }, 900);
      }

      if (data.status === "MANUAL_IMAGE_REQUIRED" && data.details?.emailSent) {
        toast.success("Image email sent. Waiting for manual upload.");
      }

      if (data.status === "IMAGE_READY") {
        setImagePreview(data.details?.url);
      }

      if (data.status === "ERROR" || data.status === "FAILED") {
        setError(data.details?.message || "An unexpected error occurred");
      }

      setSteps((prev) => [
        ...prev,
        {
          id: `${data.status}-${Date.now()}-${Math.random()}`,
          status: data.status,
          message: data.details?.message || data.status,
          retry: data.retryCount || 0,
        },
      ]);
    };

    eventSource.onerror = () => {
      if (finished) return;
      clearTimeout(timeoutId);
      console.error("EventSource error:", eventSource.readyState);

      // ReadyState 2 = CLOSED, 0 = CONNECTING
      if (eventSource.readyState === 2) {
        setError(
          "⏳ Connection lost. The pipeline might still be running in the background. Check back in 1-2 minutes.",
        );
        toast.info("✅ Your blog generation is still processing on our servers.");
      }
      eventSource.close();
    };

    return eventSource;
  };

  useEffect(() => {
    if (!isOpen) {
      queueMicrotask(() => {
        setSteps([]);
        setCurrentStatus("STARTING");
        setBlogPreview(null);
        setImagePreview(null);
        setError(null);
        setPendingBlogId(null);
      });
      return;
    }

    const generateImage = autoGenerateImages ? "true" : "false";
    let url = `/api/ai/generate-blog?action=init&generateImage=${generateImage}`;
    if (mode === "image" && blogId) {
      url = `/api/ai/generate-blog?action=finalize&id=${blogId}&generateImage=${generateImage}`;
    }

    startPipeline(url);
    return () => activeSourceRef.current?.close();
  }, [isOpen, mode, blogId, autoGenerateImages]);

  const handleDecision = (generateImage) => {
    setPendingBlogId(null);
    startPipeline(
      `/api/ai/generate-blog?action=finalize&id=${pendingBlogId}&generateImage=${generateImage}`,
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-3xl overflow-hidden rounded-[26px] border border-white/[0.1] bg-[#0d1727] shadow-[0_35px_100px_-35px_rgba(0,0,0,.95)]"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-violet-400/[0.08] blur-3xl" />
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-white/[0.08] px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="relative grid size-11 place-items-center rounded-2xl bg-violet-400/10 text-violet-300 ring-1 ring-inset ring-violet-400/15">
              <Sparkles className="size-5 animate-pulse" />
              <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#0d1727] bg-emerald-300" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.22em] text-violet-300">AI writing assistant</p>
              <h2 className="mt-1 text-base font-semibold text-white sm:text-lg">
                {mode === "image" ? "Generating article visual" : "Creating a new article"}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl border border-white/[0.08] text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
          >
            <XCircle className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="relative grid max-h-[72vh] grid-cols-1 gap-0 overflow-y-auto md:grid-cols-[.9fr_1.1fr]">
          {/* Left: Progress Log */}
          <div className="border-b border-white/[0.07] p-5 sm:p-7 md:border-b-0 md:border-r">
            <div className="mb-5 flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-slate-600">Generation progress</p><h3 className="mt-1 text-sm font-semibold text-slate-200">Live activity</h3></div><span className="rounded-full border border-violet-400/15 bg-violet-400/[0.07] px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-violet-300">{currentStatus.replaceAll("_", " ")}</span></div>
            <div className="relative space-y-1 before:absolute before:bottom-4 before:left-[7px] before:top-4 before:w-px before:bg-white/[0.07]">
              {steps.map((step, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={step.id}
                  className="relative flex gap-3 rounded-xl px-0 py-2.5 text-xs"
                >
                  <div className="mt-0.5">
                    {step.status === "COMPLETED" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : step.status === "ERROR" ||
                      step.status === "REJECTED" ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : step.status === "RETRYING" ? (
                      <RefreshCcw className="w-4 h-4 text-amber-500 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium leading-5 text-slate-300">
                      {step.retry > 0 && (
                        <span className="text-amber-500 mr-1">
                          [Retry {step.retry}]
                        </span>
                      )}
                      {step.message}
                    </p>
                    <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-700">
                      {step.status}
                    </p>
                  </div>
                </motion.div>
              ))}
              {steps.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/[0.08] px-4 py-8 text-center"><Loader2 className="mx-auto size-5 animate-spin text-violet-300" /><p className="mt-3 text-xs text-slate-600">Preparing the AI workspace...</p></div>
              )}
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="space-y-5 bg-white/[0.018] p-5 sm:p-7">
            <div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-slate-600">Live result</p><h3 className="mt-1 text-sm font-semibold text-slate-200">Article preview</h3></div>

            {/* Image Preview */}
            <div className="group relative aspect-video overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950/40">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Muhyo Tech AI-generated blog cover preview"
                  className="w-full h-full object-cover animate-in fade-in duration-1000"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700">
                  <ImageIcon
                    className={`w-8 h-8 mb-2 ${currentStatus === "GENERATING_IMAGE" ? "animate-bounce text-accent/50" : ""}`}
                  />
                  <span className="text-[9px] font-bold uppercase tracking-widest">
                    Preparing visual
                  </span>
                </div>
              )}
            </div>

            {/* Blog Preview */}
            <div className="space-y-2">
              {blogPreview ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-1"
                >
                  <h4 className="text-base font-semibold leading-snug text-slate-100">
                    {blogPreview.title}
                  </h4>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
                    {blogPreview.summary}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  <div className="h-4 bg-muted/50 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-muted/50 rounded w-full animate-pulse" />
                  <div className="h-3 bg-muted/50 rounded w-5/6 animate-pulse" />
                </div>
              )}
            </div>

            {/* Final Status */}
            {currentStatus === "COMPLETED" && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] p-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-xs font-semibold text-emerald-300">
                  Article generation completed
                </span>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-3 text-red-500">
                <XCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-tight">
                  {error}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex items-center justify-center gap-2 border-t border-white/[0.07] px-6 py-4">
          <span className={`size-1.5 rounded-full ${currentStatus === "COMPLETED" ? "bg-emerald-300" : "animate-pulse bg-violet-300"}`} />
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
            {currentStatus === "COMPLETED"
              ? "Workflow completed successfully"
              : "Keep this window open while AI is working"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
