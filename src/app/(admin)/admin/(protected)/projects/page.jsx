"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import useAdminStore from "@/lib/store/adminStore";
import FormModal from "@/components/admin/FormModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { z } from "zod";
import { toast } from "sonner";
import { uploadPendingImages } from "@/lib/uploadHelper";
import ImageUploader from "@/components/admin/ImageUploader";
import { Controller } from "react-hook-form";
import { AnimatePresence } from "framer-motion";
import { getProjectMediaAlt } from "@/lib/mediaAlt";
import Link from "next/link";
import { BriefcaseBusiness, ExternalLink, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const { projects, fetchProjects, addProject, updateProject, deleteProject, reorderProjects } =
    useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");

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
    router.push("/admin/projects/new");
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
    router.push(`/admin/projects/${project._id || project.slug}`);
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

  const visibleProjects = projects.filter((project) =>
    `${project.title || ""} ${project.category || ""} ${project.purpose || ""} ${(project.techStack || []).join(" ")}`
      .toLowerCase()
      .includes(projectSearch.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-20">
      <header className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0d1727] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-fuchsia-400/[0.06] blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-fuchsia-400/10 text-fuchsia-300 ring-1 ring-inset ring-fuchsia-400/15"><BriefcaseBusiness className="size-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-fuchsia-300">Portfolio workspace</p><h1 className="mt-2 text-2xl font-semibold tracking-[-.035em] text-white sm:text-3xl">Projects management</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Curate your strongest work, case studies and project outcomes.</p></div></div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={handleAdd} className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-300 px-5 py-3 text-xs font-bold text-slate-950 hover:bg-fuchsia-200"><Plus className="size-4" />New project</button>
          <button
            type="button"
            onClick={() => handleImportProjects("safe")}
            disabled={isImporting}
            className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-xs font-semibold text-slate-400 transition hover:text-white disabled:opacity-50"
          >
            {isImporting ? "Importing..." : "Import Projects"}
          </button>
          <button
            type="button"
            onClick={() => handleImportProjects("force")}
            disabled={isImporting}
            className="rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-xs font-semibold text-rose-300 transition hover:bg-rose-400/10 disabled:opacity-50"
          >
            Force Update
          </button>
        </div></div>
      </header>

      <section data-columns={columns.length} data-reorder={Boolean(reorderProjects)} className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:p-5"><div><p className="text-sm font-semibold text-slate-200">Project library</p><p className="mt-1 text-xs text-slate-600">{projects.length} projects · {projects.filter((item) => item.publishStatus === "published").length} published · {projects.filter((item) => item.featured).length} featured</p></div><label className="relative w-full sm:w-72"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-600" /><input value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} placeholder="Search projects..." className="w-full rounded-xl border border-white/[0.08] bg-slate-950/35 py-3 pl-10 pr-4 text-sm outline-none placeholder:text-slate-700 focus:border-fuchsia-400/40" /></label></div>
        <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-3">{visibleProjects.map((project) => <ProjectCard key={project._id || project.slug || project.title} project={project} onEdit={() => handleEdit(project)} onDelete={() => handleDelete(project)} />)}</div>
        {visibleProjects.length === 0 && <div className="grid min-h-72 place-items-center text-center"><div><BriefcaseBusiness className="mx-auto size-9 text-slate-700" /><p className="mt-4 text-sm font-semibold text-slate-300">No matching projects</p><p className="mt-1 text-xs text-slate-600">Try another title, category or technology.</p></div></div>}
      </section>

      <AnimatePresence>
        {false && isModalOpen && (
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

function ProjectCard({ project, onEdit, onDelete }) {
  const preview = project.thumbnail || project.thumbnailImage || project.heroImage || project.gallery?.[0] || project.images?.[0];
  const status = project._isFromDataJs ? "template" : project.publishStatus || "draft";
  const techStack = Array.isArray(project.techStack) ? project.techStack.slice(0, 4) : [];

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] transition hover:border-fuchsia-400/20 hover:bg-fuchsia-400/[0.025]">
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-950/50">
        {preview ? <Image src={preview} alt={getProjectMediaAlt(project)} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" /> : <div className="grid size-full place-items-center"><BriefcaseBusiness className="size-8 text-slate-700" /></div>}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3"><span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md ${status === "published" ? "border-emerald-300/20 bg-emerald-400/15 text-emerald-200" : status === "pending" ? "border-amber-300/20 bg-amber-400/15 text-amber-200" : "border-white/10 bg-slate-950/60 text-slate-400"}`}>{status}</span>{project.featured && <span className="grid size-8 place-items-center rounded-full bg-amber-300 text-slate-950"><Star className="size-3.5 fill-current" /></span>}</div>
      </div>
      <div className="p-5"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-fuchsia-300/70">{project.category || "Project"}{project.year ? ` · ${project.year}` : ""}</p><h2 className="mt-2 truncate text-base font-semibold text-slate-100">{project.title}</h2><p className="mt-1 truncate text-[10px] text-slate-600">{project.projectType || project.purpose || "Case study"}</p><p className="mt-4 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{project.shortDescription || project.description || project.impact || "No project summary added yet."}</p><div className="mt-4 flex min-h-6 flex-wrap gap-1.5">{techStack.map((tech) => <span key={tech} className="rounded-md bg-white/[0.045] px-2 py-1 text-[9px] text-slate-500">{tech}</span>)}</div><div className="mt-5 flex items-center gap-2 border-t border-white/[0.06] pt-4"><button onClick={onEdit} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-fuchsia-400/10 py-2.5 text-[10px] font-bold uppercase tracking-wider text-fuchsia-300 hover:bg-fuchsia-400/15"><Pencil className="size-3.5" />Edit project</button>{!project._isFromDataJs && <button onClick={onDelete} className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 className="size-3.5" /></button>}{project.slug && <Link href={`/projects/${project.slug}`} target="_blank" className="grid size-9 place-items-center rounded-lg border border-white/[0.07] text-slate-500 hover:text-white"><ExternalLink className="size-3.5" /></Link>}</div></div>
    </article>
  );
}
