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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-overlay/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-card border border-border w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/70 flex justify-between items-center bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground uppercase tracking-tight">
                AI Content Forge
              </h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                Autonomous Pipeline Active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          {/* Left: Progress Log */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
              Live Execution Log
            </h3>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={step.id}
                  className="flex gap-3 text-xs"
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
                    <p className="text-foreground/80 font-medium">
                      {step.retry > 0 && (
                        <span className="text-amber-500 mr-1">
                          [Retry {step.retry}]
                        </span>
                      )}
                      {step.message}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-mono mt-0.5">
                      {step.status}
                    </p>
                  </div>
                </motion.div>
              ))}
              {steps.length === 0 && (
                <p className="text-muted-foreground text-xs italic">
                  Initializing neural link...
                </p>
              )}
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="bg-overlay/40 rounded-xl border border-border/70 p-4 space-y-4">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
              Asset Generation
            </h3>

            {/* Image Preview */}
            <div className="aspect-video bg-muted/50 rounded-lg border border-border overflow-hidden relative group">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Muhyo Tech AI-generated blog cover preview"
                  className="w-full h-full object-cover animate-in fade-in duration-1000"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/80">
                  <ImageIcon
                    className={`w-8 h-8 mb-2 ${currentStatus === "GENERATING_IMAGE" ? "animate-bounce text-accent/50" : ""}`}
                  />
                  <span className="text-[9px] uppercase font-bold tracking-widest">
                    Visualizing...
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
                  <h4 className="text-sm font-bold text-foreground leading-tight">
                    {blogPreview.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-3 leading-relaxed">
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
              <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-xs font-bold text-green-500 uppercase tracking-tight">
                  Published to Network
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
        <div className="px-6 py-4 border-t border-border/70 bg-muted/50 text-center">
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
            {currentStatus === "COMPLETED"
              ? "System Idle - Success"
              : "AI Agent Protocol in Progress"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
