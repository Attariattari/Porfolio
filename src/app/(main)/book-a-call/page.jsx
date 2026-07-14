import BookCallClient from "../book-call/BookCallClient";
import { buildCanonical } from "@/lib/seo";

export const metadata = {
  title: "Book a Call",
  description:
    "Book a project discussion with Muhyo Tech for websites, web applications, admin dashboards, redesigns, API integrations, and full-stack development.",
  alternates: { canonical: buildCanonical("/book-a-call") },
};

export default async function BookACallPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  return <BookCallClient initialServiceSlug={resolvedSearchParams?.service || ""} />;
}
