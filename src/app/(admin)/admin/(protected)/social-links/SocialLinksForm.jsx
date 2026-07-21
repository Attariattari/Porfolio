"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Save,
  Linkedin,
  Github,
  Facebook,
  Instagram,
  Twitter as XIcon,
  Plus,
  Trash2,
  Globe,
} from "lucide-react";
import useAdminStore from "@/lib/store/adminStore";

const WhatsAppIcon = (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="24"
      height="24"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M24.504 7.504A11.88 11.88 0 0 0 16.05 4C9.465 4 4.1 9.36 4.1 15.945a11.9 11.9 0 0 0 1.594 5.973L4 28.109l6.336-1.664a11.96 11.96 0 0 0 5.71 1.457h.005c6.586 0 11.945-5.359 11.949-11.949c0-3.191-1.242-6.191-3.496-8.45zM16.05 25.883h-.004a9.93 9.93 0 0 1-5.055-1.383l-.363-.215l-3.762.985l1.004-3.665l-.234-.375a9.9 9.9 0 0 1-1.52-5.285c0-5.472 4.457-9.925 9.938-9.925a9.86 9.86 0 0 1 7.02 2.91a9.88 9.88 0 0 1 2.905 7.023c0 5.477-4.457 9.93-9.93 9.93zm5.445-7.438c-.297-.148-1.766-.87-2.039-.968c-.273-.102-.473-.149-.672.148c-.2.3-.77.973-.945 1.172c-.172.195-.348.223-.645.074c-.3-.148-1.261-.465-2.402-1.484c-.887-.79-1.488-1.77-1.66-2.067c-.176-.3-.02-.46.129-.61c.136-.132.3-.347.449-.523c.148-.171.2-.296.3-.496c.098-.199.048-.375-.027-.523c-.074-.148-.671-1.621-.921-2.219c-.243-.582-.489-.5-.672-.511c-.172-.008-.371-.008-.57-.008c-.2 0-.524.074-.798.375c-.273.297-1.043 1.02-1.043 2.488c0 1.469 1.07 2.89 1.22 3.09c.148.195 2.105 3.21 5.1 4.504a17 17 0 0 0 1.7.629c.715.226 1.367.195 1.883.12c.574-.085 1.765-.722 2.015-1.421c.247-.695.247-1.293.172-1.418c-.074-.125-.273-.2-.574-.352"
      />
    </svg>
  );

// Fixed Icon Mapping
const PLATFORM_ICONS = {
  whatsapp: WhatsAppIcon,
  linkedin: Linkedin,
  github: Github,
  twitter: XIcon,
  facebook: Facebook,
  instagram: Instagram,
};

const PLATFORM_LABELS = {
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  github: "GitHub",
  twitter: "X (Twitter)",
  facebook: "Facebook",
  instagram: "Instagram",
};

const ALLOWED_PLATFORMS = [
  "whatsapp",
  "linkedin",
  "twitter",
  "facebook",
  "github",
  "instagram",
];

// Validation schema
const socialLinksSchema = z.object({
  links: z.array(z.object({
    platform: z.enum(ALLOWED_PLATFORMS),
    url: z.string().url("Invalid URL format").min(1, "URL is required"),
  })).max(6, "Maximum 6 social links allowed"),
});

const SectionHeader = ({ icon: Icon, title, desc }) => (
  <div className="mb-8 border-b border-border/70 pb-6">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent">
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-xl font-black uppercase italic tracking-tighter">
        {title}
      </h2>
    </div>
    <p className="text-sm text-muted-foreground font-medium">{desc}</p>
  </div>
);

