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
  Phone,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import useAdminStore from "@/lib/store/adminStore";
import { normalizeSocialProfileUrl } from "@/lib/socialProfileUrl";

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

function parseWhatsAppUrl(rawUrl = "") {
  if (!rawUrl) return { phone: "", message: "" };

  try {
    if (rawUrl.includes("wa.me/") || rawUrl.includes("whatsapp.com/")) {
      const parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
      let phone = parsed.pathname.replace(/^\//, "").split("/")[0] || "";

      if (!phone && parsed.searchParams.has("phone")) {
        phone = parsed.searchParams.get("phone") || "";
      }
      phone = phone.replace(/[^0-9]/g, "");

      let message = parsed.searchParams.get("text") || "";
      try {
        message = decodeURIComponent(message);
      } catch (e) {
        // fallback to raw message
      }
      return { phone, message };
    }
  } catch (e) {
    // ignore parse error
  }

  const cleanPhone = rawUrl.replace(/[^0-9]/g, "");
  return { phone: cleanPhone, message: "" };
}

function buildWhatsAppUrl(phone = "", message = "") {
  const cleanPhone = (phone || "").replace(/[^0-9]/g, "");
  if (!cleanPhone) return "";

  const trimmedMsg = (message || "").trim();
  if (trimmedMsg) {
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(trimmedMsg)}`;
  }
  return `https://wa.me/${cleanPhone}`;
}

// Validation schema
const socialLinkSchema = z.object({
  platform: z.enum(ALLOWED_PLATFORMS),
  url: z.string().optional(),
  whatsappPhone: z.string().optional(),
  whatsappMessage: z.string().optional(),
}).superRefine((link, context) => {
  if (link.platform === "whatsapp") {
    if (!link.whatsappPhone && !link.url) {
      context.addIssue({
        code: "custom",
        path: ["whatsappPhone"],
        message: "WhatsApp phone number is required",
      });
    }
  } else {
    if (!link.url || !link.url.trim()) {
      context.addIssue({
        code: "custom",
        path: ["url"],
        message: "Username or URL is required",
      });
    }
  }
});

const socialLinksSchema = z.object({
  links: z.array(socialLinkSchema).max(6, "Maximum 6 social links allowed"),
});

const SectionHeader = ({ icon: Icon, title, desc }) => (
  <div className="mb-6 flex items-start gap-3 border-b border-white/[0.07] pb-5">
    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
      <Icon className="size-4" />
    </span>
    <div>
      <p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-600">
        Profile connections
      </p>
      <h2 className="mt-1 text-sm font-semibold text-slate-100">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p>
    </div>
  </div>
);

export default function SocialLinksForm() {
  const { socialLinks, updateSocialLinks, fetchSocialLinks } = useAdminStore();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
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
    let linksArray = [];

    if (Array.isArray(socialLinks) && socialLinks.length > 0) {
      linksArray = socialLinks.map((link) => {
        const platform = link.platform?.toLowerCase() || "";
        const url = link.url || "";
        if (platform === "whatsapp") {
          const { phone, message } = parseWhatsAppUrl(url);
          return {
            platform,
            url: buildWhatsAppUrl(phone, message),
            whatsappPhone: phone,
            whatsappMessage: message,
          };
        }
        return { platform, url };
      }).filter((link) => link.platform && (link.url || link.whatsappPhone));
    } else if (typeof socialLinks === "object" && socialLinks !== null && Object.keys(socialLinks).length > 0) {
      linksArray = Object.entries(socialLinks)
        .filter(([key]) => ALLOWED_PLATFORMS.includes(key.toLowerCase()))
        .map(([key, value]) => {
          const platform = key.toLowerCase();
          const url = typeof value === "string" ? value : value?.url || "";
          if (platform === "whatsapp") {
            const { phone, message } = parseWhatsAppUrl(url);
            return {
              platform,
              url: buildWhatsAppUrl(phone, message),
              whatsappPhone: phone,
              whatsappMessage: message,
            };
          }
          return { platform, url };
        })
        .filter((link) => link.url || link.whatsappPhone);
    }

    // Default fallback if database returned empty links
    if (linksArray.length === 0) {
      const defaultWhatsapp = "https://wa.me/923224458481?text=Hi%20Ghulam%20Muhyo%20Din!%20I%20came%20across%20your%20portfolio%20and%20would%20love%20to%20connect.%20Are%20you%20available%20to%20discuss%20a%20potential%20project%20or%20collaboration%3F";
      const { phone, message } = parseWhatsAppUrl(defaultWhatsapp);

      linksArray = [
        {
          platform: "whatsapp",
          url: defaultWhatsapp,
          whatsappPhone: phone,
          whatsappMessage: message,
        },
        { platform: "linkedin", url: "https://www.linkedin.com/in/ghulam-muhyo-din-web-designer" },
        { platform: "twitter", url: "https://x.com/GhulamMuhyo" },
        { platform: "facebook", url: "https://www.facebook.com/MuhammadMuhyoDinAttari" },
        { platform: "github", url: "https://github.com/Attariattari" },
        { platform: "instagram", url: "https://www.instagram.com/muhyotech" },
      ];
    }

    reset({ links: linksArray });
  }, [socialLinks, reset]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const normalizedLinks = data.links.map((link) => {
        if (link.platform === "whatsapp") {
          const finalUrl = buildWhatsAppUrl(link.whatsappPhone, link.whatsappMessage);
          return {
            platform: "whatsapp",
            url: finalUrl,
          };
        }
        return {
          ...link,
          url: normalizeSocialProfileUrl(link.platform, link.url),
        };
      });

      // Save updated links to MongoDB
      const res = await updateSocialLinks(normalizedLinks);

      if (res.success) {
        // Re-parse and reset form
        const updatedParsed = normalizedLinks.map((link) => {
          if (link.platform === "whatsapp") {
            const { phone, message } = parseWhatsAppUrl(link.url);
            return {
              platform: "whatsapp",
              url: link.url,
              whatsappPhone: phone,
              whatsappMessage: message,
            };
          }
          return link;
        });
        reset({ links: updatedParsed });
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
    (p) => !currentLinks.some((link) => link.platform === p)
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      <header className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0d1727] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-cyan-400/[0.06] blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300 ring-1 ring-inset ring-cyan-400/15">
              <Globe className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.24em] text-cyan-300">
                Public presence
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-.035em] text-white sm:text-3xl">
                Social links
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Manage the professional profiles shown across your portfolio.
              </p>
            </div>
          </div>
          <button
            type="submit"
            form="social-links-form"
            disabled={isSaving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 text-xs font-bold text-slate-950 hover:bg-cyan-200 disabled:opacity-50"
          >
            <Save className="size-4" />
            {isSaving ? "Saving" : "Save changes"}
          </button>
        </div>
      </header>

      <form id="social-links-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-[24px] border border-white/[0.08] bg-[#0d1727] p-6 sm:p-8">
          <SectionHeader
            icon={Globe}
            title="Active Social Profiles"
            desc="Control which social links appear on your public portfolio"
          />

          <div className="space-y-4 relative z-10">
            {fields.map((field, index) => {
              const platformKey = field.platform || currentLinks[index]?.platform || "github";
              const Icon = PLATFORM_ICONS[platformKey] || Globe;
              const fieldName = `links.${index}.url`;
              const platformName = `links.${index}.platform`;
              const phoneName = `links.${index}.whatsappPhone`;
              const messageName = `links.${index}.whatsappMessage`;

              const isWhatsApp = platformKey === "whatsapp";

              const currentPhone = currentLinks[index]?.whatsappPhone || "";
              const currentMsg = currentLinks[index]?.whatsappMessage || "";
              const liveGeneratedUrl = isWhatsApp
                ? buildWhatsAppUrl(currentPhone, currentMsg)
                : currentLinks[index]?.url || "";

              return (
                <div
                  key={field.id}
                  className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.025]"
                >
                  <input type="hidden" {...register(platformName)} defaultValue={platformKey} />
                  <input type="hidden" {...register(fieldName)} value={liveGeneratedUrl} />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-[.18em] text-cyan-300">
                          {PLATFORM_LABELS[platformKey] || platformKey}
                        </label>
                        <p className="text-xs text-slate-400">
                          {isWhatsApp
                            ? "Configure your direct WhatsApp contact number and default greeting message"
                            : `Manage your public ${PLATFORM_LABELS[platformKey]} profile link`}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2.5 rounded-xl text-muted-foreground/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      title="Remove link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Standard Platform Input */}
                  {!isWhatsApp && (
                    <div className="mt-4">
                      <input
                        type="text"
                        {...register(fieldName)}
                        onBlur={(event) => {
                          const normalizedUrl = normalizeSocialProfileUrl(
                            platformKey,
                            event.target.value,
                          );
                          setValue(fieldName, normalizedUrl, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        placeholder={`Enter ${PLATFORM_LABELS[platformKey] || platformKey} username or URL`}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm font-medium text-slate-200 outline-none focus:border-cyan-400/50 placeholder:text-slate-600"
                      />
                    </div>
                  )}

                  {/* Dual WhatsApp Inputs */}
                  {isWhatsApp && (
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Phone Field */}
                        <div className="space-y-1">
                          <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.15em] text-slate-400">
                            <Phone className="w-3 h-3 text-emerald-400" /> WhatsApp Number
                          </label>
                          <input
                            type="tel"
                            inputMode="tel"
                            {...register(phoneName)}
                            placeholder="e.g. 923224458481"
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm font-mono font-medium text-emerald-300 outline-none focus:border-emerald-500/50 placeholder:text-slate-600"
                          />
                        </div>

                        {/* Welcome Message Field */}
                        <div className="space-y-1">
                          <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.15em] text-slate-400">
                            <MessageSquare className="w-3 h-3 text-cyan-400" /> Default Welcome Message
                          </label>
                          <input
                            type="text"
                            {...register(messageName)}
                            placeholder="e.g. Hi Ghulam Muhyo Din! I came across your portfolio..."
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm font-medium text-slate-200 outline-none focus:border-cyan-400/50 placeholder:text-slate-600"
                          />
                        </div>
                      </div>

                      {/* Live Generated URL Badge */}
                      {liveGeneratedUrl && (
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/40 border border-white/5 text-xs text-slate-400">
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                          <span className="font-mono text-[11px] truncate text-slate-300">
                            {liveGeneratedUrl}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {fields.length < 6 && availablePlatforms.length > 0 && (
              <div className="pt-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-4 px-2">
                  Add New Platform
                </p>
                <div className="flex flex-wrap gap-2">
                  {availablePlatforms.map((platform) => {
                    const Icon = PLATFORM_ICONS[platform];
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => {
                          if (platform === "whatsapp") {
                            append({
                              platform: "whatsapp",
                              url: "https://wa.me/923224458481",
                              whatsappPhone: "923224458481",
                              whatsappMessage: "Hi Ghulam Muhyo Din!",
                            });
                          } else {
                            append({ platform, url: "" });
                          }
                        }}
                        className="group flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-2.5 text-xs font-semibold text-slate-400 transition hover:border-cyan-400/25 hover:text-cyan-300"
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
      </form>
    </div>
  );
}
