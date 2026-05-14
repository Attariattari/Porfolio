import Skills from "@/components/Skills";
import { portfolioData } from "@/lib/data";
import { SkillController } from "@/controllers/SkillController";
import { serializeDoc } from "@/lib/mongooseHelper";

export default async function SkillsPage() {
  // Get merged skills: MongoDB + unused data.js items - IMPORTANT: Serialize Mongoose documents
  const dbSkills = await SkillController.getAll().catch(() => []);
  const skills = (dbSkills?.length > 0 ? serializeDoc(dbSkills) : null) || portfolioData.skills;

  return (
    <div className="pt-20">
      <Skills data={skills} />
    </div>
  );
}
