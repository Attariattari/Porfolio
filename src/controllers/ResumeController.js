import dbConnect from "@/lib/dbConnect";
import { Resume } from "@/models/Portfolio";
import { serializeDoc } from "@/lib/mongooseHelper";
import { cacheManager, withCache } from "@/lib/cache";

export const ResumeController = {
    // GET THE CURRENT RESUME DATA - with caching
    get: async () => {
        const cacheKey = "resume:data";
        return await withCache(
            cacheKey,
            async () => {
                await dbConnect();
                return serializeDoc(await Resume.findOne({}));
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
