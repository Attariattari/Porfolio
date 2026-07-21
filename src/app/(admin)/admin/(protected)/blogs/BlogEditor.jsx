"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, FileText, Image as ImageIcon, Loader2, Save, Search, Star, Tag } from "lucide-react";
import { toast } from "sonner";
import ImageUploader from "@/components/admin/ImageUploader";
import useAdminStore from "@/lib/store/adminStore";
import { uploadPendingImages } from "@/lib/uploadHelper";

const defaults = { title: "", slug: "", summary: "", content: "", category: "", tags: "", image: [], featured: false, readTime: "5 min read", publishStatus: "draft" };

export default function BlogEditor({ blogId = null }) {
  const router = useRouter();
  const { blogs, fetchBlogs, addBlog, updateBlog } = useAdminStore();
  const [loading, setLoading] = useState(Boolean(blogId));
  const [persistedId, setPersistedId] = useState(null);
  const { register, control, reset, handleSubmit, formState: { isSubmitting, errors } } = useForm({ defaultValues: defaults });
  const title = useWatch({ control, name: "title" }) || "Your article headline";
  const summary = useWatch({ control, name: "summary" }) || "A concise article summary will appear here as you write.";
  const category = useWatch({ control, name: "category" }) || "Category";
  const readTime = useWatch({ control, name: "readTime" }) || "5 min read";

  useEffect(() => { Promise.resolve(fetchBlogs()).finally(() => setLoading(false)); }, [fetchBlogs]);
  useEffect(() => {
    if (!blogId) return;
    let active = true;
    fetch("/api/blogs?includeContent=true", { credentials: "include" })
      .then((response) => response.json())
      .then((result) => {
        if (!active) return;
        const blog = (result.data || blogs).find((item) => item._id === blogId || item.slug === blogId);
        if (blog) {
          setPersistedId(blog._id || null);
          reset({ ...defaults, ...blog, tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags || "", image: blog.image ? [blog.image] : blog.featuredImage?.url ? [blog.featuredImage.url] : [] });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { active = false; };
  }, [blogId, blogs, reset]);

  const submit = async (data) => {
    const toastId = toast.loading(persistedId ? "Updating article..." : "Publishing article...");
    try {
      const images = await uploadPendingImages(data.image || []);
      const payload = { ...data, image: images[0] || "", tags: String(data.tags || "").split(",").map((item) => item.trim()).filter(Boolean) };
      const result = persistedId ? await updateBlog(persistedId, payload) : await addBlog(payload);
      if (!result?.success) throw new Error(result?.error || "Could not save article");
      toast.success(persistedId ? "Article updated" : "Article created", { id: toastId });
      router.push("/admin/blogs"); router.refresh();
    } catch (error) { toast.error(error.message, { id: toastId }); }
  };

  if (loading) return <div className="grid min-h-[65vh] place-items-center"><Loader2 className="size-7 animate-spin text-violet-300" /></div>;
  return <form onSubmit={handleSubmit(submit)} className="mx-auto max-w-[1500px] pb-24"><header className="mb-6 flex flex-col justify-between gap-4 rounded-[22px] border border-white/[0.09] bg-[#0d1727] p-4 sm:flex-row sm:items-center sm:px-6"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => router.push("/admin/blogs")} className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] text-slate-500 hover:text-white"><ArrowLeft className="size-4" /></button><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[.2em] text-violet-300">Article editor</p><h1 className="mt-1 truncate text-lg font-semibold text-white">{blogId ? "Edit article" : "Write a new article"}</h1></div></div><button disabled={isSubmitting} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-300 px-5 text-xs font-bold text-slate-950 hover:bg-violet-200 disabled:opacity-50">{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{blogId ? "Save changes" : "Publish article"}</button></header><div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]"><div className="space-y-6"><Section icon={FileText} eyebrow="01 · Article" title="Headline and introduction"><div className="grid gap-5 md:grid-cols-2"><Field label="Article headline" error={errors.title?.message} wide><input {...register("title", { required: "Headline is required", minLength: { value: 10, message: "Use at least 10 characters" } })} /></Field><Field label="URL slug" error={errors.slug?.message}><input {...register("slug", { required: "Slug is required" })} /></Field><Field label="Category" error={errors.category?.message}><input {...register("category", { required: "Category is required" })} /></Field><Field label="Tags" wide><input {...register("tags")} placeholder="Comma separated" /></Field><Field label="Article summary" error={errors.summary?.message} wide><textarea {...register("summary", { required: "Summary is required", minLength: { value: 20, message: "Write at least 20 characters" } })} rows={4} /></Field></div></Section><Section icon={BookOpen} eyebrow="02 · Content" title="Article body"><p className="text-xs leading-5 text-slate-500">Write in Markdown or HTML. Headings, lists, links and code blocks are supported.</p><Field label="Full article content" error={errors.content?.message}><textarea {...register("content", { required: "Article content is required", minLength: { value: 50, message: "Write at least 50 characters" } })} rows={20} className="font-mono" /></Field></Section><Section icon={Search} eyebrow="03 · Metadata" title="Reading information"><div className="grid gap-5 md:grid-cols-2"><Field label="Estimated read time"><input {...register("readTime")} placeholder="5 min read" /></Field><Field label="Publication status"><select {...register("publishStatus")}><option value="draft">Draft — hidden</option><option value="pending">Pending review</option><option value="published">Published — live</option></select></Field></div><label className="mt-5 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-slate-950/25 p-4 text-sm text-slate-300"><input type="checkbox" {...register("featured")} className="size-4 accent-violet-300" /><Star className="size-4 text-amber-300" />Feature this article</label></Section></div><aside className="space-y-6 xl:sticky xl:top-28"><Section icon={ImageIcon} eyebrow="Article media" title="Featured image"><Controller name="image" control={control} render={({ field }) => <ImageUploader images={field.value || []} onChange={field.onChange} compact maxFiles={1} />} /><p className="mt-3 text-[10px] leading-5 text-slate-600">Use a landscape image with a clear focal point. Recommended ratio: 16:9.</p></Section><Section icon={CheckCircle2} eyebrow="Live preview" title="Article card"><div className="rounded-2xl border border-violet-400/15 bg-violet-400/[0.035] p-5"><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-violet-300"><Tag className="size-3" />{category}</div><h2 className="mt-3 text-base font-semibold leading-6 text-white">{title}</h2><p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-500">{summary}</p><div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-4 text-[9px] text-slate-600"><Clock3 className="size-3" />{readTime}</div></div></Section></aside></div></form>;
}

function Section({ icon: Icon, eyebrow, title, children }) { return <section className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727]"><div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4 sm:px-6"><span className="grid size-9 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><Icon className="size-4" /></span><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-600">{eyebrow}</p><h2 className="mt-1 text-sm font-semibold text-slate-100">{title}</h2></div></div><div className="p-5 sm:p-6">{children}</div></section>; }
function Field({ label, error, wide, children }) { return <label className={wide ? "block md:col-span-2" : "block"}><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-slate-500">{label}</span><div className="[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-white/[0.08] [&_input]:bg-slate-950/35 [&_input]:p-3.5 [&_input]:text-sm [&_input]:outline-none [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-white/[0.08] [&_textarea]:bg-slate-950/35 [&_textarea]:p-4 [&_textarea]:text-sm [&_textarea]:leading-6 [&_textarea]:outline-none [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-white/[0.08] [&_select]:bg-slate-950/35 [&_select]:p-3.5 [&_select]:text-sm [&_select]:outline-none">{children}</div>{error && <p className="mt-2 text-[10px] text-rose-300">{error}</p>}</label>; }
