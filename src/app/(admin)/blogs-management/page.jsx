"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, FileText, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function BlogsManagement() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => setBlogs(data.blogs));
  }, []);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-white tracking-widest uppercase">
            Content Management
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Thought Leadership & Technical Articles
          </p>
        </div>
        <button className="px-10 py-5 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3 active:scale-95">
          <Plus className="w-4 h-4" /> Create Insight Entry
        </button>
      </div>

      <div className="w-full relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
        <input
          placeholder="Filter Articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 p-5 pl-14 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 shadow-xl"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {blogs.map((b, i) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-10 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/30 transition-all group flex flex-col h-full"
          >
            <div className="flex items-center gap-3 mb-6 text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] border-b border-slate-800 pb-4">
              <Calendar className="w-3" /> {b.date}
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">
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
                    className="w-2 h-2 rounded-full border-1.5 border-slate-500 flex-shrink-0"
                    title="This is a template from data.js - not uploaded yet"
                  />
                )}
              </div>
              <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed italic">
                "{b.summary}"
              </p>
            </div>

            <div className="mt-10 flex border-t border-slate-800 pt-6 gap-3">
              <button className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-blue-500 transition-all">
                <Edit2 className="w-4 h-4" />
              </button>
              <button className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-red-500/60 hover:text-red-500 hover:border-red-500/10 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
              <button className="ml-auto px-6 py-2 rounded-xl bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-all flex items-center gap-2">
                <FileText className="w-4 h-4" /> Full Preview
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
