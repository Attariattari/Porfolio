"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Wand2,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  FileText,
  RotateCcw,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  X,
  Check,
} from "lucide-react";
import { getSafeImageSrc } from "@/lib/images/getSafeImageSrc";
import useAdminStore from "@/lib/store/adminStore";

export default function BlogOptimizerPage() {
  const { sidebarCollapsed } = useAdminStore();
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    optimized: 0,
    pending: 0,
    avgOriginalScore: 65,
    avgOptimizedScore: 92,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected blog state for side-by-side comparison modal/view
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [saving, setSaving] = useState(false);

  // Bulk audit state
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    fetchAuditData();
  }, []);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog-audit");
      const data = await res.json();
      if (data.success) {
        setBlogs(data.data || []);
        if (data.stats) setStats(data.stats);
      } else {
        toast.error("Failed to load blog audit list");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while loading audit data");
    } finally {
      setLoading(false);
    }
  };

  const handleAuditSingleBlog = async (blog, forceReScan = false) => {
    setSelectedBlog(blog);
    setAuditResult(null);
    setAuditLoading(true);

    try {
      // If already optimized and NOT re-scanning, use fast GET route (ZERO AI calls)
      if (!forceReScan && (blog.auditStatus === "optimized" || blog.auditBackup?.content)) {
        const res = await fetch(`/api/admin/blog-audit/${blog._id}`);
        const data = await res.json();
        if (data.success) {
          setAuditResult(data);
        } else {
          toast.error("Failed to load saved comparison");
        }
        return;
      }

      // Re-scan or initial audit (calls AI Engine)
      const res = await fetch(`/api/admin/blog-audit/${blog._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoSave: false }),
      });
      const data = await res.json();
      if (data.success) {
        setAuditResult(data);
        toast.success(`AI Audit completed for "${blog.title.slice(0, 30)}..."`);
      } else {
        toast.error(data.error || "Failed to audit blog");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading blog comparison");
    } finally {
      setAuditLoading(false);
    }
  };

  const handleSaveOptimized = async () => {
    if (!selectedBlog || !auditResult) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/blog-audit/${selectedBlog._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: auditResult.optimized.title,
          summary: auditResult.optimized.summary,
          content: auditResult.optimized.content,
          seoTitle: auditResult.optimized.seoTitle,
          seoDescription: auditResult.optimized.seoDescription,
          metrics: auditResult.metrics,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Blog successfully updated with AI fixes!");
        setSelectedBlog(null);
        setAuditResult(null);
        fetchAuditData();
      } else {
        toast.error(data.error || "Failed to save audit fixes");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving blog updates");
    } finally {
      setSaving(false);
    }
  };

  const handleRevertOriginal = async (blogId) => {
    if (!confirm("Are you sure you want to revert this blog back to its original version?")) return;
    try {
      const res = await fetch(`/api/admin/blog-audit/${blogId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Blog reverted to original backup!");
        if (selectedBlog?._id === blogId) {
          setSelectedBlog(null);
          setAuditResult(null);
        }
        fetchAuditData();
      } else {
        toast.error(data.error || "Failed to revert blog");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error reverting blog");
    }
  };

  const handleBulkAudit = async () => {
    if (!confirm("Run AI Grammar & SEO Auto-Fixer across all old blogs? This will process blogs one-by-one.")) return;
    setBulkProcessing(true);
    setBulkProgress({ current: 0, total: blogs.length });
    try {
      const res = await fetch("/api/admin/blog-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "all", limit: 20 }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Processed ${data.processedCount} blogs with AI Auto-Fixer!`);
        fetchAuditData();
      } else {
        toast.error(data.error || "Bulk audit failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Bulk process error");
    } finally {
      setBulkProcessing(false);
    }
  };

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "optimized"
          ? b.auditStatus === "optimized"
          : statusFilter === "pending"
            ? !b.auditStatus || b.auditStatus === "pending"
            : b.auditStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-slate-900/60 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> AI Quality & SEO Auditor
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">AI Blog Grammar & SEO Optimizer</h1>
          <p className="text-slate-400 text-sm mt-1">
            Auto-correct spelling typos, fix sentence syntax, and boost Google SEO ranking keywords across all your blogs.
          </p>
        </div>

        <button
          onClick={handleBulkAudit}
          disabled={bulkProcessing}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all disabled:opacity-50"
        >
          {bulkProcessing ? (
            <>
              <RefreshCcw className="w-5 h-5 animate-spin" /> Processing Batch...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" /> ⚡ Auto-Fix All Old Blogs
            </>
          )}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-xl">
          <div className="text-slate-400 text-xs font-medium uppercase">Total Blogs</div>
          <div className="text-3xl font-bold text-white mt-2">{stats.total}</div>
        </div>

        <div className="bg-slate-900/50 border border-emerald-900/40 p-5 rounded-xl">
          <div className="text-emerald-400 text-xs font-medium uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> AI Optimized
          </div>
          <div className="text-3xl font-bold text-emerald-300 mt-2">{stats.optimized}</div>
        </div>

        <div className="bg-slate-900/50 border border-amber-900/40 p-5 rounded-xl">
          <div className="text-amber-400 text-xs font-medium uppercase flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> Pending Review
          </div>
          <div className="text-3xl font-bold text-amber-300 mt-2">{stats.pending}</div>
        </div>

        <div className="bg-slate-900/50 border border-cyan-900/40 p-5 rounded-xl">
          <div className="text-cyan-400 text-xs font-medium uppercase flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> SEO Health Boost
          </div>
          <div className="text-2xl font-bold text-cyan-300 mt-2">
            {stats.avgOriginalScore} <span className="text-slate-500 font-normal text-lg">→</span>{" "}
            <span className="text-emerald-400 font-extrabold">{stats.avgOptimizedScore} / 100</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search blog title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {["all", "pending", "optimized", "reverted"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${statusFilter === st
                  ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Blogs List */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-3">
          <RefreshCcw className="w-8 h-8 animate-spin text-cyan-400" />
          <p>Scanning blogs repository...</p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-300">No blogs found for this filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => {
            const imgSrc = getSafeImageSrc(blog.image || blog.featuredImage?.url);
            const isOptimized = blog.auditStatus === "optimized";

            return (
              <div
                key={blog._id}
                className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-lg hover:shadow-cyan-500/5 group"
              >
                {/* Cover Image Box */}
                <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                  <Image
                    src={imgSrc}
                    alt={blog.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {isOptimized ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-semibold shadow-md">
                        <CheckCircle2 className="w-3.5 h-3.5" /> AI Optimized
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 text-slate-950 text-xs font-semibold shadow-md">
                        <AlertCircle className="w-3.5 h-3.5" /> Needs Audit
                      </span>
                    )}
                  </div>

                  {/* Category Pill */}
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur px-2.5 py-0.5 rounded-md text-xs font-medium text-cyan-300 border border-slate-700">
                    {blog.category || "Web Engineering"}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                      {blog.summary || "No summary provided."}
                    </p>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => handleAuditSingleBlog(blog)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <Wand2 className="w-4 h-4" /> Audit & Preview Fixes <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {isOptimized && (
                      <button
                        onClick={() => handleRevertOriginal(blog._id)}
                        title="Revert to original"
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Side-by-Side Comparison & Audit Modal */}
      {selectedBlog && (
        <div
          className={`fixed inset-y-0 right-0 z-50 transition-[left] duration-300 flex items-center justify-center p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto left-0 ${sidebarCollapsed ? "lg:left-20" : "lg:left-72"
            }`}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white line-clamp-1">{selectedBlog.title}</h2>
                  <p className="text-xs text-slate-400">AI Grammar, Syntax & SEO Side-by-Side Comparison</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedBlog(null);
                  setAuditResult(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {auditLoading ? (
                <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
                  <RefreshCcw className="w-10 h-10 animate-spin text-cyan-400" />
                  <p className="text-base font-semibold text-white">AI Proofreader & SEO Master is reviewing...</p>
                  <p className="text-xs text-slate-400">Checking typos, sentence syntax, and keyword intent</p>
                </div>
              ) : auditResult ? (
                <div className="space-y-6">
                  {/* Metrics Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                        {auditResult.metrics?.errorsFixedCount || 0}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-400">Errors Corrected</div>
                        <div className="text-sm font-semibold text-emerald-300">Spelling & Syntax fixes</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                        {auditResult.metrics?.keywordsAdded?.length || 0}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-400">SEO Keywords Added</div>
                        <div className="text-sm font-semibold text-cyan-300">Natural search phrase optimization</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                        {auditResult.metrics?.originalScore} → {auditResult.metrics?.optimizedScore}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-400">SEO Health Score</div>
                        <div className="text-sm font-semibold text-blue-300">Readability & Ranking Quality</div>
                      </div>
                    </div>
                  </div>

                  {/* SEO Keyword Pills */}
                  {auditResult.metrics?.keywordsAdded?.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Enhanced Keywords:
                      </span>
                      {auditResult.metrics.keywordsAdded.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium"
                        >
                          + {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Side-by-Side Diff Panels */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Original Panel */}
                    <div className="bg-slate-950 border border-rose-900/30 rounded-2xl p-5 flex flex-col">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-rose-900/20">
                        <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" /> Original Version (With Typos/Syntax)
                        </span>
                        <span className="text-xs text-slate-500">Score: {auditResult.metrics?.originalScore}/100</span>
                      </div>

                      <div className="space-y-4 text-xs font-mono text-slate-300 overflow-y-auto max-h-96 pr-2">
                        <div>
                          <div className="text-slate-500 font-sans text-xs font-semibold mb-1">Title:</div>
                          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-slate-200">
                            {auditResult.original.title}
                          </div>
                        </div>

                        <div>
                          <div className="text-slate-500 font-sans text-xs font-semibold mb-1">Summary:</div>
                          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-slate-200">
                            {auditResult.original.summary}
                          </div>
                        </div>

                        <div>
                          <div className="text-slate-500 font-sans text-xs font-semibold mb-1">Content Preview:</div>
                          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-12">
                            {auditResult.original.content}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Optimized Panel */}
                    <div className="bg-slate-950 border border-emerald-900/40 rounded-2xl p-5 flex flex-col">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-900/20">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4" /> AI Corrected Version (Cleaned & SEO Enhanced)
                        </span>
                        <span className="text-xs text-emerald-400 font-bold">
                          Score: {auditResult.metrics?.optimizedScore}/100
                        </span>
                      </div>

                      <div className="space-y-4 text-xs font-mono text-slate-300 overflow-y-auto max-h-96 pr-2">
                        <div>
                          <div className="text-slate-500 font-sans text-xs font-semibold mb-1">Title:</div>
                          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-200 font-bold">
                            {auditResult.optimized.title}
                          </div>
                        </div>

                        <div>
                          <div className="text-slate-500 font-sans text-xs font-semibold mb-1">Summary:</div>
                          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-slate-200">
                            {auditResult.optimized.summary}
                          </div>
                        </div>

                        <div>
                          <div className="text-slate-500 font-sans text-xs font-semibold mb-1">Content Preview:</div>
                          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-slate-200 whitespace-pre-wrap leading-relaxed line-clamp-12">
                            {auditResult.optimized.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            {auditResult && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
                <button
                  onClick={() => handleAuditSingleBlog(selectedBlog)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <RefreshCcw className="w-4 h-4" /> Re-Scan with AI
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedBlog(null);
                      setAuditResult(null);
                    }}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveOptimized}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <RefreshCcw className="w-4 h-4 animate-spin" /> Saving Fixes...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Approve & Apply to Website
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
