"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Building2, Check, Circle, ExternalLink, Globe2, KeyRound, Loader2, LockKeyhole, Mail, MapPin, Moon, Palette, Save, Search, ShieldCheck, Sparkles, Sun, UserRound } from "lucide-react";
import useAdminStore from "@/lib/store/adminStore";
import { useTheme } from "@/components/ThemeProvider";
import SuperAdminTransferModal from "@/components/admin/SuperAdminTransferModal";
import { HOME_SEO_DESCRIPTION, HOME_SEO_LIMITS, HOME_SEO_TITLE, resolveHomeSeo } from "@/lib/homeSeo";

const schema = z.object({
  siteTitle: z.string().min(2, "Brand title needs at least 2 characters"),
  siteAccent: z.string().min(2, "Accent text needs at least 2 characters"),
  adminName: z.string().min(2, "Administrator name is required"),
  email: z.string().email("Enter a valid email address"),
  location: z.string().min(5, "Enter a complete location"),
  seoTitle: z.string().min(HOME_SEO_LIMITS.title.min, `Use at least ${HOME_SEO_LIMITS.title.min} characters`).max(HOME_SEO_LIMITS.title.max, `Use no more than ${HOME_SEO_LIMITS.title.max} characters`),
  seoDescription: z.string().min(HOME_SEO_LIMITS.description.min, `Use at least ${HOME_SEO_LIMITS.description.min} characters`).max(HOME_SEO_LIMITS.description.max, `Use no more than ${HOME_SEO_LIMITS.description.max} characters`),
  siteTheme: z.enum(["light", "dark", "black"]),
});

const themes = [
  { id: "light", label: "Light", description: "Bright and editorial", Icon: Sun, preview: "bg-slate-100 text-slate-900" },
  { id: "dark", label: "Dark", description: "Deep navy workspace", Icon: Moon, preview: "bg-slate-900 text-slate-100" },
  { id: "black", label: "Black", description: "True-black premium", Icon: Circle, preview: "bg-black text-white" },
];

function Field({ label, help, error, icon: Icon, children }) {
  return <label className="block"><span className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">{Icon && <Icon className="h-4 w-4 text-muted-foreground" />}{label}</span>{children}{error ? <span className="mt-1.5 block text-xs font-medium text-red-500">{error.message}</span> : help ? <span className="mt-1.5 block text-xs leading-5 text-muted-foreground">{help}</span> : null}</label>;
}

function Section({ number, icon: Icon, title, description, children, aside }) {
  return <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-sm"><header className="flex flex-col gap-4 border-b border-border/70 p-5 md:flex-row md:items-center md:justify-between md:p-6"><div className="flex items-start gap-3.5"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent"><Icon className="h-5 w-5" /></div><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-accent">{number}</p><h2 className="mt-0.5 text-lg font-bold text-foreground">{title}</h2><p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p></div></div>{aside}</header><div className="p-5 md:p-6">{children}</div></section>;
}

