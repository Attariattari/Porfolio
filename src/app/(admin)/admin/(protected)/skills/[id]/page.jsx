import SkillEditor from "../SkillEditor";

export default async function EditSkillPage({ params }) {
  const { id } = await params;
  return <SkillEditor skillId={id} />;
}
