"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
import { getProjectMediaAlt } from "@/lib/mediaAlt";

const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  thumbnailAlt: z.string().optional(),
  heroImageAlt: z.string().optional(),
  galleryImageAlts: z.string().optional(),
  category: z.string().optional(),
  projectType: z.string().optional(),
  purpose: z.string().optional(),
  impact: z.string().optional(),
  images: z.array(z.any()).optional(),
  techStack: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",").map((s) => s.trim()).filter(Boolean) : [])),
  details: z.string().optional(),
  overview: z.string().optional(),
  problem: z.string().optional(),
  goals: z.string().optional(),
  role: z.string().optional(),
  responsibilities: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",").map((s) => s.trim()).filter(Boolean) : [])),
  clientType: z.string().optional(),
  duration: z.string().optional(),
  year: z.string().optional(),
  liveUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  features: z.string().optional(),
  modules: z.string().optional(),
  technologies: z.string().optional(),
  processSteps: z.string().optional(),
  challenges: z.string().optional(),
  results: z.string().optional(),
  relatedServices: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  keywords: z.string().optional(),
  sortOrder: z.coerce.number().optional(),
  publishStatus: z.enum(["draft", "pending", "published"]).default("draft"),
  featured: z.boolean().default(false),
});

const parseJsonField = (value, fallback) => {
  if (!value || typeof value !== "string") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    toast.error("One advanced project field contains invalid JSON.");
    throw new Error("Invalid JSON in advanced project fields");
  }
};

