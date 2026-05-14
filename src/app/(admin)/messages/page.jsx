"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Clock,
  Trash2,
  CheckCircle2,
  MoreVertical,
  MessageSquare,
} from "lucide-react";

const messages = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    date: "2024-03-02 14:30",
    message:
      "Hi Alex, I love your portfolio. Can we discuss a Next.js 15 project?",
    objective: "Project Idea",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@work.io",
    date: "2024-03-01 10:15",
    message: "Hey, do you offer UI/UX consultation for existing apps?",
    objective: "Consultation",
  },
];

export default function MessagesManagement() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white tracking-widest uppercase">
          Member Messages
        </h1>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
          Inbound Communications & Enquiries
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto">
        {messages.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl group hover:border-blue-500/30 transition-all flex flex-col md:flex-row gap-8 items-start relative overflow-hidden"
          >
            {/* Read Indicator */}
            <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-100 transition-opacity">
              <button className="text-slate-500 hover:text-white">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-500 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>

            <div className="flex-grow space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white tracking-wide">
                    {m.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-500 mt-1 italic">
                    <span>{m.email}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="text-blue-500 uppercase text-[10px] tracking-widest">
                      {m.objective}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-600 tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  <Clock className="w-4 h-4" /> {m.date}
                </div>
              </div>
              <p className="text-sm font-medium text-slate-300 leading-relaxed italic border-l-4 border-slate-800 pl-6 py-2 bg-slate-800/20 rounded-r-xl">
                "{m.message}"
              </p>

              <div className="pt-4 flex gap-4">
                <button className="px-6 py-2 rounded-xl bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-blue-500/20">
                  <Mail className="w-4 h-4" /> Reply
                </button>
                <button className="px-6 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Archive
                </button>
                <button className="px-6 py-2 rounded-xl text-red-500/40 hover:text-red-500 hover:bg-red-500/10 font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 ml-auto">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
