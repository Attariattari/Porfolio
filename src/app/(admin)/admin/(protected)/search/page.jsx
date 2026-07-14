"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Search, 
  Loader2, 
  FileText, 
  Briefcase, 
  Settings as SettingsIcon, 
  Users, 
  ChevronRight,
  Database,
  Inbox
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function AdminSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) return;

    let cancelled = false;
    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!cancelled && data.success) {
          setResults(data.data);
        } else if (!cancelled) {
          setError(data.error);
        }
      } catch {
        if (!cancelled) setError("Failed to fetch search results.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    const timer = window.setTimeout(performSearch, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const groupedResults = results.reduce((acc, curr) => {
    if (!acc[curr.type]) acc[curr.type] = [];
    acc[curr.type].push(curr);
    return acc;
  }, {});

  const getTypeIcon = (type) => {
    switch (type) {
      case "Blog": return <FileText className="w-5 h-5 text-blue-500" />;
      case "Project": return <Briefcase className="w-5 h-5 text-emerald-500" />;
      case "Service": return <Database className="w-5 h-5 text-purple-500" />;
      case "User": return <Users className="w-5 h-5 text-amber-500" />;
      default: return <SettingsIcon className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
            Search <span className="text-accent underline decoration-accent/20 underline-offset-8">Intelligence</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-4 font-medium tracking-widest uppercase">
            Global resources query across all authorized modules.
          </p>
        </div>
        
        <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-black text-white/50 uppercase tracking-widest">
            Results for: <span className="text-accent italic">&ldquo;{query}&rdquo;</span>
          </span>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
              <Loader2 className="w-8 h-8 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">
              Scanning Database...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-center">
            <p className="text-red-500 font-bold uppercase tracking-widest text-xs">{error}</p>
          </div>
        ) : Object.keys(groupedResults).length > 0 ? (
          Object.entries(groupedResults).map(([type, items]) => (
            <section key={type} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5" />
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-600 flex items-center gap-3">
                  {getTypeIcon(type)}
                  {type}s
                  <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-slate-500">
                    {items.length}
                  </span>
                </h2>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.route}
                    className="group p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 flex items-center justify-between shadow-xl"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 truncate-2-lines leading-relaxed pr-4 italic">
                        {item.description || "No description available for this record."}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg">
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-black transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 opacity-40">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Inbox className="w-10 h-10 text-slate-500" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                Zero Matches Found
              </h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest max-w-[200px] leading-relaxed">
                The query yielded no results within our neural index.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
