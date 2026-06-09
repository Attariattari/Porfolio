import dbConnect from "@/lib/dbConnect";
import { About } from "@/models/Portfolio";
import { serializeDoc } from "@/lib/mongooseHelper";
import { withCache } from "@/lib/cache";

// P2/P3 OPTIMIZATION: Implement aggressive caching
// About data changes rarely - cache for 1 hour
export const AboutController = {
    // 1. Get Profile - Optimized with lean() + caching
    async get() {
        const cacheKey = "about_profile";
        return await withCache(
            cacheKey,
            async () => {
                await dbConnect();
                const profile = await About.findOne({}).lean();
                return serializeDoc(profile);
            },
            3600, // 1 hour cache
            ["about"]
        );
    },

    // 2. Update Profile
    async update(data) {
        await dbConnect();
        const updated = await About.findOneAndUpdate({}, data, {
            new: true,
            upsert: true,
            runValidators: true,
        }).lean();
        return serializeDoc(updated);
    },
};