export default function ProjectsPage() {
  const { projects, fetchProjects, addProject, updateProject, deleteProject, reorderProjects } =
    useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

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
              <div className="w-2 h-2 rounded-full border border-border" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
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
            <span className="text-muted-foreground">Template</span>
          ) : (
            <span className={
              item.publishStatus === "published" ? "text-green-500" :
              item.publishStatus === "pending" ? "text-amber-500" :
              "text-muted-foreground"
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
      render: (item) => {
        const preview = item.thumbnail || item.thumbnailImage || item.heroImage || item.gallery?.[0] || item.images?.[0];

        return (
          <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-border bg-muted/50 flex items-center justify-center">
            {preview && (
              <Image
                src={preview}
                alt={getProjectMediaAlt(item)}
                fill
                sizes="64px"
                className="object-cover"
              />
            )}
          </div>
        );
      },
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
          className={`px-2 py-1 rounded text-[8px] font-black uppercase ${item.featured ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"}`}
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
      name: "slug",
      label: "Project Slug",
      placeholder: "muhyo-tech-portfolio",
    },
    {
      name: "category",
      label: "Category",
      placeholder: "e.g. Web, Mobile, UI/UX",
    },
    {
      name: "projectType",
      label: "Project Type",
      placeholder: "e.g. Admin Dashboard, Portfolio, SaaS",
    },
    {
      name: "purpose",
      label: "Purpose",
      placeholder: "e.g. Fintech, Healthcare",
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
    },
    {
      name: "shortDescription",
      label: "Short Description",
      type: "textarea",
      fullWidth: true,
    },
    {
      name: "description",
      label: "Brief Description",
      type: "textarea",
      fullWidth: true,
    },
    {
      name: "longDescription",
      label: "Long Description",
      type: "textarea",
      fullWidth: true,
    },
    { name: "thumbnailAlt", label: "Thumbnail Alt Text", fullWidth: true },
    { name: "heroImageAlt", label: "Hero Image Alt Text", fullWidth: true },
    {
      name: "galleryImageAlts",
      label: "Gallery Alt Texts (one per line)",
      type: "textarea",
      fullWidth: true,
    },
    {
      name: "impact",
      label: "Project Impact",
      placeholder: "e.g. Improved content management workflow",
      fullWidth: true,
    },
    {
      name: "details",
      label: "Full Details / Case Study",
      type: "textarea",
      fullWidth: true,
    },
    {
      name: "overview",
      label: "Project Overview",
      type: "textarea",
      fullWidth: true,
    },
    {
      name: "problem",
      label: "Problem / Goal",
      type: "textarea",
      fullWidth: true,
    },
    {
      name: "goals",
      label: "Goals (JSON array)",
      type: "textarea",
      fullWidth: true,
      placeholder: "[\"Goal one\", \"Goal two\"]",
    },
    {
      name: "role",
      label: "My Role",
      type: "textarea",
      fullWidth: true,
    },
    {
      name: "responsibilities",
      label: "Responsibilities (comma separated)",
      fullWidth: true,
    },
    { name: "clientType", label: "Client Type" },
    { name: "duration", label: "Duration" },
    { name: "year", label: "Year" },
    { name: "liveUrl", label: "Live URL", fullWidth: true },
    { name: "githubUrl", label: "GitHub URL", fullWidth: true },
    {
      name: "features",
      label: "Features (JSON array)",
      type: "textarea",
      fullWidth: true,
      placeholder: "[{\"title\":\"Feature\",\"description\":\"...\",\"icon\":\"Sparkles\"}]",
    },
    {
      name: "modules",
      label: "Modules / Pages (JSON array)",
      type: "textarea",
      fullWidth: true,
    },
    {
      name: "technologies",
      label: "Grouped Technologies (JSON object)",
      type: "textarea",
      fullWidth: true,
      placeholder: "{\"frontend\":[\"Next.js\"],\"backend\":[],\"database\":[],\"tools\":[]}",
    },
    {
      name: "processSteps",
      label: "Process Steps (JSON array)",
      type: "textarea",
      fullWidth: true,
    },
    {
      name: "challenges",
      label: "Challenges & Solutions (JSON array)",
      type: "textarea",
      fullWidth: true,
    },
    {
      name: "results",
      label: "Results / Impact (JSON array)",
      type: "textarea",
      fullWidth: true,
    },
    {
      name: "relatedServices",
      label: "Related Service Slugs (comma separated)",
      fullWidth: true,
    },
    { name: "seoTitle", label: "SEO Title", fullWidth: true },
    {
      name: "seoDescription",
      label: "SEO Description",
      type: "textarea",
      fullWidth: true,
    },
    {
      name: "keywords",
      label: "SEO Keywords (comma separated)",
      fullWidth: true,
    },
    {
      name: "sortOrder",
      label: "Sort Order",
      type: "number",
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
      goals: Array.isArray(project.goals)
        ? JSON.stringify(project.goals, null, 2)
        : project.goals,
      features: Array.isArray(project.features)
        ? JSON.stringify(project.features, null, 2)
        : project.features,
      modules: Array.isArray(project.modules)
        ? JSON.stringify(project.modules, null, 2)
        : project.modules,
      technologies: project.technologies
        ? JSON.stringify(project.technologies, null, 2)
        : "",
      processSteps: Array.isArray(project.processSteps)
        ? JSON.stringify(project.processSteps, null, 2)
        : project.processSteps,
      challenges: Array.isArray(project.challenges)
        ? JSON.stringify(project.challenges, null, 2)
        : project.challenges,
      results: Array.isArray(project.results)
        ? JSON.stringify(project.results, null, 2)
        : project.results,
      responsibilities: Array.isArray(project.responsibilities)
        ? project.responsibilities.join(", ")
        : project.responsibilities,
      relatedServices: Array.isArray(project.relatedServices)
        ? project.relatedServices.join(", ")
        : project.relatedServices,
      keywords: Array.isArray(project.keywords)
        ? project.keywords.join(", ")
        : project.keywords,
      galleryImageAlts: Array.isArray(project.galleryImageAlts)
        ? project.galleryImageAlts.join("\n")
        : project.galleryImageAlts || "",
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

      const finalImageUrls = await uploadPendingImages(data.images || []);

      const submissionData = {
        ...data,
        gallery: finalImageUrls,
        thumbnail: finalImageUrls[0] || "",
        thumbnailImage: finalImageUrls[0] || data.thumbnailImage || "",
        heroImage: finalImageUrls[0] || data.heroImage || "",
        goals: parseJsonField(data.goals, []),
        features: parseJsonField(data.features, []),
        modules: parseJsonField(data.modules, []),
        technologies: parseJsonField(data.technologies, {}),
        processSteps: parseJsonField(data.processSteps, []),
        challenges: parseJsonField(data.challenges, []),
        results: parseJsonField(data.results, []),
        galleryImageAlts: String(data.galleryImageAlts || "")
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean),
        galleryImages: finalImageUrls.map((url, index) => ({
          url,
          alt:
            String(data.galleryImageAlts || "").split(/\r?\n/)[index]?.trim() ||
            `${data.title} screenshot ${index + 1}`,
          caption: index === 0 ? "Project preview" : `Screenshot ${index + 1}`,
        })),
        relatedServices: data.relatedServices
          ? data.relatedServices.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        keywords: data.keywords
          ? data.keywords.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
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

  const handleImportProjects = async (mode = "safe") => {
    if (mode === "force" && !window.confirm("Force update will overwrite existing project fields from data.js. Continue?")) {
      return;
    }

    setIsImporting(true);
    try {
      const res = await fetch("/api/admin/projects/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Import failed");
      const summary = result.summary || {};
      toast.success(
        `Projects imported. ${summary.created || 0} created, ${summary.updated || 0} updated, ${summary.skipped || 0} skipped.`,
      );
      await fetchProjects();
    } catch (error) {
      toast.error(error.message || "Project import failed.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-foreground">
            Project <span className="text-accent">Muhyo Tech</span>
          </h1>
          <p className="text-[10px] md:text-sm text-muted-foreground mt-2 font-medium uppercase tracking-widest">
            Manage and showcase your engineering masterpieces.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleImportProjects("safe")}
            disabled={isImporting}
            className="rounded-2xl border border-accent/30 bg-accent/10 px-5 py-3 text-xs font-black uppercase tracking-widest text-accent transition-all hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            {isImporting ? "Importing..." : "Import Projects"}
          </button>
          <button
            type="button"
            onClick={() => handleImportProjects("force")}
            disabled={isImporting}
            className="rounded-2xl border border-red-400/30 bg-red-400/10 px-5 py-3 text-xs font-black uppercase tracking-widest text-red-300 transition-all hover:bg-red-400 hover:text-foreground disabled:opacity-50"
          >
            Force Update
          </button>
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
