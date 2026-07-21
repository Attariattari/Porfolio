import ProjectEditor from "../ProjectEditor";

export default async function EditProjectPage({ params }) {
  const { id } = await params;
  return <ProjectEditor projectId={id} />;
}
