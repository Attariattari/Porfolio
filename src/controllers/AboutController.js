import dbConnect from "@/lib/dbConnect";
import { About } from "@/models/Portfolio";
import { serializeDoc } from "@/lib/mongooseHelper";
import { cacheManager, withCache } from "@/lib/cache";
import { getAboutPageData } from "@/lib/content/getAboutPageData";
import { getAboutMediaAlt } from "@/lib/mediaAlt";

// P2/P3 OPTIMIZATION: Implement aggressive caching
// About data changes rarely - cache for 1 hour
export const AboutController = {
    // 1. Get Profile - Optimized with lean() + caching
    async get() {
        const cacheKey = "about:data";
        try {
            return await withCache(
                cacheKey,
                async () => {
                    await dbConnect();
                    const profile = await About.findOne({}).lean();
                    return getAboutPageData(serializeDoc(profile));
                },
                3600, // 1 hour cache
                ["about"]
            );
        } catch {
            if (process.env.NODE_ENV !== "production") {
                console.warn("[about] DB unavailable, using fallback data");
            }
            return getAboutPageData(null);
        }
    },

    // 2. Update Profile
    async update(data) {
        await dbConnect();
        const existing = await About.findOne({}).lean();
        const merged = { ...(existing || {}), ...data };
        const avatarAlt = getAboutMediaAlt({
            ...merged,
            avatarAlt: data.avatarAlt || existing?.avatarAlt,
        });
        const updated = await About.findOneAndUpdate({}, {
            ...data,
            avatarAlt,
            hero: {
                ...(existing?.hero || {}),
                ...(data.hero || {}),
                imageAlt: data.hero?.imageAlt || existing?.hero?.imageAlt || avatarAlt,
            },
        }, {
            new: true,
            upsert: true,
            runValidators: true,
        }).lean();
        await cacheManager.invalidateByTag("about");
        return serializeDoc(updated);
    },
};
