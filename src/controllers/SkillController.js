import dbConnect from "@/lib/dbConnect";
import { Skill } from "@/models/Portfolio";
import { portfolioData } from "@/lib/data";
import { serializeDoc } from "@/lib/mongooseHelper";
import { withCache } from "@/lib/cache";

/**
 * SkillController
 * Optimized for production with lean queries and caching.
 */
export const SkillController = {
    // 1. Get All Skills - Optimized with caching
    async getAll() {
        const cacheKey = "skills_all";
        
        try {
            return await withCache(
                cacheKey,
                async () => {
                    await dbConnect();
                    const dbSkills = await Skill.find({}).sort({ order: 1 }).lean();

                    if (!dbSkills || dbSkills.length === 0) {
                        return portfolioData.skills;
                    }

                    const uploadedNames = new Set(dbSkills.map((s) => s.name));
                    const fallbackSkills = portfolioData.skills
                        .filter((s) => !uploadedNames.has(s.name))
                        .map((s) => ({
                            ...s,
                            _isFromDataJs: true,
                            _dbId: null,
                        }));

                    return [...serializeDoc(dbSkills), ...fallbackSkills];
                },
                1800, // 30 minute cache
                ["skills"]
            );
        } catch (error) {
            console.error("[SkillController.getAll] Error:", error);
            return portfolioData.skills;
        }
    },

    // 2. Add New Skill
    async create(data) {
        await dbConnect();
        const newSkill = await Skill.create(data);
        return serializeDoc(newSkill);
    },

    // 3. Update Skill
    async update(id, data) {
        await dbConnect();
        const updated = await Skill.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).lean();
        return serializeDoc(updated);
    },

    // 4. Delete One
    async deleteOne(id) {
        await dbConnect();
        return await Skill.findByIdAndDelete(id).lean();
    },

    // 5. Delete All
    async deleteAll() {
        await dbConnect();
        return await Skill.deleteMany({});
    },
};