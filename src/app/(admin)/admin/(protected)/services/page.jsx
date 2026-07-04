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
import { useFieldArray } from "react-hook-form";
import { AnimatePresence } from "framer-motion";
import { Download, Plus, Trash2 } from "lucide-react";

const serviceSchema = z.object({
  title: z.string().min(5, "Title is too short"),
  slug: z.string().min(3, "Slug is required"),
  category: z.string().optional(),
  shortDescription: z.string().min(20, "Short description is too short"),
  fullDescription: z.string().optional(),
  overview: z.string().optional(),
  heroImage: z.string().optional(),
  icon: z.string().optional(),
  images: z.array(z.any()).optional(),
  problemsSolved: z.array(z.any()).optional(),
  deliverables: z.array(z.any()).optional(),
  features: z.array(z.any()).optional(),
  benefits: z.array(z.any()).optional(),
  processSteps: z.array(z.any()).optional(),
  technologies: z.array(z.any()).optional(),
  clientRequirements: z.array(z.any()).optional(),
  faqs: z.array(z.any()).optional(),
  deliveryNote: z.string().optional(),
  quoteNote: z.string().optional(),
  ctaTitle: z.string().optional(),
  ctaDescription: z.string().optional(),
  ctaPrimaryText: z.string().optional(),
  ctaSecondaryText: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  keywords: z.string().optional(),
  status: z.enum(["draft", "pending", "published"]).default("published"),
  publishStatus: z.enum(["draft", "pending", "published"]).optional(),
  featured: z.boolean().default(false),
  isFeatured: z.boolean().optional(),
  sortOrder: z.coerce.number().default(0),
});

const emptyTextItem = { title: "", description: "" };
const emptyProblem = { title: "", description: "", icon: "" };
const emptyProcess = { step: 1, title: "", description: "" };
const emptyFaq = { question: "", answer: "" };
const emptyTech = { name: "", category: "", icon: "" };

