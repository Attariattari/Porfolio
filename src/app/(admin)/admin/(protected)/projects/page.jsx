"use client";

import { useState, useEffect } from "react";
import useAdminStore from "@/lib/store/adminStore";
import DataTable from "@/components/admin/DataTable";
import FormModal from "@/components/admin/FormModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { z } from "zod";
import { toast } from "sonner";
import { uploadPendingImages } from "@/lib/uploadHelper";
import ImageUploader from "@/components/admin/ImageUploader";
import { Controller } from "react-hook-form";
import { AnimatePresence } from "framer-motion";

const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(2, "Category is required"),
  purpose: z.string().min(2, "Purpose is required"),
  impact: z.string().min(5, "Impact description is required"),
  images: z.array(z.any()).min(1, "At least one image is required"),
  techStack: z
    .string()
    .transform((val) => (val ? val.split(",").map((s) => s.trim()) : [])),
  details: z.string().min(20, "Detailed description is required"),
  publishStatus: z.enum(["draft", "pending", "published"]).default("draft"),
  featured: z.boolean().default(false),
});

export default function ProjectsPage() {
  const { projects, fetchProjects, addProject, updateProject, deleteProject, reorderProjects } =
    useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync with DB on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const columns = [
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <div
          className="flex items-center gap-2"
          title={
            item._isFromDataJs
              ? "Template - Not yet uploaded to database"
              : "Uploaded to database"
          }
        >
          {!item._isFromDataJs && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
              <span className="text-[9px] font-black text-green-400 uppercase tracking-tighter">
                Uploaded
              </span>
            </div>
          )}
          {item._isFromDataJs && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full border border-slate-500" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                Template
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "publishStatus",
      label: "Publish Status",
      render: (item) => (
        <div className="flex flex-col gap-1 text-[10px] font-black uppercase tracking-widest">
          {item._isFromDataJs ? (
            <span className="text-slate-500">Template</span>
          ) : (
            <span className={
              item.publishStatus === "published" ? "text-green-500" :
              item.publishStatus === "pending" ? "text-amber-500" :
              "text-slate-400"
            }>
              {item.publishStatus || "draft"}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "thumbnail",
      label: "Preview",
      render: (item) => (
        <div className="w-16 h-10 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
          <img
            src={item.thumbnail || item.gallery?.[0] || item.images?.[0]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      ),
    },
    { key: "title", label: "Project Title" },
    { key: "category", label: "Category" },
    {
      key: "techStack",
      label: "Stack",
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {(Array.isArray(item.techStack) ? item.techStack : [])
            .slice(0, 3)
            .map((tech) => (
              <span
                key={tech}
                className="text-[9px] px-1.5 py-0.5 bg-accent/10 text-accent rounded-md border border-accent/20 font-bold uppercase tracking-tighter"
              >
                {tech}
              </span>
            ))}
          {item.techStack?.length > 3 && (
            <span className="text-[9px] text-muted-foreground font-black">
              +{item.techStack.length - 3}
            </span>
          )}
        </div>
      ),
    },
    { key: "purpose", label: "Purpose" },
    {
      key: "featured",
      label: "Featured",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded text-[8px] font-black uppercase ${item.featured ? "bg-amber-500/10 text-amber-500" : "bg-slate-500/10 text-slate-500"}`}
        >
          {item.featured ? "Featured" : "Standard"}
        </span>
      ),
    },
  ];

  const fields = [
    {
      name: "title",
      label: "Project Title",
      placeholder: "e.g. Apex E-Commerce",
      required: true,
    },
    {
      name: "category",
      label: "Category",
      placeholder: "e.g. Web, Mobile, UI/UX",
      required: true,
    },
    {
      name: "purpose",
      label: "Purpose",
      placeholder: "e.g. Fintech, Healthcare",
      required: true,
    },
    {
      name: "images",
      label: "Project Media Gallery",
      type: "custom",
      fullWidth: true,
      render: ({ control }) => (
        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageUploader
              images={field.value || []}
              onChange={field.onChange}
            />
          )}
        />
      ),
    },
    {
      name: "techStack",
      label: "Tech Stack (comma separated)",
      placeholder: "React, Next.js, Node.js",
      fullWidth: true,
      required: true,
    },
    {
      name: "description",
      label: "Brief Description",
      type: "textarea",
      fullWidth: true,
      required: true,
    },
    {
      name: "impact",
      label: "Project Impact",
      placeholder: "e.g. Increased conversion by 35%",
      fullWidth: true,
      required: true,
    },
    {
      name: "details",
      label: "Full Details / Case Study",
      type: "textarea",
      fullWidth: true,
      required: true,
    },
    { 
      name: "publishStatus", 
      label: "Publication Status", 
      type: "select", 
      options: [
        { label: "Draft - Hidden", value: "draft" },
        { label: "Pending Review", value: "pending" },
        { label: "Published - Live", value: "published" }
      ],
      required: true
    },
    { name: "featured", label: "Mark as Featured Project", type: "checkbox" },
  ];

  const handleAdd = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEdit = (project) => {
    const formattedProject = {
      ...project,
      techStack: Array.isArray(project.techStack)
        ? project.techStack.join(", ")
        : project.techStack,
      images: project.gallery || project.images || [project.thumbnail || ""],
    };
    setEditingProject(formattedProject);
    setIsModalOpen(true);
  };

  const handleDelete = (item) => {
    if (!item._id) {
      toast.error(
        "Static core data cannot be deleted. Initiate custom data first.",
      );
      return;
    }
    setDeletingId(item._id);
    setIsConfirmOpen(true);
  };

  const onConfirmDelete = async () => {
    setIsDeleting(true);
    const success = await deleteProject(deletingId);
    setIsDeleting(false);
    if (success) setIsConfirmOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      const hasNewImages = data.images && data.images.some(img => typeof img !== 'string' || img.isPending);
      if (hasNewImages) {
        toast.loading("Encrypting and uploading media...");
      } else {
        toast.loading("Updating records to global index...");
      }
      
      const finalImageUrls = await uploadPendingImages(data.images);

      const submissionData = {
        ...data,
        gallery: finalImageUrls,
        thumbnail: finalImageUrls[0] || "",
      };

      let res;
      if (editingProject && editingProject._id) {
        res = await updateProject(editingProject._id, submissionData);
      } else {
        res = await addProject(submissionData);
      }

      if (res.success) {
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || "Muhyo Tech entry denied.");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white">
            Project <span className="text-accent">Muhyo Tech</span>
          </h1>
          <p className="text-[10px] md:text-sm text-slate-500 mt-2 font-medium uppercase tracking-widest">
            Manage and showcase your engineering masterpieces.
          </p>
        </div>
      </div>

      <DataTable
        title="Active Projects"
        columns={columns}
        data={projects}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReorder={reorderProjects}
        filters={[
          { 
            key: 'publishStatus', 
            label: 'All Publish Status', 
            options: [
              { label: 'Published', value: 'published' },
              { label: 'Pending', value: 'pending' },
              { label: 'Draft', value: 'draft' }
            ]
          },
          {
            key: 'featured',
            label: 'All Featured',
            options: [
              { label: 'Featured', value: 'true' },
              { label: 'Standard', value: 'false' }
            ]
          }
        ]}
      />

      <AnimatePresence>
        {isModalOpen && (
          <FormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={
              editingProject ? "Reconfigure Project" : "Initiate New Project"
            }
            schema={projectSchema}
            defaultValues={editingProject}
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
            title="Delete Project Record?"
            message="This action is irreversible. The project architecture will be permanently removed from the database."
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
