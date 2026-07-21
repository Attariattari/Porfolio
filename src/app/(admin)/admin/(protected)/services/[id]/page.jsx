import ServiceEditor from "../ServiceEditor";

export default async function EditServicePage({ params }) {
  const { id } = await params;
  return <ServiceEditor serviceId={id} />;
}