const RepeaterField = ({ control, register, name, label, template, fields }) => {
  const fieldArray = useFieldArray({ control, name });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/80">
          {label}
        </p>
        <button
          type="button"
          onClick={() =>
            fieldArray.append(
              typeof template === "function" ? template(fieldArray.fields.length) : template,
            )
          }
          className="inline-flex items-center gap-2 rounded-xl border border-accent/30 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-accent hover:bg-accent/10"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      <div className="space-y-3">
        {fieldArray.fields.map((item, index) => (
          <div key={item.id} className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-black/20 p-3 md:grid-cols-2">
            {fields.map((field) => (
              <input
                key={field.name}
                type={field.type || "text"}
                placeholder={field.placeholder || field.label}
                {...register(`${name}.${index}.${field.name}`)}
                className={`${field.fullWidth ? "md:col-span-2" : ""} w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs outline-none focus:border-accent/40`}
              />
            ))}
            <button
              type="button"
              onClick={() => fieldArray.remove(index)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 md:col-span-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ServicesPage() {
  const { services, fetchServices, addService, updateService, deleteService, reorderServices, importServices } =
    useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [importMode, setImportMode] = useState("safe");
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Sync with DB on mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((session) => {
        if (mounted) {
          setIsSuperAdmin(
            session?.role === "super-admin" || session?.role === "root-super-admin",
          );
        }
      })
      .catch(() => setIsSuperAdmin(false));
    return () => {
      mounted = false;
    };
  }, []);

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
              (item.status || item.publishStatus) === "published" ? "text-green-500" :
              (item.status || item.publishStatus) === "pending" ? "text-amber-500" :
              "text-slate-400"
            }>
              {item.status || item.publishStatus || "draft"}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "banner",
      label: "Visual",
      render: (item) => (
        <div className="w-16 h-10 rounded-lg overflow-hidden border border-white/10 shadow-lg bg-white/5 flex items-center justify-center">
          <img
            src={item.heroImage || item.banner || item.images?.[0] || item.gallery?.[0]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      ),
    },
    { key: "title", label: "Service Identity" },
    { key: "slug", label: "URL Slug" },
    {
      key: "techStack",
      label: "Market Stack",
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {(Array.isArray(item.techStack) && item.techStack.length ? item.techStack : item.technologies || [])
            .slice(0, 3)
            .map((tech) => (
              <span
                key={typeof tech === "string" ? tech : tech?.name || tech?.title}
                className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20 font-bold uppercase tracking-tighter"
              >
                {typeof tech === "string" ? tech : tech?.name || tech?.title}
              </span>
            ))}
        </div>
      ),
    },
    {
      key: "featured",
      label: "Featured",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded text-[8px] font-black uppercase ${(item.featured || item.isFeatured) ? "bg-amber-500/10 text-amber-500" : "bg-slate-500/10 text-slate-500"}`}
        >
          {(item.featured || item.isFeatured) ? "Featured" : "Standard"}
        </span>
      ),
    },
  ];

  const fields = [
    {
      name: "title",
      label: "Service Title",
      placeholder: "e.g. Next-Gen Web Dev",
      required: true,
    },
    {
      name: "slug",
      label: "Module Slug",
      placeholder: "e.g. web-development",
      required: true,
    },
    {
      name: "category",
      label: "Category",
      placeholder: "e.g. Web Development",
    },
    {
      name: "icon",
      label: "Icon Name",
      placeholder: "e.g. Code, Server, Rocket",
    },
    {
      name: "sortOrder",
      label: "Sort Order",
      type: "number",
    },
    {
      name: "heroImage",
      label: "Hero Image URL",
      placeholder: "https://...",
      fullWidth: true,
    },
    {
      name: "images",
      label: "Media Gallery / Hero Upload",
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
      name: "shortDescription",
      label: "Short Description",
      type: "textarea",
      fullWidth: true,
      required: true,
    },
    {
      name: "fullDescription",
      label: "Full Description",
      type: "textarea",
      fullWidth: true,
    },
    {
      name: "overview",
      label: "Overview",
      type: "textarea",
      fullWidth: true,
    },
    { 
      name: "status", 
      label: "Publication Status", 
      type: "select", 
      options: [
        { label: "Draft - Hidden", value: "draft" },
        { label: "Pending Review", value: "pending" },
        { label: "Published - Live", value: "published" }
      ],
      required: true
    },
    { name: "featured", label: "Mark as Featured Service", type: "checkbox" },
    {
      name: "problemsSolved",
      label: "Problems Solved",
      type: "custom",
      fullWidth: true,
      render: ({ control, register }) => (
        <RepeaterField
          control={control}
          register={register}
          name="problemsSolved"
          label="Problems Solved"
          template={emptyProblem}
          fields={[
            { name: "title", label: "Title" },
            { name: "icon", label: "Icon" },
            { name: "description", label: "Description", fullWidth: true },
          ]}
        />
      ),
    },
    {
      name: "deliverables",
      label: "Deliverables",
      type: "custom",
      fullWidth: true,
      render: ({ control, register }) => (
        <RepeaterField
          control={control}
          register={register}
          name="deliverables"
          label="Deliverables"
          template={emptyTextItem}
          fields={[
            { name: "title", label: "Title" },
            { name: "description", label: "Description", fullWidth: true },
          ]}
        />
      ),
    },
    {
      name: "features",
      label: "Features",
      type: "custom",
      fullWidth: true,
      render: ({ control, register }) => (
        <RepeaterField
          control={control}
          register={register}
          name="features"
          label="Features"
          template={emptyTextItem}
          fields={[
            { name: "title", label: "Title" },
            { name: "description", label: "Description", fullWidth: true },
          ]}
        />
      ),
    },
    {
      name: "benefits",
      label: "Benefits",
      type: "custom",
      fullWidth: true,
      render: ({ control, register }) => (
        <RepeaterField
          control={control}
          register={register}
          name="benefits"
          label="Benefits"
          template={emptyTextItem}
          fields={[
            { name: "title", label: "Title" },
            { name: "description", label: "Description", fullWidth: true },
          ]}
        />
      ),
    },
    {
      name: "processSteps",
      label: "Process Steps",
      type: "custom",
      fullWidth: true,
      render: ({ control, register }) => (
        <RepeaterField
          control={control}
          register={register}
          name="processSteps"
          label="Process Steps"
          template={(index) => ({ ...emptyProcess, step: index + 1 })}
          fields={[
            { name: "step", label: "Step", type: "number" },
            { name: "title", label: "Title" },
            { name: "description", label: "Description", fullWidth: true },
          ]}
        />
      ),
    },
    {
      name: "technologies",
      label: "Technologies",
      type: "custom",
      fullWidth: true,
      render: ({ control, register }) => (
        <RepeaterField
          control={control}
          register={register}
          name="technologies"
          label="Technologies"
          template={emptyTech}
          fields={[
            { name: "name", label: "Name" },
            { name: "category", label: "Category" },
            { name: "icon", label: "Icon", fullWidth: true },
          ]}
        />
      ),
    },
    {
      name: "clientRequirements",
      label: "Client Requirements",
      type: "custom",
      fullWidth: true,
      render: ({ control, register }) => (
        <RepeaterField
          control={control}
          register={register}
          name="clientRequirements"
          label="Client Requirements"
          template={emptyTextItem}
          fields={[
            { name: "title", label: "Title" },
            { name: "description", label: "Description", fullWidth: true },
          ]}
        />
      ),
    },
    {
      name: "faqs",
      label: "FAQs",
      type: "custom",
      fullWidth: true,
      render: ({ control, register }) => (
        <RepeaterField
          control={control}
          register={register}
          name="faqs"
          label="FAQs"
          template={emptyFaq}
          fields={[
            { name: "question", label: "Question" },
            { name: "answer", label: "Answer", fullWidth: true },
          ]}
        />
      ),
    },
    {
      name: "deliveryNote",
      label: "Delivery Note",
      type: "textarea",
      fullWidth: true,
    },
    {
      name: "quoteNote",
      label: "Quote Note",
      type: "textarea",
      fullWidth: true,
    },
    { name: "ctaTitle", label: "CTA Title", fullWidth: true },
    {
      name: "ctaDescription",
      label: "CTA Description",
      type: "textarea",
      fullWidth: true,
    },
    { name: "ctaPrimaryText", label: "CTA Primary Text" },
    { name: "ctaSecondaryText", label: "CTA Secondary Text" },
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
  ];

  const handleAdd = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service) => {
    const toObjects = (value) =>
      Array.isArray(value)
        ? value.map((item) =>
            typeof item === "string" ? { title: item, description: "" } : item,
          )
        : [];
    const toTech = (value) =>
      Array.isArray(value)
        ? value.map((item) =>
            typeof item === "string" ? { name: item, category: "", icon: "" } : item,
          )
        : [];
    const formatted = {
      ...service,
      status: service.status || service.publishStatus || "published",
      shortDescription: service.shortDescription || service.description || "",
      heroImage: service.heroImage || service.banner || service.image || "",
      problemsSolved: toObjects(service.problemsSolved).length
        ? toObjects(service.problemsSolved)
        : service.problemSolved
          ? [{ title: "Business challenge", description: service.problemSolved, icon: "" }]
          : [],
      deliverables: toObjects(service.deliverables),
      features: toObjects(service.features),
      benefits: toObjects(service.benefits),
      processSteps: Array.isArray(service.processSteps) && service.processSteps.length
        ? service.processSteps
        : toObjects(service.process).map((step, index) => ({ ...step, step: index + 1 })),
      technologies: toTech(
        Array.isArray(service.technologies) && service.technologies.length
          ? service.technologies
          : service.techStack,
      ),
      clientRequirements: toObjects(service.clientRequirements),
      faqs: Array.isArray(service.faqs) && service.faqs.length ? service.faqs : service.faq || [],
      keywords: Array.isArray(service.keywords) ? service.keywords.join(", ") : service.keywords || "",
      featured: Boolean(service.featured || service.isFeatured),
      images: Array.isArray(service.images)
        ? service.images
        : service.heroImage || service.banner
          ? [service.heroImage || service.banner]
          : [],
    };
    setEditingService(formatted);
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
    const success = await deleteService(deletingId);
    setIsDeleting(false);
    if (success) setIsConfirmOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      const hasNewImages = data.images && data.images.some(img => typeof img !== 'string' || img.isPending);
      if (hasNewImages) {
        toast.loading("Encrypting and uploading media...");
      } else {
        toast.loading("Publishing to global index...");
      }
      const finalImageUrls = await uploadPendingImages(data.images);
      const cleanArray = (items = []) =>
        (Array.isArray(items) ? items : []).filter((item) =>
          Object.values(item || {}).some((value) => String(value || "").trim()),
        );
      const technologies = cleanArray(data.technologies);
      const techStack = technologies.map((item) => item.name).filter(Boolean);
      const status = data.status || data.publishStatus || "published";
      const heroImage = data.heroImage || finalImageUrls[0] || "";

      const submissionData = {
        ...data,
        images: finalImageUrls,
        heroImage,
        banner: heroImage,
        image: heroImage,
        description: data.shortDescription,
        problemSolved: data.problemsSolved?.[0]?.description || data.shortDescription,
        problemsSolved: cleanArray(data.problemsSolved),
        deliverables: cleanArray(data.deliverables),
        features: cleanArray(data.features),
        benefits: cleanArray(data.benefits),
        processSteps: cleanArray(data.processSteps).map((step, index) => ({
          ...step,
          step: Number(step.step || index + 1),
        })),
        technologies,
        techStack,
        clientRequirements: cleanArray(data.clientRequirements),
        faqs: cleanArray(data.faqs),
        faq: cleanArray(data.faqs),
        keywords: typeof data.keywords === "string"
          ? data.keywords.split(",").map((item) => item.trim()).filter(Boolean)
          : data.keywords || [],
        status,
        publishStatus: status,
        isFeatured: Boolean(data.featured),
        featured: Boolean(data.featured),
        sortOrder: Number(data.sortOrder || 0),
        order: Number(data.sortOrder || 0),
      };

      let res;
      if (editingService && editingService._id) {
        res = await updateService(editingService._id, submissionData);
      } else {
        res = await addService(submissionData);
      }

      if (res.success) {
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || "Entry failed: Shield active.");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white">
            Solution{" "}
            <span className="text-accent underline decoration-accent/20 underline-offset-8">
              Core
            </span>
          </h1>
          <p className="text-[10px] md:text-sm text-slate-500 mt-2 md:mt-4 font-medium tracking-tight uppercase tracking-widest">
            Orchestrate the services that drive digital performance.
          </p>
        </div>
        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => {
              setImportSummary(null);
              setIsImportOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-accent hover:bg-accent/15"
          >
            <Download className="h-4 w-4" />
            Import Services
          </button>
        )}
      </div>

      <DataTable
        title="Active Services"
        columns={columns}
        data={services}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReorder={reorderServices}
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
              editingService ? "Recalibrate Service" : "Deploy New Initiative"
            }
            schema={serviceSchema}
            defaultValues={editingService}
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
            title="Delete Service Entry?"
            message="This operation removes the service from the dashboard permanently. This action is irreversible."
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isImportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => !isImporting && setIsImportOpen(false)}
            />
            <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d1526] p-8 shadow-2xl">
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                Import Services
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                This will import or update services from the local seed data.
                Existing services with the same slug will be updated, not duplicated.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className={`cursor-pointer rounded-2xl border p-4 ${importMode === "safe" ? "border-accent bg-accent/10" : "border-white/10 bg-white/[0.03]"}`}>
                  <input
                    type="radio"
                    name="importMode"
                    value="safe"
                    checked={importMode === "safe"}
                    onChange={() => setImportMode("safe")}
                    className="sr-only"
                  />
                  <span className="block text-xs font-black uppercase tracking-widest text-white">
                    Safe Merge
                  </span>
                  <span className="mt-2 block text-xs leading-relaxed text-slate-400">
                    Add missing fields and preserve admin edits.
                  </span>
                </label>
                <label className={`cursor-pointer rounded-2xl border p-4 ${importMode === "force" ? "border-accent bg-accent/10" : "border-white/10 bg-white/[0.03]"}`}>
                  <input
                    type="radio"
                    name="importMode"
                    value="force"
                    checked={importMode === "force"}
                    onChange={() => setImportMode("force")}
                    className="sr-only"
                  />
                  <span className="block text-xs font-black uppercase tracking-widest text-white">
                    Force Update
                  </span>
                  <span className="mt-2 block text-xs leading-relaxed text-slate-400">
                    Replace service content from seed data.
                  </span>
                </label>
              </div>

              {importSummary && (
                <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
                  Services imported successfully. {importSummary.created || 0} created,{" "}
                  {importSummary.updated || 0} updated, {importSummary.skipped || 0} skipped,{" "}
                  {importSummary.errors || 0} errors.
                  {importSummary.items?.some((item) => item.status === "error") && (
                    <div className="mt-4 max-h-36 space-y-2 overflow-y-auto rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200">
                      {importSummary.items
                        .filter((item) => item.status === "error")
                        .map((item) => (
                          <p key={`${item.slug}-${item.title}`}>
                            <span className="font-black">{item.title || item.slug}:</span>{" "}
                            {item.reason}
                          </p>
                        ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsImportOpen(false)}
                  disabled={isImporting}
                  className="flex-1 rounded-2xl border border-white/10 px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isImporting}
                  onClick={async () => {
                    setIsImporting(true);
                    const result = await importServices(importMode);
                    setIsImporting(false);
                    if (result.success) {
                      setImportSummary(result.summary);
                      setIsImportOpen(false);
                    }
                  }}
                  className="flex-1 rounded-2xl bg-accent px-5 py-4 text-xs font-black uppercase tracking-widest text-black hover:bg-accent/90 disabled:opacity-60"
                >
                  {isImporting ? "Importing..." : "Confirm Import"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
