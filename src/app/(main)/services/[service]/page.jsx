import { notFound } from "next/navigation";
import { ServiceController } from "@/controllers/ServiceController";
import ServiceDetailClient from "./ServiceDetailClient";

export default async function ServiceDetailPage({ params }) {
  const resolvedParams = await params;
  const serviceSlug = resolvedParams.service;
  const service = await ServiceController.getOne(serviceSlug);

  if (!service) {
    notFound();
  }

  return <ServiceDetailClient service={service} />;
}
