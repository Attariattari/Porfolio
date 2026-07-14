import dbConnect from "@/lib/dbConnect";
import { Skill } from "@/models/Portfolio";
import { portfolioData } from "@/lib/data";
import { serializeDoc } from "@/lib/mongooseHelper";
import { cacheManager, withCache } from "@/lib/cache";

/**
 * SkillController
 * Optimized for production with lean queries and caching.
 */
export const SkillController = {
    // 1. Get All Skills - Optimized with caching
    async getAll() {
        const cacheKey = "skills:list";
        
        try {
            return await withCache(
                cacheKey,
                async () => {
                    await dbConnect();
                    const dbSkills = await Skill.find({}).sort({ order: 1 }).lean();

                    if (!dbSkills || dbSkills.length === 0) {
                        return portfolioData.skills;
                    }

                    return serializeDoc(dbSkills);
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
        await cacheManager.invalidateByTag("skills");
        return serializeDoc(newSkill);
    },

    // 3. Update Skill
    async update(id, data) {
        await dbConnect();
        const updated = await Skill.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).lean();
        await cacheManager.invalidateByTag("skills");
        return serializeDoc(updated);
    },

    // 4. Delete One
    async deleteOne(id) {
        await dbConnect();
        const deleted = await Skill.findByIdAndDelete(id).lean();
        await cacheManager.invalidateByTag("skills");
        return deleted;
    },

    // 5. Delete All
    async deleteAll() {
        await dbConnect();
        const result = await Skill.deleteMany({});
        await cacheManager.invalidateByTag("skills");
        return result;
    },
};