export default function SettingsPage() {
  const { settings, updateSettings, fetchSettings, addNotification } = useAdminStore();
  const { theme, setTheme } = useTheme();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(Boolean(searchParams.get("highlight")));

  useEffect(() => { fetchSettings(); }, [fetchSettings]);
  useEffect(() => { if (!highlighted) return; const timer = window.setTimeout(() => setHighlighted(false), 4000); return () => window.clearTimeout(timer); }, [highlighted]);

  const defaults = useMemo(() => {
    const seo = resolveHomeSeo(settings?.seo);
    return { siteTitle: settings?.siteTitle ?? "Muhyo", siteAccent: settings?.siteAccent ?? "Tech", adminName: settings?.adminName ?? "Pir Ghulam Muhyo Din", email: settings?.email ?? "attariattari549@gmail.com", location: settings?.location ?? "Lahore, Pakistan", seoTitle: seo.title || HOME_SEO_TITLE, seoDescription: seo.description || HOME_SEO_DESCRIPTION, siteTheme: ["light", "dark", "black"].includes(settings?.siteTheme) ? settings.siteTheme : "black" };
  }, [settings]);

  const { register, handleSubmit, formState: { errors, isDirty }, reset, setValue, control } = useForm({ resolver: zodResolver(schema), defaultValues: defaults });
  const watched = useWatch({ control });
  const seoTitle = watched.seoTitle || "";
  const seoDescription = watched.seoDescription || "";
  useEffect(() => { if (settings && Object.keys(settings).length) reset(defaults); }, [settings, defaults, reset]);

  const submit = async (data) => {
    setSaving(true);
    try {
      const payload = { siteTitle: data.siteTitle.trim(), siteAccent: data.siteAccent.trim(), adminName: data.adminName.trim(), email: data.email.trim(), location: data.location.trim(), seo: { title: data.seoTitle.trim(), description: data.seoDescription.trim() }, siteTheme: data.siteTheme };
      const result = await Promise.race([updateSettings(payload), new Promise((_, reject) => window.setTimeout(() => reject(new Error("Save timed out. Please try again.")), 15000))]);
      if (!result.success) return toast.error(result.error || "Settings could not be saved.");
      reset(data);
      addNotification({ title: "Website settings updated", message: "Brand, contact and search settings were successfully published.", type: "SYSTEM" });
      toast.success("Website settings published.");
    } catch (error) { toast.error(error.message || "Settings could not be saved."); } finally { setSaving(false); }
  };

  const changeTheme = async (nextTheme) => {
    if (themeSaving || (nextTheme === theme && nextTheme === defaults.siteTheme)) return;
    const previous = theme;
    setTheme(nextTheme, { clearPreference: true }); setValue("siteTheme", nextTheme, { shouldDirty: false }); setThemeSaving(true);
    try { const result = await updateSettings({ siteTheme: nextTheme }); if (!result.success) throw new Error(result.error || "Theme update failed"); addNotification({ title: "Website theme updated", message: `${nextTheme[0].toUpperCase()}${nextTheme.slice(1)} theme is now active across the website.`, type: "SYSTEM" }); }
    catch (error) { setTheme(previous, { clearPreference: true }); setValue("siteTheme", previous, { shouldDirty: false }); toast.error(error.message); }
    finally { setThemeSaving(false); }
  };

  const inputClass = "h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/10";
  return <main className={`mx-auto max-w-7xl space-y-6 rounded-[2rem] pb-28 transition ${highlighted ? "ring-4 ring-accent/10" : ""}`}>
    <SuperAdminTransferModal isOpen={transferOpen} onClose={() => setTransferOpen(false)} currentEmail={settings?.superAdminEmail || settings?.email || ""} />

    <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm md:p-8"><div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-accent/10 blur-3xl" /><div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center"><div className="flex items-start gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/20"><Globe2 className="h-6 w-6" /></div><div><div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-accent"><Sparkles className="h-3.5 w-3.5" /> Website control center</div><h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Settings</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Manage your public brand, contact identity, appearance and homepage search preview from one place.</p></div></div><div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-500"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Connected to website</div></div></section>

    <section className="grid gap-3 sm:grid-cols-3">{[{ label: "Brand", note: "Navigation & footer", Icon: Building2 }, { label: "Homepage SEO", note: "Google search preview", Icon: Search }, { label: "Global theme", note: "Website & admin", Icon: Palette }].map(({ label, note, Icon }) => <div key={label} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground"><Icon className="h-4.5 w-4.5" /></div><div><p className="text-sm font-bold text-foreground">{label}</p><p className="text-xs text-muted-foreground">{note}</p></div><Check className="ml-auto h-4 w-4 text-emerald-500" /></div>)}</section>

    <Section number="01 · Appearance" icon={Palette} title="Website theme" description="Choose the default experience visitors and administrators see."><div className="grid gap-3 md:grid-cols-3">{themes.map(({ id, label, description, Icon, preview }) => { const active = theme === id; return <button key={id} type="button" onClick={() => changeTheme(id)} disabled={themeSaving} className={`rounded-2xl border p-4 text-left transition disabled:opacity-60 ${active ? "border-accent bg-accent/5 ring-4 ring-accent/10" : "border-border bg-background/30 hover:border-accent/30"}`}><div className={`mb-4 h-24 overflow-hidden rounded-xl border border-white/10 p-3 ${preview}`}><div className="mb-3 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-current opacity-30" /><span className="h-2 w-2 rounded-full bg-current opacity-20" /><span className="h-2 w-2 rounded-full bg-current opacity-10" /></div><div className="flex gap-2"><span className="h-12 w-1/3 rounded-lg bg-current opacity-10" /><span className="h-12 flex-1 rounded-lg bg-current opacity-10" /></div></div><div className="flex items-center gap-3"><Icon className="h-5 w-5 text-accent" /><div><p className="text-sm font-bold text-foreground">{label}</p><p className="text-xs text-muted-foreground">{description}</p></div>{active && <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground"><Check className="h-3.5 w-3.5" /></span>}</div></button>; })}</div></Section>

    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <Section number="02 · Identity" icon={Building2} title="Brand & contact details" description="These details identify your business across the public website."><div className="space-y-5"><div className="rounded-2xl border border-border bg-background/35 p-4"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Live brand preview</p><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Globe2 className="h-5 w-5" /></div><div><p className="text-xl font-black tracking-tight text-foreground">{watched.siteTitle || "Your brand"} <span className="text-accent">{watched.siteAccent || "Accent"}</span></p><p className="text-xs text-muted-foreground">Public navigation and footer identity</p></div></div></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Brand title" help="Main part of your public brand name." error={errors.siteTitle}><input {...register("siteTitle")} className={inputClass} placeholder="Muhyo" /></Field><Field label="Accent text" help="Highlighted part of your brand name." error={errors.siteAccent}><input {...register("siteAccent")} className={inputClass} placeholder="Tech" /></Field></div><Field label="Administrator name" icon={UserRound} error={errors.adminName}><input {...register("adminName")} className={inputClass} /></Field><Field label="Public contact email" icon={Mail} help="Used in structured business information and contact identity." error={errors.email}><input {...register("email")} type="email" className={inputClass} /></Field><Field label="Business location" icon={MapPin} help="Used in business identity and location information." error={errors.location}><input {...register("location")} className={inputClass} /></Field></div></Section>

        <div className="space-y-6"><Section number="03 · Discoverability" icon={Search} title="Homepage SEO" description="Control how the homepage appears in search results." aside={<a href="/" target="_blank" className="inline-flex items-center gap-2 text-xs font-semibold text-accent hover:underline">View website <ExternalLink className="h-3.5 w-3.5" /></a>}><div className="space-y-5"><div className="rounded-2xl border border-border bg-background p-4"><p className="text-xs text-emerald-500">yourwebsite.com</p><p className="mt-1 line-clamp-1 text-lg font-medium text-blue-500">{seoTitle || "Homepage search title"}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{seoDescription || "Your homepage search description will appear here."}</p></div><Field label="Search title" error={errors.seoTitle} help={`${seoTitle.length}/${HOME_SEO_LIMITS.title.max} characters · recommended ${HOME_SEO_LIMITS.title.min}–${HOME_SEO_LIMITS.title.max}`}><input {...register("seoTitle")} maxLength={HOME_SEO_LIMITS.title.max} className={inputClass} /></Field><Field label="Search description" error={errors.seoDescription} help={`${seoDescription.length}/${HOME_SEO_LIMITS.description.max} characters · recommended ${HOME_SEO_LIMITS.description.min}–${HOME_SEO_LIMITS.description.max}`}><textarea {...register("seoDescription")} maxLength={HOME_SEO_LIMITS.description.max} rows={5} className={`${inputClass} h-auto resize-none py-3`} /></Field></div></Section>

          <Section number="04 · Security" icon={LockKeyhole} title="Super administrator" description="Transfer primary ownership only when responsibility changes."><div className="flex flex-col gap-4 rounded-2xl border border-red-500/15 bg-red-500/[.04] p-4 sm:flex-row sm:items-center"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500"><KeyRound className="h-5 w-5" /></div><div className="flex-1"><p className="text-sm font-bold text-foreground">Protected ownership transfer</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Requires verification and securely updates the primary administrator email.</p></div><button type="button" onClick={() => setTransferOpen(true)} className="h-10 rounded-xl border border-red-500/20 bg-red-500/10 px-4 text-xs font-bold text-red-500 transition hover:bg-red-500 hover:text-white">Transfer ownership</button></div></Section></div>
      </div>

      <div className="fixed bottom-5 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/90 p-3 pl-5 shadow-2xl backdrop-blur-xl md:left-[calc(50%+var(--sidebar-width,0px)/2)]"><div><p className="text-sm font-bold text-foreground">{isDirty ? "You have unpublished changes" : "Settings are up to date"}</p><p className="hidden text-xs text-muted-foreground sm:block">Save to publish changes across the website.</p></div><motion.button type="submit" whileTap={{ scale: .98 }} disabled={saving || !isDirty} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-bold text-accent-foreground shadow-lg shadow-accent/20 transition disabled:cursor-not-allowed disabled:opacity-45">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? "Publishing…" : "Publish settings"}</motion.button></div>
    </form>
  </main>;
}
