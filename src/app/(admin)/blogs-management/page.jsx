"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, FileText, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { motion } from "framer-motion";

export default function BlogsManagement() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 21;

  useEffect(() => {
    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => setBlogs(data.blogs || []));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch = (b.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.summary || "").toLowerCase().includes(search.toLowerCase());
    
    const status = (b.publishStatus || (b._isFromDataJs ? "published" : "draft")).toLowerCase();
    
    let matchesStatus = true;
    if (statusFilter === "published") {
      matchesStatus = status === "published" || !b._isFromDataJs;
    } else if (statusFilter === "pending") {
      matchesStatus = status === "pending" || b._isFromDataJs;
    }

    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredBlogs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-foreground tracking-widest uppercase">
            Content Management
          </h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Thought Leadership & Technical Articles (21 Per Page)
          </p>
        </div>
        <button className="px-10 py-5 rounded-2xl bg-accent text-foreground font-black uppercase text-xs tracking-widest hover:bg-accent transition-all shadow-xl shadow-accent/20 flex items-center gap-3 active:scale-95">
          <Plus className="w-4 h-4" /> Create Insight Entry
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full relative group flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <input
            placeholder="Filter Articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border p-5 pl-14 rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:border-accent transition-all placeholder:text-muted-foreground/70 shadow-xl"
          />
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto bg-card border border-border p-2 rounded-2xl shadow-xl">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              statusFilter === "all"
                ? "bg-accent text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({blogs.length})
          </button>
          <button
            onClick={() => setStatusFilter("published")}
            className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              statusFilter === "published"
                ? "bg-green-500/20 text-green-400 border border-green-500/30 shadow-md"
                : "text-muted-foreground hover:text-green-400"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Published
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              statusFilter === "pending"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md"
                : "text-muted-foreground hover:text-amber-400"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Pending
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {paginatedBlogs.map((b, i) => (
          <motion.div
            key={b.id || b._id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-10 rounded-3xl bg-card border border-border hover:border-accent/30 transition-all group flex flex-col h-full shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6 text-[10px] font-black uppercase text-accent tracking-[0.2em] border-b border-border pb-4">
              <Calendar className="w-3" /> {b.date || "Draft"}
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xl font-black text-foreground group-hover:text-accent transition-colors">
                  {b.title}
                </h3>
                {!b._isFromDataJs && (
                  <div
                    className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50 flex-shrink-0"
                    title="This blog is already uploaded to the database"
                  />
                )}
                {b._isFromDataJs && (
                  <div
                    className="w-2 h-2 rounded-full border-1.5 border-border flex-shrink-0"
                    title="This is a template from data.js - not uploaded yet"
                  />
                )}
              </div>
              <p className="text-sm font-medium text-muted-foreground line-clamp-2 leading-relaxed italic">
                &ldquo;{b.summary}&rdquo;
              </p>
            </div>

            <div className="mt-10 flex border-t border-border pt-6 gap-3">
              <button className="p-3 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-accent transition-all">
                <Edit2 className="w-4 h-4" />
              </button>
              <button className="p-3 rounded-xl bg-card border border-border text-red-500/60 hover:text-red-500 hover:border-red-500/10 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
              <button className="ml-auto px-6 py-2 rounded-xl bg-muted text-foreground font-black uppercase text-[10px] tracking-widest hover:bg-muted transition-all flex items-center gap-2">
                <FileText className="w-4 h-4" /> Full Preview
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-card border border-border rounded-2xl shadow-xl">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Showing <span className="text-foreground">{totalItems > 0 ? startIndex + 1 : 0}</span> to <span className="text-foreground">{endIndex}</span> of <span className="text-foreground">{totalItems}</span> articles (Page {safeCurrentPage} of {totalPages})
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={() => handlePageChange(1)}
              disabled={safeCurrentPage === 1}
              className="p-3 rounded-xl bg-card border border-border text-xs font-black hover:border-accent disabled:opacity-30 transition-all"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="px-4 py-3 rounded-xl bg-card border border-border text-xs font-black uppercase tracking-wider hover:border-accent disabled:opacity-30 flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 2)
                .map((p, i, arr) => {
                  const showEllipsis = i > 0 && p - arr[i - 1] > 1;
                  return (
                    <div key={p} className="flex items-center gap-1">
                      {showEllipsis && <span className="px-1 text-xs text-muted-foreground font-bold">...</span>}
                      <button
                        onClick={() => handlePageChange(p)}
                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                          p === safeCurrentPage
                            ? "bg-accent text-foreground shadow-lg shadow-accent/20"
                            : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-accent"
                        }`}
                      >
                        {p}
                      </button>
                    </div>
                  );
                })}
            </div>

            <button
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className="px-4 py-3 rounded-xl bg-card border border-border text-xs font-black uppercase tracking-wider hover:border-accent disabled:opacity-30 flex items-center gap-1 transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="p-3 rounded-xl bg-card border border-border text-xs font-black hover:border-accent disabled:opacity-30 transition-all"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
