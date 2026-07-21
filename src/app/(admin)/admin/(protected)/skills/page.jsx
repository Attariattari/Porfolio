"use client";

import { useState, useEffect } from "react";
import useAdminStore from "@/lib/store/adminStore";
import FormModal from "@/components/admin/FormModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { z } from "zod";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Braces, Code2, Pencil, Plus, Search, Trash2, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

const skillSchema = z.object({
  name: z.string().min(2, "Skill name is required"),
  level: z.string().transform(val => parseInt(val)).pipe(z.number().min(0).max(100, "Level must be between 0 and 100")),
  category: z.string().min(2, "Category is required"),
});

export default function SkillsPage() {
  const router = useRouter();
  const { skills, fetchSkills, addSkill, updateSkill, deleteSkill } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Sync with DB
  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const columns = [
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <div
          className="flex items-center gap-2"
          title={item._isFromDataJs ? "Template - Not yet uploaded to database" : "Uploaded to database"}
        >
          {!item._isFromDataJs && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
              <span className="text-[9px] font-black text-green-400 uppercase tracking-tighter">Uploaded</span>
            </div>
          )}
          {item._isFromDataJs && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full border border-border" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Template</span>
            </div>
          )}
        </div>
      ),
    },
    { key: "name", label: "Technical Proficiency" },
    {
        key: "level",
        label: "Expertise Rank",
        render: (item) => (
            <div className="flex items-center gap-4 min-w-[140px]">
                <div className="h-2 flex-1 bg-muted/50 rounded-full overflow-hidden border border-border/70 p-0.5">
                    <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${item.level}%` }} />
                </div>
                <span className="text-[10px] font-black tabular-nums text-foreground opacity-80">{item.level}%</span>
            </div>
        )
    },
    { key: "category", label: "Segment" },
  ];

  const fields = [
    { name: "name", label: "Skill Name", placeholder: "e.g. Next.js Architecture", required: true },
    { name: "level", label: "Proficiency Level (0-100)", placeholder: "95", type: "number", required: true },
    { name: "category", label: "Technical Category", placeholder: "e.g. Frontend, Backend, Infra", required: true },
  ];

  const handleAdd = () => {
    setEditingSkill(null);
    router.push("/admin/skills/new");
  };

  const handleEdit = (skill) => {
    setEditingSkill({ ...skill, level: String(skill.level) });
    router.push(`/admin/skills/${skill._id || encodeURIComponent(skill.name)}`);
  };

  const handleDelete = (item) => {
    if (!item._id) {
       toast.error("Static core data cannot be deleted. Initiate custom data first.");
       return;
    }
    setDeletingId(item._id);
    setIsConfirmOpen(true);
  };

  const onConfirmDelete = async () => {
    const success = await deleteSkill(deletingId);
    if (success) setIsConfirmOpen(false);
  };

  const onSubmit = async (data) => {
    try {
        let res;
        if (editingSkill && editingSkill._id) {
            res = await updateSkill(editingSkill._id, data);
        } else {
            res = await addSkill(data);
        }
        if (Object.values(res || {}).includes(true) || res === true) {
            setIsModalOpen(false);
        }
    } catch (error) {
        toast.error("Calibration sync failed.");
    }
  };

  const categories = [...new Set(skills.map((skill) => skill.category).filter(Boolean))];
  const visibleSkills = skills.filter((skill) =>
    (activeCategory === "all" || skill.category === activeCategory) &&
    `${skill.name} ${skill.category}`.toLowerCase().includes(search.toLowerCase()),
  );
  const averageLevel = skills.length
    ? Math.round(skills.reduce((total, skill) => total + Number(skill.level || 0), 0) / skills.length)
    : 0;

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-20">
      <header className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0d1727] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-emerald-400/[0.06] blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center"><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/15"><Braces className="size-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-emerald-300">Capability library</p><h1 className="mt-2 text-2xl font-semibold tracking-[-.035em] text-white sm:text-3xl">Skills management</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Organize the technologies and capabilities presented across your portfolio.</p></div></div><button onClick={handleAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-5 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-200"><Plus className="size-4" />Add skill</button></div>
      </header>

      <div className="grid overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1727] sm:grid-cols-3"><Metric icon={Code2} label="Total skills" value={skills.length} /><Metric icon={Braces} label="Categories" value={categories.length} /><Metric icon={TrendingUp} label="Average proficiency" value={`${averageLevel}%`} last /></div>

      <section data-columns={columns.length} className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727]">
        <div className="flex flex-col gap-4 border-b border-white/[0.07] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-2 overflow-x-auto pb-1">{["all", ...categories].map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-[9px] font-bold uppercase tracking-wider transition ${activeCategory === category ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-300" : "border-white/[0.07] text-slate-600 hover:text-slate-300"}`}>{category}</button>)}</div><label className="relative w-full lg:w-72"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-600" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search skills..." className="w-full rounded-xl border border-white/[0.08] bg-slate-950/35 py-3 pl-10 pr-4 text-sm outline-none placeholder:text-slate-700 focus:border-emerald-400/40" /></label></div>
        <div className="grid gap-3 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-3">{visibleSkills.map((skill, index) => <SkillCard key={skill._id || `${skill.name}-${index}`} skill={skill} index={index} onEdit={() => handleEdit(skill)} onDelete={() => handleDelete(skill)} />)}</div>
        {visibleSkills.length === 0 && <div className="grid min-h-64 place-items-center text-center"><div><Braces className="mx-auto size-9 text-slate-700" /><p className="mt-4 text-sm font-semibold text-slate-300">No matching skills</p><p className="mt-1 text-xs text-slate-600">Adjust your category or search.</p></div></div>}
      </section>

      <AnimatePresence>
        {false && isModalOpen && (
          <FormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingSkill ? "Edit skill" : "Add a new skill"}
            schema={skillSchema}
            defaultValues={editingSkill}
            onSubmit={onSubmit}
            fields={fields}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isConfirmOpen && (
          <ConfirmDialog
            isOpen={isConfirmOpen}
            onConfirm={onConfirmDelete}
            onCancel={() => setIsConfirmOpen(false)}
            title="Delete this skill?"
            message="This skill will be permanently removed from your portfolio. This action cannot be undone."
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Metric({ icon: Icon, label, value, last = false }) {
  return <div className={`flex items-center gap-4 p-5 sm:p-6 ${last ? "" : "border-b border-white/[0.07] sm:border-b-0 sm:border-r"}`}><span className="grid size-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><Icon className="size-4" /></span><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-600">{label}</p><p className="mt-1 text-2xl font-semibold text-white">{value}</p></div></div>;
}

function SkillCard({ skill, index, onEdit, onDelete }) {
  const level = Math.max(0, Math.min(100, Number(skill.level || 0)));
  const tone = level >= 85 ? "emerald" : level >= 65 ? "sky" : "amber";
  const colors = { emerald: "bg-emerald-300 text-emerald-300", sky: "bg-sky-300 text-sky-300", amber: "bg-amber-300 text-amber-300" };
  return <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .025 }} className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.025]"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.045] text-slate-500"><Code2 className="size-4" /></span><div className="min-w-0"><h2 className="truncate text-sm font-semibold text-slate-100">{skill.name}</h2><p className="mt-1 text-[9px] font-bold uppercase tracking-[.15em] text-slate-600">{skill.category}</p></div></div><span className={`text-lg font-semibold tabular-nums ${colors[tone].split(" ")[1]}`}>{level}%</span></div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.055]"><motion.div initial={{ width: 0 }} animate={{ width: `${level}%` }} transition={{ duration: .8, delay: index * .025 }} className={`h-full rounded-full ${colors[tone].split(" ")[0]}`} /></div><div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4"><span className={`rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider ${skill._isFromDataJs ? "bg-white/[0.04] text-slate-600" : "bg-emerald-400/10 text-emerald-300"}`}>{skill._isFromDataJs ? "Template" : "Live"}</span><div className="flex gap-1"><button onClick={onEdit} className="grid size-8 place-items-center rounded-lg text-slate-600 hover:bg-white/[0.05] hover:text-white"><Pencil className="size-3.5" /></button>{!skill._isFromDataJs && <button onClick={onDelete} className="grid size-8 place-items-center rounded-lg text-slate-600 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 className="size-3.5" /></button>}</div></div></motion.article>;
}
