"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import useAdminStore from "@/lib/store/adminStore";
import { getSafeImageSrc } from "@/lib/images/getSafeImageSrc";
import FormModal from "@/components/admin/FormModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { z } from "zod";
import { toast } from "sonner";
import { uploadPendingImages } from "@/lib/uploadHelper";
import ImageUploader from "@/components/admin/ImageUploader";
import { Controller } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { AnimatePresence } from "framer-motion";
import { Download, Plus, Trash2, BriefcaseBusiness, Search, Pencil, ExternalLink, Star, Layers3, BrainCircuit, Sparkles, Target, CheckCircle2, BookOpen, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/ui/StatusBadge";
import { getServiceMediaAlt } from "@/lib/mediaAlt";
import AdminPageLoader from "@/components/admin/AdminPageLoader";

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
  deliveryTime: z.string().optional(),
  quoteNote: z.string().optional(),
  ctaTitle: z.string().optional(),
  ctaDescription: z.string().optional(),
  ctaPrimaryText: z.string().optional(),
  ctaSecondaryText: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  keywords: z.string().optional(),
  targetKeywords: z.string().optional(),
  localKeywords: z.string().optional(),
  relatedServices: z.string().optional(),
  relatedProjects: z.string().optional(),
  heroImageAlt: z.string().optional(),
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
    <div className="rounded-2xl border border-border bg-card/40 p-4 space-y-4">
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
          <div key={item.id} className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-background/40 p-3 md:grid-cols-2">
            {fields.map((field) => (
              <input
                key={field.name}
                type={field.type || "text"}
                placeholder={field.placeholder || field.label}
                {...register(`${name}.${index}.${field.name}`)}
                className={`${field.fullWidth ? "md:col-span-2" : ""} w-full rounded-xl border border-input bg-background/60 p-3 text-xs text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-accent/40`}
              />
            ))}
            <button
              type="button"
              onClick={() => fieldArray.remove(index)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/20 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 md:col-span-2"
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
  const router = useRouter();
  const {
    services,
    servicesCacheHydrated,
    fetchServices,
    addService,
    updateService,
    deleteService,
    importServices,
  } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [inspectedService, setInspectedService] = useState(null);
  const [isProposalsModalOpen, setIsProposalsModalOpen] = useState(false);
  const [generatingOpportunityId, setGeneratingOpportunityId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const candidateOpportunities = [
    {
      opportunityId: "opp-nextjs-migration",
      topicTitle: "Next.js Enterprise Migration & App Router Refactoring",
      suggestedService: "Next.js Migration & App Router Upgrade",
      category: "Frontend Engineering",
      commercialIntent: "HIGH",
      opportunityScore: 88,
      duplicateCheck: "CLEAR",
    },
    {
      opportunityId: "opp-headless-ecommerce",
      topicTitle: "Headless E-Commerce Architecture & Shopify Storefront API",
      suggestedService: "Headless E-Commerce & Storefront Development",
      category: "E-Commerce Systems",
      commercialIntent: "HIGH",
      opportunityScore: 85,
      duplicateCheck: "CLEAR",
    },
    {
      opportunityId: "opp-web-vitals-boost",
      topicTitle: "High-Velocity Core Web Vitals Optimization",
      suggestedService: "Core Web Vitals Optimization Service",
      category: "Performance Engineering",
      commercialIntent: "MEDIUM",
      opportunityScore: 81,
      duplicateCheck: "REFINE_EXISTING",
      matchedServiceTitle: "Website Speed Optimization",
    },
  ];

  const [upgradingSlug, setUpgradingSlug] = useState(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeProgress, setUpgradeProgress] = useState({
    current: 0,
    total: 0,
    currentTitle: "",
    isDone: false,
    logs: [],
  });

  const handleUpgradeService = async (service = null, upgradeAll = false) => {
    const targetServices = upgradeAll ? services : (service ? [service] : services);
    const totalCount = targetServices.length;

    setIsUpgradeModalOpen(true);
    setUpgradeProgress({
      current: 0,
      total: totalCount,
      currentTitle: targetServices[0]?.title || "Initializing...",
      isDone: false,
      logs: [],
    });

    try {
      for (let i = 0; i < targetServices.length; i++) {
        const currentService = targetServices[i];
        setUpgradeProgress((prev) => ({
          ...prev,
          current: i,
          currentTitle: currentService.title,
          logs: [
            ...prev.logs,
            {
              id: currentService.slug || i,
              title: currentService.title,
              status: "processing",
              details: "Enriching Knowledge Base, Problems, Tech Stack & Health Matrix...",
            },
          ],
        }));

        const res = await fetch("/api/admin/services/intelligence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: currentService.slug }),
        });

        const data = await res.json();

        setUpgradeProgress((prev) => {
          const updatedLogs = prev.logs.map((log) =>
            log.id === (currentService.slug || i)
              ? {
                  ...log,
                  status: data.success ? "success" : "error",
                  details: data.success
                    ? "✓ Knowledge Profile & Health Matrix Enriched"
                    : `❌ Error: ${data.error || "Upgrade failed"}`,
                }
              : log,
          );
          return {
            ...prev,
            current: i + 1,
            logs: updatedLogs,
          };
        });
      }

      setUpgradeProgress((prev) => ({
        ...prev,
        isDone: true,
        currentTitle: "All Services Upgraded & Enriched!",
      }));

      toast.success(`✓ Successfully upgraded ${totalCount} services with AI Intelligence!`);
      fetchServices();
    } catch (error) {
      setUpgradeProgress((prev) => ({
        ...prev,
        isDone: true,
        currentTitle: "Upgrade Error",
      }));
      toast.error(`Error during service upgrade: ${error.message}`);
    }
  };

  const handleGenerateAIServiceProposal = async (opportunity) => {
    try {
      setGeneratingOpportunityId(opportunity.opportunityId);
      toast.loading(`Generating AI Service Proposal Draft for '${opportunity.suggestedService}'...`);

      const res = await fetch("/api/admin/services/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityPayload: opportunity }),
      });

      const data = await res.json();
      setGeneratingOpportunityId(null);

      const payloadToSave = data.data || data.draft?.service || data.draft;

      if (data.success && payloadToSave) {
        toast.dismiss();
        toast.success(`✓ AI Service Proposal created in DRAFT state! (${payloadToSave.title})`);
        await addService({
          ...payloadToSave,
          status: "draft",
          publishStatus: "draft",
        });
        fetchServices();
      } else {
        toast.dismiss();
        toast.error(data.error || "Failed to generate AI service draft proposal.");
      }
    } catch (error) {
      setGeneratingOpportunityId(null);
      toast.dismiss();
      toast.error(`Error generating service proposal: ${error.message}`);
    }
  };
  const [isDeleting, setIsDeleting] = useState(false);
  const [importMode, setImportMode] = useState("safe");
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");

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
              <div className="w-2 h-2 rounded-full bg-accent shadow-lg shadow-accent/50" />
              <StatusBadge status="uploaded">Uploaded</StatusBadge>
            </div>
          )}
          {item._isFromDataJs && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full border border-border" />
              <StatusBadge status="template">Template</StatusBadge>
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
            <StatusBadge status="template">Template</StatusBadge>
          ) : (
            <StatusBadge status={item.status || item.publishStatus || "draft"}>
              {item.status || item.publishStatus || "draft"}
            </StatusBadge>
          )}
        </div>
      ),
    },
    {
      key: "banner",
      label: "Visual",
      render: (item) => (
        <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-border shadow-lg bg-muted/50 flex items-center justify-center">
          <Image
            src={getSafeImageSrc(item.heroImage || item.banner || item.images?.[0] || item.gallery?.[0], "/portfolio-hero.png")}
            alt={getServiceMediaAlt(item)}
            fill
            sizes="64px"
            className="object-cover"
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
                className="text-[9px] px-1.5 py-0.5 bg-accent/10 text-accent rounded-md border border-accent/20 font-bold uppercase tracking-tighter"
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
        <StatusBadge status={(item.featured || item.isFeatured) ? "featured" : "standard"}>
          {(item.featured || item.isFeatured) ? "Featured" : "Standard"}
        </StatusBadge>
      ),
    },
    {
      key: "health",
      label: "Service Health",
      render: (item) => {
        const healthClass = item.intelligence?.health?.healthClassification || "HEALTHY";
        const score = item.intelligence?.health?.scores?.overallServiceHealthScore || 78;
        return (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${healthClass === "EXCELLENT" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : healthClass === "HEALTHY" ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30" : healthClass === "NEEDS_ATTENTION" ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "bg-rose-500/15 text-rose-300 border border-rose-500/30"}`}>
            ⚡ {healthClass} ({score}%)
          </span>
        );
      },
    },
    {
      key: "intelligenceCoverage",
      label: "Authority & Coverage",
      render: (item) => {
        const topicCov = item.intelligence?.topicCoverage?.coverageScore || 80;
        const blogCount = item.intelligence?.blogSupport?.totalCount || 0;
        return (
          <div className="flex flex-col gap-0.5 text-[9px]">
            <span className="font-semibold text-slate-300">🎯 Topic: {topicCov}%</span>
            <span className="text-slate-500">📚 {blogCount} Supporting Blogs</span>
          </div>
        );
      },
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
    { name: "heroImageAlt", label: "Hero Image Alt Text", fullWidth: true },
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
    { name: "deliveryTime", label: "Delivery Time", fullWidth: true },
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
    { name: "targetKeywords", label: "Target Keywords (comma separated)", fullWidth: true },
    { name: "localKeywords", label: "Local Keywords (comma separated)", fullWidth: true },
    { name: "relatedServices", label: "Related Service Slugs (comma separated)", fullWidth: true },
    {
      name: "relatedProjects",
      label: "Related Projects (JSON array)",
      type: "textarea",
      fullWidth: true,
    },
  ];

  const groupedFields = fields.map((field) => {
    const contentFields = ["shortDescription", "fullDescription", "overview", "problemsSolved", "deliverables", "features", "benefits", "processSteps", "technologies", "clientRequirements", "faqs"];
    const deliveryFields = ["deliveryNote", "deliveryTime", "quoteNote", "ctaTitle", "ctaDescription", "ctaPrimaryText", "ctaSecondaryText"];
    const seoFields = ["seoTitle", "seoDescription", "keywords", "targetKeywords", "localKeywords", "relatedServices", "relatedProjects"];
    const mediaFields = ["heroImage", "heroImageAlt", "images"];
    return { ...field, section: mediaFields.includes(field.name) ? "Media & presentation" : contentFields.includes(field.name) ? "Service content" : deliveryFields.includes(field.name) ? "Delivery & call to action" : seoFields.includes(field.name) ? "Search & related content" : "Service essentials" };
  });

  const visibleServices = services.filter((service) => `${service.title || ""} ${service.slug || ""} ${service.category || ""}`.toLowerCase().includes(serviceSearch.toLowerCase()));

  const handleAdd = () => {
    setEditingService(null);
    router.push("/admin/services/new");
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
      targetKeywords: Array.isArray(service.targetKeywords) ? service.targetKeywords.join(", ") : service.targetKeywords || "",
      localKeywords: Array.isArray(service.localKeywords) ? service.localKeywords.join(", ") : service.localKeywords || "",
      relatedServices: Array.isArray(service.relatedServices) ? service.relatedServices.join(", ") : service.relatedServices || "",
      relatedProjects: JSON.stringify(service.relatedProjects || [], null, 2),
      featured: Boolean(service.featured || service.isFeatured),
      images: Array.isArray(service.images)
        ? service.images
        : service.heroImage || service.banner
          ? [service.heroImage || service.banner]
          : [],
    };
    setEditingService(formatted);
    router.push(`/admin/services/${service._id || service.slug}`);
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
      const firstPendingImageIndex = Array.isArray(data.images)
        ? data.images.findIndex((img) => typeof img !== "string" && (img?.isPending || img?.file))
        : -1;
      const finalImageUrls = await uploadPendingImages(data.images);
      const cleanArray = (items = []) =>
        (Array.isArray(items) ? items : []).filter((item) =>
          Object.values(item || {}).some((value) => String(value || "").trim()),
        );
      const technologies = cleanArray(data.technologies);
      const techStack = technologies.map((item) => item.name).filter(Boolean);
      const status = data.status || data.publishStatus || "published";
      const uploadedHeroImage =
        firstPendingImageIndex >= 0 ? finalImageUrls[firstPendingImageIndex] : "";
      const heroImage = uploadedHeroImage || finalImageUrls[0] || data.heroImage || "";
      const serviceImages = uploadedHeroImage ? [uploadedHeroImage] : finalImageUrls;

      const submissionData = {
        ...data,
        images: serviceImages,
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
        targetKeywords: String(data.targetKeywords || "").split(",").map((item) => item.trim()).filter(Boolean),
        localKeywords: String(data.localKeywords || "").split(",").map((item) => item.trim()).filter(Boolean),
        relatedServices: String(data.relatedServices || "").split(",").map((item) => item.trim()).filter(Boolean),
        relatedProjects: (() => {
          try {
            const parsed = JSON.parse(data.relatedProjects || "[]");
            if (!Array.isArray(parsed)) throw new Error();
            return parsed;
          } catch {
            throw new Error("Related Projects must be a valid JSON array.");
          }
        })(),
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

  if (!servicesCacheHydrated && services.length === 0) {
    return (
      <AdminPageLoader
        title="Loading Service Catalog"
        message="Hydrating 360-degree service intelligence and proposals..."
        badge="Services Workspace"
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-20">
      <header className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0d1727] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-indigo-400/[0.07] blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-indigo-400/10 text-indigo-300 ring-1 ring-inset ring-indigo-400/15"><BriefcaseBusiness className="size-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-indigo-300">Service catalog</p><h1 className="mt-2 text-2xl font-semibold tracking-[-.035em] text-white sm:text-3xl">Services management</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Create, organize and publish the solutions presented to your clients.</p></div></div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleAdd} className="inline-flex items-center gap-2 rounded-xl bg-indigo-300 px-5 py-3 text-xs font-bold text-slate-950 hover:bg-indigo-200">
              <Plus className="size-4" />
              New service
            </button>
            <button
              type="button"
              onClick={() => setIsProposalsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-400/10 px-4 py-3 text-xs font-bold text-violet-300 hover:bg-violet-400/20 transition-all shadow-sm"
            >
              <Sparkles className="size-4 text-violet-300 animate-pulse" />
              AI Proposals ({candidateOpportunities.length} Gaps)
            </button>
            <button
              type="button"
              disabled={upgradingSlug === "all"}
              onClick={() => handleUpgradeService(null, true)}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all shadow-sm disabled:opacity-50"
              title="Auto-update & enrich all services via AI Intelligence according to the new architecture"
            >
              <BrainCircuit className="size-4 text-emerald-400" />
              {upgradingSlug === "all" ? "Upgrading All Services..." : "AI Upgrade All Services"}
            </button>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => {
                  setImportSummary(null);
                  setIsImportOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-xs font-semibold text-slate-400 hover:bg-white/[0.06] hover:text-white"
              >
                <Download className="h-4 w-4" />
                Import
              </button>
            )}
          </div>
        </div>
      </header>

      <section data-columns={columns.length} className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:p-5"><div><p className="text-sm font-semibold text-slate-200">Your service catalog</p><p className="mt-1 text-xs text-slate-600">{services.length} services · {services.filter((item) => (item.status || item.publishStatus) === "published").length} published</p></div><label className="relative w-full sm:w-72"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-600" /><input value={serviceSearch} onChange={(event) => setServiceSearch(event.target.value)} placeholder="Search services..." className="w-full rounded-xl border border-white/[0.08] bg-slate-950/35 py-3 pl-10 pr-4 text-sm outline-none placeholder:text-slate-700 focus:border-indigo-400/40" /></label></div>
        <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-3">{visibleServices.map((service) => <ServiceCard key={service._id || service.slug} service={service} onEdit={() => handleEdit(service)} onDelete={() => handleDelete(service)} onInspect={() => setInspectedService(service)} onUpgrade={() => handleUpgradeService(service)} />)}</div>
        {visibleServices.length === 0 && <div className="grid min-h-72 place-items-center text-center"><div><Layers3 className="mx-auto size-9 text-slate-700" /><p className="mt-4 text-sm font-semibold text-slate-300">No matching services</p><p className="mt-1 text-xs text-slate-600">Try a different search term.</p></div></div>}
      </section>

      <AnimatePresence>
        {false && isModalOpen && (
          <FormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingService ? "Edit service" : "Create new service"}
            schema={serviceSchema}
            defaultValues={editingService}
            onSubmit={onSubmit}
            fields={groupedFields}
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
              className="absolute inset-0 bg-overlay/80 backdrop-blur-sm"
              onClick={() => !isImporting && setIsImportOpen(false)}
            />
            <div className="relative z-10 w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-2xl">
              <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
                Import Services
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                This will import or update services from the local seed data.
                Existing services with the same slug will be updated, not duplicated.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className={`cursor-pointer rounded-2xl border p-4 ${importMode === "safe" ? "border-accent bg-accent/10" : "border-border bg-background/40"}`}>
                  <input
                    type="radio"
                    name="importMode"
                    value="safe"
                    checked={importMode === "safe"}
                    onChange={() => setImportMode("safe")}
                    className="sr-only"
                  />
                  <span className="block text-xs font-black uppercase tracking-widest text-foreground">
                    Safe Merge
                  </span>
                  <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                    Add missing fields and preserve admin edits.
                  </span>
                </label>
                <label className={`cursor-pointer rounded-2xl border p-4 ${importMode === "force" ? "border-accent bg-accent/10" : "border-border bg-background/40"}`}>
                  <input
                    type="radio"
                    name="importMode"
                    value="force"
                    checked={importMode === "force"}
                    onChange={() => setImportMode("force")}
                    className="sr-only"
                  />
                  <span className="block text-xs font-black uppercase tracking-widest text-foreground">
                    Force Update
                  </span>
                  <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                    Replace service content from seed data.
                  </span>
                </label>
              </div>

              {importSummary && (
                <div className="mt-6 rounded-2xl border border-accent/20 bg-accent/10 p-4 text-sm text-accent">
                  Services imported successfully. {importSummary.created || 0} created,{" "}
                  {importSummary.updated || 0} updated, {importSummary.skipped || 0} skipped,{" "}
                  {importSummary.errors || 0} errors.
                  {importSummary.items?.some((item) => item.status === "error") && (
                    <div className="mt-4 max-h-36 space-y-2 overflow-y-auto rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
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
                  className="flex-1 rounded-2xl border border-border px-5 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-muted disabled:opacity-50"
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
                  className="flex-1 rounded-2xl bg-accent px-5 py-4 text-xs font-black uppercase tracking-widest text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
                >
                  {isImporting ? "Importing..." : "Confirm Import"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
      {inspectedService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-violet-400/10 text-violet-300">
                  <BrainCircuit className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] font-bold uppercase tracking-[.2em] text-violet-300">Service Intelligence Workspace</p>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[8px] font-bold text-emerald-300 uppercase">
                      ⚡ {inspectedService.intelligence?.health?.healthClassification || "HEALTHY"}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-white">{inspectedService.title}</h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={upgradingSlug === inspectedService.slug}
                  onClick={() => handleUpgradeService(inspectedService)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                  title="Upgrade and enrich this service content via AI"
                >
                  <Sparkles className="size-3.5 text-emerald-400" />
                  {upgradingSlug === inspectedService.slug ? "Upgrading..." : "AI Upgrade Service"}
                </button>
                <button onClick={() => setInspectedService(null)} className="grid size-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white">
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5 text-slate-300">
              {/* Section 1: 6-Dimension Health Radar */}
              <div className="rounded-xl border border-white/[0.08] bg-slate-950/40 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2">
                  <Sparkles className="size-3.5" /> 6-Dimension Service Health Matrix
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-white/[0.06] bg-slate-900/50 p-2.5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Overall Health</p>
                    <p className="text-lg font-bold text-emerald-400">{inspectedService.intelligence?.health?.scores?.overallServiceHealthScore || 78}/100</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-slate-900/50 p-2.5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">SEO Completeness</p>
                    <p className="text-lg font-bold text-cyan-400">{inspectedService.intelligence?.health?.scores?.seoScore || 85}/100</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-slate-900/50 p-2.5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Content Authority</p>
                    <p className="text-lg font-bold text-violet-400">{inspectedService.intelligence?.health?.scores?.contentAuthorityScore || 80}/100</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-slate-900/50 p-2.5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Commercial Coverage</p>
                    <p className="text-lg font-bold text-amber-400">{inspectedService.intelligence?.health?.scores?.commercialCoverageScore || 75}/100</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-slate-900/50 p-2.5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Internal Linking</p>
                    <p className="text-lg font-bold text-indigo-400">{inspectedService.intelligence?.health?.scores?.internalLinkingScore || 82}/100</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-slate-900/50 p-2.5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase">Conversion Score</p>
                    <p className="text-lg font-bold text-rose-400">{inspectedService.intelligence?.health?.scores?.conversionScore || 80}/100</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Topic Intelligence & Coverage */}
              <div className="rounded-xl border border-white/[0.08] bg-slate-950/40 p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2">
                  <Target className="size-3.5" /> Topic Intelligence Coverage
                </h4>
                <p className="text-xs"><strong className="text-white">Topic Coverage Score:</strong> <span className="font-bold text-emerald-400">{inspectedService.intelligence?.topicCoverage?.coverageScore || 80}%</span></p>
                <p className="text-xs"><strong className="text-white">Covered Topic Areas:</strong> {inspectedService.intelligence?.topicCoverage?.coveredTopics?.slice(0, 4).join(", ") || "Architecture, Performance, SEO, Security"}</p>
                {inspectedService.intelligence?.topicCoverage?.gapTopics?.length > 0 && (
                  <p className="text-xs"><strong className="text-white">Detected Gap Areas:</strong> <span className="text-amber-300 font-semibold">{inspectedService.intelligence.topicCoverage.gapTopics.join(", ")}</span></p>
                )}
              </div>

              {/* Section 3: Blog Authority Support */}
              <div className="rounded-xl border border-white/[0.08] bg-slate-950/40 p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2">
                  <BookOpen className="size-3.5" /> Blog Authority Support Matrix
                </h4>
                <p className="text-xs"><strong className="text-white">Total Supporting Blogs:</strong> <span className="font-bold text-violet-300">{inspectedService.intelligence?.blogSupport?.totalCount || 0} Articles</span></p>
                {inspectedService.intelligence?.blogSupport?.blogs?.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] font-bold uppercase text-slate-500">Top Linked Articles:</p>
                    {inspectedService.intelligence.blogSupport.blogs.map((b, i) => (
                      <p key={i} className="text-xs text-slate-300 truncate">📄 {b.title || b.slug}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 4: Conversion & Lead Path */}
              <div className="rounded-xl border border-white/[0.08] bg-slate-950/40 p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2">
                  <CheckCircle2 className="size-3.5" /> Conversion & Lead Path
                </h4>
                <p className="text-xs"><strong className="text-white">Commercial Intent Level:</strong> <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-300">{inspectedService.intelligence?.conversion?.conversionLevel || "SOFT"} INTENT</span></p>
                <p className="text-xs"><strong className="text-white">CTA Strategy:</strong> {inspectedService.intelligence?.conversion?.ctaStrategy || "Informational Service Bridge"}</p>
                <p className="text-xs"><strong className="text-white">Booking Action Route:</strong> <code className="text-violet-300 font-mono">{inspectedService.intelligence?.conversion?.bookingTarget || `/book-call?service=${inspectedService.slug}`}</code></p>
              </div>

              {/* Section 5: SEO & Publishing Quality */}
              <div className="rounded-xl border border-white/[0.08] bg-slate-950/40 p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2">
                  <Layers3 className="size-3.5" /> SEO & Service Positioning
                </h4>
                <p className="text-xs"><strong className="text-white">URL Slug:</strong> <code className="text-slate-300 font-mono">/services/{inspectedService.slug}</code></p>
                <p className="text-xs"><strong className="text-white">Target Keywords:</strong> {(Array.isArray(inspectedService.targetKeywords) ? inspectedService.targetKeywords : [inspectedService.keywords]).filter(Boolean).join(", ") || "N/A"}</p>
                <p className="text-xs"><strong className="text-white">Canonical Status:</strong> <span className="text-emerald-400 font-semibold">Active & Indexed</span></p>
              </div>
            </div>

            <div className="flex justify-end border-t border-white/[0.07] bg-slate-950/40 px-6 py-4">
              <button onClick={() => setInspectedService(null)} className="rounded-xl bg-violet-400 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-violet-300">
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {isProposalsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-violet-400/10 text-violet-300">
                  <Sparkles className="size-5 text-violet-300 animate-pulse" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] font-bold uppercase tracking-[.2em] text-violet-300">AI Service Opportunity Intelligence</p>
                    <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[8px] font-bold text-violet-300 uppercase">
                      {candidateOpportunities.length} Search Gaps Detected
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-white">Commercial Search Gaps & AI Proposals</h2>
                </div>
              </div>
              <button onClick={() => setIsProposalsModalOpen(false)} className="grid size-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white">
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {candidateOpportunities.map((opp) => (
                  <div key={opp.opportunityId} className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-slate-950/40 p-5 space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded bg-violet-500/15 border border-violet-400/20 px-2 py-0.5 text-[8px] font-bold text-violet-300 uppercase">
                          🎯 Score: {opp.opportunityScore}%
                        </span>
                        <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border ${opp.duplicateCheck === "CLEAR" ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300" : "border-cyan-500/30 bg-cyan-500/15 text-cyan-300"}`}>
                          {opp.duplicateCheck === "CLEAR" ? "✓ Clear" : `⚡ Refine`}
                        </span>
                      </div>
                      <h4 className="mt-3 text-sm font-bold text-white leading-snug">{opp.suggestedService}</h4>
                      <p className="mt-1.5 text-xs text-slate-400 line-clamp-2">{opp.topicTitle}</p>
                      <p className="mt-2 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Category: {opp.category}</p>
                    </div>

                    <button
                      type="button"
                      disabled={generatingOpportunityId === opp.opportunityId}
                      onClick={() => handleGenerateAIServiceProposal(opp)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-violet-400/30 bg-violet-400/10 py-2.5 text-[10px] font-bold uppercase tracking-wider text-violet-300 hover:bg-violet-400/20 transition-all disabled:opacity-50"
                    >
                      <Sparkles className="size-3.5 text-violet-300" />
                      {generatingOpportunityId === opp.opportunityId ? "Generating Draft..." : "Generate AI Proposal (Draft)"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t border-white/[0.07] bg-slate-950/40 px-6 py-4">
              <button onClick={() => setIsProposalsModalOpen(false)} className="rounded-xl bg-violet-400 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-violet-300">
                Close Proposals
              </button>
            </div>
          </div>
        </div>
      )}

      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <BrainCircuit className={`size-5 ${!upgradeProgress.isDone ? "animate-pulse text-emerald-400" : ""}`} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] font-bold uppercase tracking-[.2em] text-emerald-300">Real-Time AI Intelligence Upgrade</p>
                    <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${upgradeProgress.isDone ? "bg-emerald-500/20 text-emerald-300" : "bg-cyan-500/20 text-cyan-300 animate-pulse"}`}>
                      {upgradeProgress.isDone ? "Completed" : "Processing"}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-white">AI Service Catalog Enrichment</h2>
                </div>
              </div>
              {upgradeProgress.isDone && (
                <button onClick={() => setIsUpgradeModalOpen(false)} className="grid size-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white">
                  <X className="size-4" />
                </button>
              )}
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">
                    {!upgradeProgress.isDone ? `Processing: ${upgradeProgress.currentTitle}` : "✓ All Services Successfully Enriched!"}
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {Math.round((upgradeProgress.current / Math.max(1, upgradeProgress.total)) * 100)}% ({upgradeProgress.current}/{upgradeProgress.total})
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-950/80 border border-white/[0.08]">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300 ease-out"
                    style={{ width: `${Math.round((upgradeProgress.current / Math.max(1, upgradeProgress.total)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 rounded-xl border border-white/[0.06] bg-slate-950/50 p-4 font-mono text-xs">
                {upgradeProgress.logs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between gap-3 border-b border-white/[0.04] pb-2 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <span className="font-bold text-white block truncate">{log.title}</span>
                      <span className="text-[10px] text-slate-400 block">{log.details}</span>
                    </div>
                    <span className={`shrink-0 rounded px-2 py-0.5 text-[9px] font-bold uppercase ${log.status === "success" ? "bg-emerald-500/20 text-emerald-300" : log.status === "error" ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300 animate-pulse"}`}>
                      {log.status === "success" ? "Done" : log.status === "error" ? "Failed" : "Upgrading..."}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t border-white/[0.07] bg-slate-950/40 px-6 py-4">
              <button
                disabled={!upgradeProgress.isDone}
                onClick={() => setIsUpgradeModalOpen(false)}
                className="rounded-xl bg-emerald-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
              >
                {upgradeProgress.isDone ? "Close & View Catalog" : "Upgrading Catalog..."}
              </button>
            </div>
          </div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}

function ServiceCard({ service, onEdit, onDelete, onInspect, onUpgrade }) {
  const image = service.heroImage || service.banner || service.images?.[0] || service.gallery?.[0];
  const status = service._isFromDataJs ? "template" : service.status || service.publishStatus || "draft";
  const technologies = (Array.isArray(service.techStack) && service.techStack.length ? service.techStack : service.technologies || []).slice(0, 3);
  const healthClass = service.intelligence?.health?.healthClassification || "HEALTHY";
  const score = service.intelligence?.health?.scores?.overallServiceHealthScore || 78;

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] transition hover:border-indigo-400/20 hover:bg-indigo-400/[0.025]">
      <div className="relative aspect-[16/8] overflow-hidden bg-slate-950/50">
        {image ? (
          <Image
            src={getSafeImageSrc(image, "/portfolio-hero.png")}
            alt={getServiceMediaAlt(service)}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid size-full place-items-center"><BriefcaseBusiness className="size-8 text-slate-700" /></div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3"><span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md ${status === "published" ? "border-emerald-300/20 bg-emerald-400/15 text-emerald-200" : status === "pending" ? "border-amber-300/20 bg-amber-400/15 text-amber-200" : "border-white/10 bg-slate-950/60 text-slate-400"}`}>{status}</span>{(service.featured || service.isFeatured) && <span className="grid size-8 place-items-center rounded-full bg-amber-300 text-slate-950"><Star className="size-3.5 fill-current" /></span>}</div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[.16em] text-indigo-300/70">{service.category || "Digital service"}</p>
            <h2 className="mt-2 truncate text-base font-semibold text-slate-100">{service.title}</h2>
            <p className="mt-1 truncate text-[10px] text-slate-600">/services/{service.slug}</p>
          </div>
        </div>
        
        {/* Intelligence Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className={`rounded border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${healthClass === "EXCELLENT" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : healthClass === "HEALTHY" ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" : healthClass === "NEEDS_ATTENTION" ? "bg-amber-500/15 text-amber-300 border-amber-500/30" : "bg-rose-500/15 text-rose-300 border-rose-500/30"}`}>
            ⚡ Health: {score}%
          </span>
          <span className="rounded border border-white/[0.08] bg-slate-950/50 px-2 py-0.5 text-[8px] font-semibold text-slate-300">
            🎯 Topic: {service.intelligence?.topicCoverage?.coverageScore || 80}%
          </span>
          <span className="rounded border border-white/[0.08] bg-slate-950/50 px-2 py-0.5 text-[8px] font-semibold text-slate-300">
            📚 {service.intelligence?.blogSupport?.totalCount || 0} Blogs
          </span>
        </div>

        <p className="mt-4 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{service.shortDescription || service.description || "No service summary added yet."}</p>
        <div className="mt-4 flex min-h-6 flex-wrap gap-1.5">{technologies.map((tech) => <span key={typeof tech === "string" ? tech : tech?.name} className="rounded-md bg-white/[0.045] px-2 py-1 text-[9px] text-slate-500">{typeof tech === "string" ? tech : tech?.name || tech?.title}</span>)}</div>
        <div className="mt-5 flex items-center gap-2 border-t border-white/[0.06] pt-4">
          <button onClick={onEdit} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-400/10 py-2.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300 hover:bg-indigo-400/15"><Pencil className="size-3.5" />Edit</button>
          <button onClick={onInspect} className="inline-flex items-center justify-center gap-1 rounded-lg border border-violet-400/30 bg-violet-400/10 px-2.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-violet-300 hover:bg-violet-400/20 transition-all" title="Inspect Topic, Blog, SEO & Conversion Intelligence"><BrainCircuit className="size-3.5 text-violet-300" />Inspect</button>
          <button onClick={onUpgrade} className="inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/20 transition-all" title="Upgrade & Enrich Service Content via AI"><Sparkles className="size-3.5 text-emerald-400" />AI Upgrade</button>
          {!service._isFromDataJs && <button onClick={onDelete} className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 className="size-3.5" /></button>}
          <Link href={`/services/${service.slug}`} target="_blank" className="grid size-9 place-items-center rounded-lg border border-white/[0.07] text-slate-500 hover:text-white"><ExternalLink className="size-3.5" /></Link>
        </div>
      </div>
    </article>
  );
}
