import BookCallClient from "./BookCallClient";
import { buildCanonical } from "@/lib/seo";

export const metadata = {
  title: "Book a Call",
  description:
    "Book a strategy call with Muhyo Tech to discuss your website, web app, dashboard, SEO, or software project.",
  alternates: { canonical: buildCanonical("/book-a-call") },
};

export default async function BookCallPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  return <BookCallClient initialServiceSlug={resolvedSearchParams?.service || ""} />;
}
