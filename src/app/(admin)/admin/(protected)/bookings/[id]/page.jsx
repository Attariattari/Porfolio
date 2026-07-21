"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  ExternalLink,
  FileText,
  Globe2,
  Layers3,
  Link2,
  Loader2,
  LockKeyhole,
  Mail,
  MessageSquareText,
  NotebookPen,
  Phone,
  Send,
  Sparkles,
  TimerReset,
  Video,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  useBookingDetail,
  useRealTimeBookingUpdates,
  useUpdateBooking,
} from "@/app/(admin)/hooks/useBookings";

const pipeline = [
  { key: "new", label: "Received" },
  { key: "seen", label: "Reviewed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
];

const statusTheme = {
  new: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  read: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
  seen: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
  confirmed: "border-violet-400/25 bg-violet-400/10 text-violet-300",
  completed: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  rejected: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  cancelled: "border-zinc-400/25 bg-zinc-400/10 text-zinc-300",
};

function SectionTitle({ icon: Icon, eyebrow, title, action }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-white/[0.06] text-cyan-300 ring-1 ring-inset ring-white/[0.08]">
          <Icon className="size-4" />
        </span>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">{eyebrow}</p>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-100">{title}</h2>
        </div>
      </div>
      {action}
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="group flex min-w-0 gap-3 rounded-xl p-3 transition-colors hover:bg-white/[0.035]">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-slate-900/70 text-slate-400 ring-1 ring-inset ring-white/[0.07] group-hover:text-cyan-300">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-medium capitalize text-slate-200">{value}</p>
      </div>
    </div>
  );
}