export default function SocialLinksForm() {
  const { socialLinks, updateSocialLinks, fetchSocialLinks } = useAdminStore();
  const [isSaving, setIsSaving] = useState(false);
  const isLoaded = socialLinks !== null && socialLinks !== undefined;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      links: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "links",
  });

  // Fetch social links from database on component mount
  useEffect(() => {
    fetchSocialLinks();
  }, [fetchSocialLinks]);

  // Update form when data is fetched
  useEffect(() => {
    if (socialLinks) {
        // If socialLinks is an object (old format), we need to handle it.
        // If it's an array (new format), use it directly.
        let linksArray = [];
        if (Array.isArray(socialLinks)) {
            linksArray = socialLinks;
        } else if (typeof socialLinks === 'object' && Object.keys(socialLinks).length > 0) {
            // Convert old object format to new array format for the form
            linksArray = Object.entries(socialLinks)
                .filter(([key]) => ALLOWED_PLATFORMS.includes(key))
                .map(([key, value]) => ({
                    platform: key,
                    url: value.url || ""
                }))
                .filter(link => link.url !== "");
        }

        // If still empty and isLoaded is true, we might be at fallback.
        // But we want the user to see the current active data.
        if (linksArray.length > 0) {
            reset({ links: linksArray });
        }
    }
  }, [socialLinks, reset]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      // Save updated links
      const res = await updateSocialLinks(data.links);

      if (res.success) {
        toast.success("Social links synchronized with database!");
      } else {
        toast.error("Failed to save social links");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error saving social links");
    } finally {
      setIsSaving(false);
    }
  };

  const currentLinks = useWatch({ control, name: "links" }) || [];
  const availablePlatforms = ALLOWED_PLATFORMS.filter(
    p => !currentLinks.some(link => link.platform === p)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-10">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Social{" "}
            <span className="text-accent underline decoration-accent/20 underline-offset-8">
              Links
            </span>
          </h1>
          <p className="text-muted-foreground mt-3 font-medium">
            Manage your professional social profiles with real-time frontend sync
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <div className="bg-card/40 border border-border/70 p-10 rounded-[3rem]">
          <SectionHeader
            icon={Globe}
            title="Active Social Profiles"
            desc="Control which social links appear on your public portfolio"
          />

          <div className="space-y-4 relative z-10">
            {fields.map((field, index) => {
              const platformKey = currentLinks[index]?.platform || field.platform;
              const Icon = PLATFORM_ICONS[platformKey] || Globe;

              return (
                <div
                  key={field.id}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-card/50 border border-border/70 hover:border-accent/30 transition-all"
                >
                  <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-accent/60">
                      {PLATFORM_LABELS[platformKey]}
                    </label>
                    <input
                      type="url"
                      {...register(`links.${index}.url`)}
                      placeholder={`Enter your ${PLATFORM_LABELS[platformKey]} URL`}
                      className="w-full bg-transparent border-none p-0 text-sm font-medium focus:ring-0 placeholder:text-muted-foreground/20 text-foreground"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2.5 rounded-xl text-muted-foreground/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {fields.length === 0 && isLoaded && (
              <div className="text-center py-12 rounded-3xl border border-dashed border-border bg-card/40">
                <p className="text-muted-foreground text-sm font-medium">No social links configured in DB. Fallback data from data.js is active.</p>
              </div>
            )}

            {fields.length < 6 && availablePlatforms.length > 0 && (
              <div className="pt-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-4 px-2">Add New Platform</p>
                <div className="flex flex-wrap gap-2">
                  {availablePlatforms.map(platform => {
                    const Icon = PLATFORM_ICONS[platform];
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => append({ platform, url: "" })}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/50 border border-border hover:border-accent/40 hover:bg-accent/5 text-xs font-bold transition-all group"
                      >
                        <Icon className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent" />
                        {PLATFORM_LABELS[platform]}
                        <Plus className="w-3 h-3 ml-1 opacity-40" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {errors.links && (
            <p className="mt-4 text-xs text-red-400 font-bold px-2">
              {errors.links.message || "Please fix the errors above"}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground rounded-2xl font-black uppercase tracking-widest hover:bg-accent/90 disabled:opacity-50 transition-all shadow-xl shadow-accent/20"
          >
            <Save className="w-5 h-5" />
            {isSaving ? "Synchronizing..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
