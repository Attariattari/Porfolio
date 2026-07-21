import ExperienceEditor from "../../ExperienceEditor";
export default async function EditExperiencePage({ params }) { const { index } = await params; return <ExperienceEditor experienceIndex={index} />; }
