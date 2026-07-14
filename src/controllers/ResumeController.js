import dbConnect from "@/lib/dbConnect";
import { Resume } from "@/models/Portfolio";
import { serializeDoc } from "@/lib/mongooseHelper";
import { cacheManager, withCache } from "@/lib/cache";
import { portfolioData } from "@/lib/data";

export const ResumeController = {
    // GET THE CURRENT RESUME DATA - with caching
    get: async () => {
        const cacheKey = "resume:data";
        return await withCache(
            cacheKey,
            async () => {
                await dbConnect();
                let resume = await Resume.findOne({});
                if (resume) {
                    const updates = {};
                    if (!resume.aboutSummary && portfolioData.resume?.about) {
                        updates.aboutSummary = portfolioData.resume.about;
                    }
                    if ((!resume.skillCategories || resume.skillCategories.length === 0) && portfolioData.resume?.skills?.length) {
                        updates.skillCategories = portfolioData.resume.skills;
                    }
                    if ((!resume.notableProjects || resume.notableProjects.length === 0) && portfolioData.resume?.projects?.length) {
                        updates.notableProjects = portfolioData.resume.projects;
                    }
                    if (Object.keys(updates).length > 0) {
                    resume = await Resume.findByIdAndUpdate(
                        resume._id,
                        { $set: updates },
                        { returnDocument: "after", runValidators: true },
                    );
                    }
                }
                return serializeDoc(resume);
            },
            1800, // 30 minute cache
            ["resume"]
        );
    },

    // UPSERT THE RESUME (Update or Create if missing)
    update: async(data) => {
        await dbConnect();
        // One document for the entire resume
        const updated = await Resume.findOneAndUpdate({}, data, {
            new: true,
            upsert: true,
            runValidators: true,
        });
        await cacheManager.invalidateByTag("resume");
        return serializeDoc(updated);
    },
};
