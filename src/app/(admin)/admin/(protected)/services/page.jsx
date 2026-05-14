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

const serviceSchema = z.object({
  title: z.string().min(5, "Title is too short"),
  slug: z.string().min(3, "Slug is required"),
  description: z.string().min(20, "Description is too short"),
  problemSolved: z.string().min(10, "Problem description is required"),
  images: z.array(z.any()).min(1, "At least one image is required"),
  techStack: z
    .string()
    .transform((val) => (val ? val.split(",").map((s) => s.trim()) : [])),
  benefits: z
    .string()
    .transform((val) => (val ? val.split(",").map((s) => s.trim()) : [])),
  publishStatus: z.enum(["draft", "pending", "published"]).default("draft"),
  featured: z.boolean().default(false),
});

export default function ServicesPage() {
  const { services, fetchServices, addService, updateService, deleteService, reorderServices } =
    useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync with DB on mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

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
      key: "banner",
      label: "Visual",
      render: (item) => (
        <div className="w-16 h-10 rounded-lg overflow-hidden border border-white/10 shadow-lg bg-white/5 flex items-center justify-center">
          <img
            src={item.banner || item.images?.[0] || item.gallery?.[0]}
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
          {(Array.isArray(item.techStack) ? item.techStack : [])
            .slice(0, 3)
            .map((tech) => (
              <span
                key={tech}
                className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20 font-bold uppercase tracking-tighter"
              >
                {tech}
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
      name: "images",
      label: "Media Gallery",
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
      label: "Technology Stack (comma separated)",
      placeholder: "React, Next.js, Node.js",
      fullWidth: true,
      required: true,
    },
    {
      name: "benefits",
      label: "Core Benefits (comma separated)",
      placeholder: "Speed, Security, SEO",
      fullWidth: true,
      required: true,
    },
    {
      name: "description",
      label: "Marketing Narrative",
      type: "textarea",
      fullWidth: true,
      required: true,
    },
    {
      name: "problemSolved",
      label: "Crisis/Solution Alignment",
      type: "textarea",
      placeholder: "What pain point does this solve?",
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
    { name: "featured", label: "Mark as Featured Service", type: "checkbox" },
  ];

  const handleAdd = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service) => {
    const formatted = {
      ...service,
      techStack: Array.isArray(service.techStack)
        ? service.techStack.join(", ")
        : service.techStack,
      benefits: Array.isArray(service.benefits)
        ? service.benefits.join(", ")
        : service.benefits,
      images: Array.isArray(service.images)
        ? service.images
        : service.banner
          ? [service.banner]
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

      const submissionData = {
        ...data,
        images: finalImageUrls,
        banner: finalImageUrls[0] || "",
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
    </div>
  );
}
