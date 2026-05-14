"use client";

import { useState, useEffect } from "react";
import useAdminStore from "@/lib/store/adminStore";
import DataTable from "@/components/admin/DataTable";
import FormModal from "@/components/admin/FormModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { z } from "zod";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";

const skillSchema = z.object({
  name: z.string().min(2, "Skill name is required"),
  level: z.string().transform(val => parseInt(val)).pipe(z.number().min(0).max(100, "Level must be between 0 and 100")),
  category: z.string().min(2, "Category is required"),
});

export default function SkillsPage() {
  const { skills, fetchSkills, addSkill, updateSkill, deleteSkill } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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
              <div className="w-2 h-2 rounded-full border border-slate-500" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Template</span>
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
                <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
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
    setIsModalOpen(true);
  };

  const handleEdit = (skill) => {
    setEditingSkill({ ...skill, level: String(skill.level) });
    setIsModalOpen(true);
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

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end mb-4">
        <div>
           <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white">Skill <span className="text-accent underline decoration-accent/20 underline-offset-[10px]">Matrix</span></h1>
           <p className="text-[10px] md:text-sm text-slate-500 mt-4 font-medium tracking-tight uppercase tracking-widest">Calibrate your technical arsenal for maximum market impact.</p>
        </div>
      </div>

      <DataTable 
        title="Technical Stack"
        columns={columns}
        data={skills}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AnimatePresence>
        {isModalOpen && (
          <FormModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingSkill ? "Recalibrate Technical Ability" : "Inject New Skill Signature"}
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
            title="Burn Skill Signature?"
            message="This operation permanently removes the technical ability from the database. This action is irreversible."
          />
        )}
      </AnimatePresence>
    </div>
  );
}
