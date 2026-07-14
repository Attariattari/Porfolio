"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  ExternalLink,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { uploadPendingImages } from "@/lib/uploadHelper";
import ImageUploader from "@/components/admin/ImageUploader";
import { Controller } from "react-hook-form";
import { z } from "zod";
import FormModal from "@/components/admin/FormModal";

const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  purpose: z.string().min(1, "Purpose is required"),
  techStack: z.string().min(1, "Tech stack is required (comma separated)"),
  images: z.array(z.any()).min(1, "At least one image is required"),
});

export default function ProjectsManagement() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || []))
      .catch(err => console.error("Error fetching projects:", err));
  }, []);

  const handleOpenModal = (project = null) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const onSubmit = async (data) => {
    try {
      // 1. Upload any pending images first
      const finalImageUrls = await uploadPendingImages(data.images);

      // Convert techStack string to array
      const formattedData = {
        ...data,
        images: finalImageUrls,
        techStack: typeof data.techStack === 'string' ? data.techStack.split(',').map(s => s.trim()) : data.techStack
      };

      console.log("Submitting project data:", formattedData);
      
      toast.success(editingProject ? "Project updated!" : "Project created!");
      handleCloseModal();
      
      // Refresh list (mock)
      setProjects(prev => editingProject 
        ? prev.map(p => p.id === editingProject.id ? { ...p, ...formattedData } : p)
        : [...prev, { id: Date.now().toString(), ...formattedData }]
      );
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || "Operation failed");
    }
  };

  const fields = [
    { name: "title", label: "Project Title", placeholder: "e.g. Quantum E-Commerce", required: true },
    { name: "category", label: "Category", placeholder: "e.g. Web / Mobile / UI/UX", required: true },
    { name: "purpose", label: "Purpose", placeholder: "e.g. SAAS / Portfolio / Retail", required: true },
    { name: "techStack", label: "Tech Stack (Comma Separated)", placeholder: "Next.js, Tailwind, MongoDB", required: true },
    { name: "description", label: "Description", type: "textarea", placeholder: "Explain the project impact...", fullWidth: true, required: true },
    { 
      name: "images", 
      label: "Project Media Gallery", 
      type: "custom", 
      fullWidth: true,
      required: true,
      render: ({ control }) => (
        <Controller
          name="images"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <ImageUploader 
              images={field.value} 
              onChange={field.onChange} 
            />
          )}
        />
      )
    },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-white tracking-widest uppercase italic">
            Project Management
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Organize & Architect Your Portfolio
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-10 py-5 rounded-2xl bg-accent text-accent-foreground font-black uppercase text-xs tracking-widest hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 flex items-center gap-3 active:scale-95 group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Add New Case Study
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="w-full relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-accent transition-colors" />
          <input
            placeholder="Search Projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 p-5 pl-14 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-accent transition-all placeholder:text-slate-700 shadow-2xl"
          />
        </div>
        <button className="px-8 py-5 rounded-2xl border border-slate-800 bg-slate-900 text-slate-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:text-white transition-colors">
          <Filter className="w-4 h-4" /> Filter By Stack
        </button>
      </div>

      <div className="overflow-x-auto rounded-[2.5rem] border border-white/5 bg-slate-900/40 backdrop-blur-3xl shadow-3xl">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="border-b border-white/5 bg-slate-900/50">
            <tr>
              <th className="p-10 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">
                Project Title
              </th>
              <th className="p-10 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">
                Category
              </th>
              <th className="p-10 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">
                Tech Stack
              </th>
              <th className="p-10 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">
                Status
              </th>
              <th className="p-10 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase())).map((p, i) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-white/[0.02] transition-colors group"
              >
                <td className="p-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 overflow-hidden border border-white/5 shadow-xl">
                      <img
                        src={p.thumbnail || p.images?.[0] || `https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=200`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                        alt={`Muhyo Tech project preview for ${p.title}`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-base font-black text-white group-hover:text-accent transition-colors italic">
                          {p.title}
                        </div>
                        {!p._isFromDataJs && (
                          <div 
                            className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50 group-hover:scale-125 transition-transform"
                            title="This project is already uploaded to the database"
                          />
                        )}
                        {p._isFromDataJs && (
                          <div 
                            className="w-2.5 h-2.5 rounded-full border-2 border-slate-500 group-hover:scale-125 transition-transform"
                            title="This is a template from data.js - not uploaded yet"
                          />
                        )}
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                        {p.purpose}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-10">
                  <span className="px-4 py-1.5 rounded-full bg-accent/5 border border-accent/20 text-[9px] font-black uppercase text-accent tracking-widest">
                    {p.category}
                  </span>
                </td>
                <td className="p-10">
                  <div className="flex flex-wrap gap-2">
                    {p.techStack?.map((t) => (
                      <span
                        key={t}
                        className="text-[8px] font-bold px-2 py-1 rounded-lg bg-slate-800 border border-white/5 text-slate-400 tracking-widest uppercase"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-10">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      Live
                    </span>
                  </div>
                </td>
                <td className="p-10 text-right">
                  <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-4">
                    <button 
                      onClick={() => handleOpenModal(p)}
                      className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-accent transition-all hover:scale-110"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-3 rounded-xl bg-slate-800 text-red-500/60 hover:text-white hover:bg-red-500 transition-all hover:scale-110">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-white/10 transition-all hover:scale-110">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProject ? "Update Architecture" : "Assemble New Project"}
        schema={projectSchema}
        defaultValues={editingProject ? {
            ...editingProject,
            techStack: editingProject.techStack?.join(", ")
        } : { images: [] }}
        onSubmit={onSubmit}
        fields={fields}
      />

      <div className="mt-10 flex justify-center">
        <button className="text-[9px] font-black uppercase text-slate-700 tracking-[0.5em] hover:text-accent transition-colors">
          System Core Online // Port v2.4
        </button>
      </div>
    </div>
  );
}