export default function BookingDetailPage({ params }) {
  const { id } = use(params);
  const { data: booking, isLoading } = useBookingDetail(id);
  const updateMutation = useUpdateBooking();
  useRealTimeBookingUpdates();

  const [meetingLink, setMeetingLink] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [composing, setComposing] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!booking) return;
    setMeetingLink(booking.meetingLink || "");
    setAdminNote(booking.adminNote || "");
    setRejectionReason(booking.rejectionReason || "");
  }, [booking]);

  if (isLoading) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative grid size-16 place-items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06]">
            <Loader2 className="size-6 animate-spin text-cyan-300" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Opening booking workspace</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="max-w-sm text-center">
          <AlertTriangle className="mx-auto size-10 text-amber-300" />
          <h1 className="mt-5 text-xl font-semibold">Booking not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">This booking may have been removed or the link is no longer valid.</p>
          <Link href="/admin/bookings" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
            <ArrowLeft className="size-4" /> Back to bookings
          </Link>
        </div>
      </div>
    );
  }

  const isLocked = ["completed", "rejected", "cancelled"].includes(booking.status);
  const normalizedStatus = booking.status === "read" ? "seen" : booking.status;
  const currentIndex = pipeline.findIndex((step) => step.key === normalizedStatus);
  const serviceName = booking.serviceTitle || booking.service?.replace(/-/g, " ") || "General consultation";
  const initials = booking.name?.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "CL";

  const saveConfig = () => {
    updateMutation.mutate(
      { id: booking._id, meetingLink, adminNote },
      { onSuccess: () => toast.success("Workspace saved") },
    );
  };

  const transitionTo = (status, extras = {}) => {
    updateMutation.mutate(
      { id: booking._id, status, meetingLink, adminNote, ...extras },
      {
        onSuccess: () => {
          toast.success(`Booking marked as ${status}`);
          if (status === "rejected") setRejecting(false);
        },
      },
    );
  };

  const sendEmail = () => {
    if (!customMessage.trim()) return toast.error("Write a message first");
    updateMutation.mutate(
      { id: booking._id, isManualEmail: true, customMessage },
      {
        onSuccess: () => {
          toast.success("Email sent to client");
          setCustomMessage("");
          setComposing(false);
        },
      },
    );
  };

  const copyEmail = async () => {
    await navigator.clipboard.writeText(booking.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const details = [
    booking.projectType && { icon: Layers3, label: "Project type", value: booking.projectType },
    booking.timelinePreference && { icon: TimerReset, label: "Target timeline", value: booking.timelinePreference },
    booking.contactPreference && { icon: MessageSquareText, label: "Preferred contact", value: booking.contactPreference },
    booking.sourcePage && { icon: Globe2, label: "Source page", value: booking.sourcePage },
    booking.source && { icon: ExternalLink, label: "Origin", value: booking.source },
  ].filter(Boolean);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-[1480px] pb-16">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm">
          <Link href="/admin/bookings" className="grid size-10 place-items-center rounded-xl border border-border/70 bg-card/60 text-muted-foreground transition hover:border-cyan-400/30 hover:text-cyan-300">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link href="/admin/bookings" className="hover:text-foreground">Bookings</Link>
            <ChevronRight className="size-3.5" />
            <span className="font-medium text-foreground">Request overview</span>
          </div>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.18em] ${statusTheme[booking.status] || statusTheme.new}`}>
          <span className="size-1.5 rounded-full bg-current shadow-[0_0_12px_currentColor]" />
          {booking.status}
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0e1728] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-cyan-400/[0.07] blur-3xl" />
        <div className="grid lg:grid-cols-[1fr_330px]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300/80">
              <Sparkles className="size-3.5" /> Client request
            </p>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative grid size-20 shrink-0 place-items-center rounded-[24px] bg-gradient-to-br from-cyan-300 to-blue-600 text-2xl font-black text-slate-950 shadow-[0_18px_45px_-18px_rgba(34,211,238,0.8)]">
                {initials}
                <span className="absolute -bottom-1 -right-1 size-5 rounded-full border-[4px] border-[#0e1728] bg-emerald-400" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">{booking.name}</h1>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
                  <button onClick={copyEmail} className="flex items-center gap-2 transition hover:text-cyan-300">
                    <Mail className="size-4" /> {booking.email} {copied ? <Check className="size-3.5 text-emerald-300" /> : <Copy className="size-3.5 opacity-50" />}
                  </button>
                  {booking.phone && <a href={`tel:${booking.phone}`} className="flex items-center gap-2 transition hover:text-cyan-300"><Phone className="size-4" /> {booking.phone}</a>}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.07] bg-white/[0.025] p-6 lg:border-l lg:border-t-0 lg:p-8">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 size-5 text-cyan-300" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Scheduled for</p>
                <p className="mt-2 text-lg font-semibold text-white">{booking.preferredDate || "Date pending"}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400"><Clock3 className="size-3.5" /> {booking.preferredTime || "Time pending"}</p>
              </div>
            </div>
            <div className="my-6 h-px bg-white/[0.07]" />
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Service requested</p>
            <p className="mt-2 text-base font-semibold capitalize text-slate-100">{serviceName}</p>
          </div>
        </div>

        {!['rejected', 'cancelled'].includes(booking.status) && (
          <div className="border-t border-white/[0.07] px-6 py-6 sm:px-10">
            <div className="relative grid grid-cols-4">
              <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-4 h-[2px] overflow-hidden rounded-full bg-white/[0.08]">
                <motion.div
                  initial={false}
                  animate={{ width: `${Math.max(currentIndex, 0) / (pipeline.length - 1) * 100}%` }}
                  transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
                  className="relative h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 shadow-[0_0_12px_rgba(34,211,238,0.75)]"
                >
                  <motion.span
                    animate={{ x: ["-100%", "350%"] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[1px]"
                  />
                </motion.div>
              </div>
              {pipeline.map((step, index) => {
                const complete = index < currentIndex;
                const active = index === currentIndex;
                return (
                  <div key={step.key} className="relative flex flex-col items-center gap-2 text-center">
                    {active && (
                      <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: [1, 1.55], opacity: [0.35, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                        className="absolute top-0 size-8 rounded-full bg-cyan-300"
                      />
                    )}
                    <motion.span
                      initial={false}
                      animate={{
                        scale: active ? 1.08 : 1,
                        backgroundColor: complete ? "var(--accent)" : "var(--muted)",
                      }}
                      transition={{ duration: 0.35, delay: complete ? index * 0.16 : 0 }}
                      className={`relative z-10 grid size-8 place-items-center rounded-full border text-[10px] font-bold transition-colors duration-300 ${complete ? "border-cyan-200 text-slate-950 shadow-[0_0_16px_rgba(34,211,238,0.35)]" : active ? "border-cyan-300 text-cyan-300 ring-4 ring-cyan-400/10" : "border-white/10 text-slate-600"}`}
                    >
                      {complete ? <Check className="size-3.5" /> : index + 1}
                    </motion.span>
                    <span className={`text-[9px] font-bold uppercase tracking-[0.15em] ${active ? "text-cyan-300" : complete ? "text-slate-300" : "text-slate-600"}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/45">
            <SectionTitle icon={FileText} eyebrow="Request brief" title="Project information" />
            <div className="grid gap-1 p-3 sm:grid-cols-2 sm:p-4">{details.map((item) => <DetailItem key={item.label} {...item} />)}</div>
          </section>

          {booking.message && (
            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/45">
              <SectionTitle icon={MessageSquareText} eyebrow="Client voice" title="What they have in mind" />
              <div className="p-5 sm:p-7">
                <blockquote className="border-l-2 border-cyan-400/60 pl-5 text-[15px] leading-7 text-slate-300">{booking.message}</blockquote>
              </div>
            </section>
          )}

          <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/45">
            <SectionTitle
              icon={Send}
              eyebrow="Communication"
              title="Email client"
              action={!isLocked && <button onClick={() => setComposing((value) => !value)} className="rounded-lg border border-violet-400/25 bg-violet-400/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-300 hover:bg-violet-400/15">{composing ? "Close" : "Compose"}</button>}
            />
            <AnimatePresence mode="wait">
              {composing && !isLocked ? (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="space-y-4 p-5 sm:p-6">
                    <p className="text-xs text-slate-500">To <span className="text-slate-300">{booking.email}</span></p>
                    <textarea value={customMessage} onChange={(event) => setCustomMessage(event.target.value)} placeholder="Write a clear update for the client..." className="min-h-36 w-full resize-none rounded-xl border border-white/[0.08] bg-slate-950/40 p-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-violet-400/40" />
                    <button onClick={sendEmail} disabled={updateMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-xs font-bold text-white transition hover:bg-violet-400 disabled:opacity-50"><Send className="size-4" /> Send email</button>
                  </div>
                </motion.div>
              ) : (
                <p className="px-6 py-5 text-sm text-slate-500">Send a direct update without leaving this booking.</p>
              )}
            </AnimatePresence>
          </section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28">
          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101a2c] shadow-xl">
            <SectionTitle
              icon={Video}
              eyebrow="Meeting setup"
              title="Prepare the call"
              action={!isLocked && (
                <button
                  type="button"
                  onClick={saveConfig}
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-200 transition hover:bg-cyan-300/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updateMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                  Save changes
                </button>
              )}
            />
            <div className="space-y-5 p-5 sm:p-6">
              <label className="block">
                <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Meeting link</span>
                <div className="relative"><Link2 className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-600" /><input type="url" disabled={isLocked} value={meetingLink} onChange={(event) => setMeetingLink(event.target.value)} placeholder="https://meet.google.com/..." className="w-full rounded-xl border border-white/[0.08] bg-slate-950/40 py-3 pl-10 pr-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 disabled:opacity-50" /></div>
              </label>
              <label className="block">
                <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Private note</span>
                <div className="relative"><NotebookPen className="absolute left-3.5 top-3.5 size-4 text-slate-600" /><textarea disabled={isLocked} value={adminNote} onChange={(event) => setAdminNote(event.target.value)} placeholder="Context, questions, reminders..." className="min-h-24 w-full resize-none rounded-xl border border-white/[0.08] bg-slate-950/40 py-3 pl-10 pr-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 disabled:opacity-50" /></div>
              </label>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101a2c] shadow-xl">
            <SectionTitle icon={CheckCircle2} eyebrow="Decision center" title="Booking actions" />
            <div className="p-5 sm:p-6">
              {isLocked ? (
                <div className={`rounded-xl border p-4 ${booking.status === "rejected" ? "border-rose-400/20 bg-rose-400/[0.07]" : "border-emerald-400/20 bg-emerald-400/[0.07]"}`}>
                  <div className="flex gap-3"><LockKeyhole className={`mt-0.5 size-4 ${booking.status === "rejected" ? "text-rose-300" : "text-emerald-300"}`} /><div><p className="text-sm font-semibold capitalize text-slate-200">Booking {booking.status}</p><p className="mt-1 text-xs text-slate-500">This request has been finalized.</p></div></div>
                  {booking.rejectionReason && <p className="mt-4 border-t border-white/[0.07] pt-4 text-xs leading-5 text-slate-400">{booking.rejectionReason}</p>}
                </div>
              ) : (
                <div className="space-y-3">
                  <button onClick={() => transitionTo(booking.status === "confirmed" ? "completed" : "confirmed")} disabled={updateMutation.isPending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 py-3.5 text-xs font-black uppercase tracking-[0.12em] text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50">
                    {booking.status === "confirmed" ? <CheckCircle2 className="size-4" /> : <CalendarDays className="size-4" />}
                    {booking.status === "confirmed" ? "Complete booking" : "Confirm booking"}
                  </button>
                  <button onClick={() => setRejecting((value) => !value)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-400/20 py-3 text-xs font-bold text-rose-300 transition hover:bg-rose-400/[0.07]"><XCircle className="size-4" /> {rejecting ? "Cancel decline" : "Decline request"}</button>
                  <AnimatePresence>
                    {rejecting && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="mt-2 space-y-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.05] p-4">
                          <div className="flex items-center gap-2 text-xs font-semibold text-rose-300"><AlertTriangle className="size-4" /> The client will receive this reason</div>
                          <textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Briefly explain why..." className="min-h-24 w-full resize-none rounded-lg border border-rose-400/15 bg-slate-950/40 p-3 text-sm outline-none placeholder:text-slate-700 focus:border-rose-400/40" />
                          <button onClick={() => transitionTo("rejected", { rejectionReason })} disabled={updateMutation.isPending || !rejectionReason.trim()} className="w-full rounded-lg bg-rose-500 py-3 text-xs font-bold text-white transition hover:bg-rose-400 disabled:opacity-40">Confirm decline</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </motion.div>
  );
}
