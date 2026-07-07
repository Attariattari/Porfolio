import BookCallClient from "../book-call/BookCallClient";
import { buildCanonical } from "@/lib/seo";

export const metadata = {
  title: "Book a Call | Muhyo Tech",
  description:
    "Book a project discussion with Muhyo Tech to discuss websites, web applications, admin dashboards, redesigns, API integrations, and custom full-stack development requirements.",
  alternates: { canonical: buildCanonical("/book-a-call") },
};

export default async function BookACallPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  return <BookCallClient initialServiceSlug={resolvedSearchParams?.service || ""} />;
}
