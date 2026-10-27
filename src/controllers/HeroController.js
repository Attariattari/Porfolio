import dbConnect from "@/lib/dbConnect";
import { Hero } from "@/models/Portfolio";
import { serializeDoc } from "@/lib/mongooseHelper";
import { cacheManager, withCache } from "@/lib/cache";
import { getHeroMediaAlt } from "@/lib/mediaAlt";

export const HeroController = {
    // 1. Get Hero Data - Optimized with lean() + caching
    async get() {
        const cacheKey = "home:hero";
        try {
            return await withCache(
                cacheKey,
                async () => {
                    await dbConnect();
                    const hero = await Hero.findOne({}).lean();
                    return serializeDoc(hero);
                },
                1800, // 30 minute cache
                ["hero"]
            );
        } catch (error) {
            console.error("[HeroController] Error:", error);
            return null;
        }
    },

    // 2. Update Hero Data
    async update(data) {
        try {
            await dbConnect();
            const existing = await Hero.findOne({}).lean();
            data.visualImageAlt = getHeroMediaAlt({
                ...(existing || {}),
                ...data,
                visualImageAlt: data.visualImageAlt || existing?.visualImageAlt,
            });
            data.updatedAt = new Date();

            const hero = await Hero.findOneAndUpdate({}, data, {
                new: true,
                upsert: true,
                runValidators: true,
            }).lean();

            // Auto-Cleanup: If image changed or deleted, delete old Cloudinary image to free credits and update/delete in local vault
            if (existing?.visualImage && existing.visualImage !== data.visualImage) {
                setImmediate(async () => {
                    try {
                        const { cleanupOrphanCloudinaryAsset } = await import("@/lib/server/cloudinary/poolManager");
                        await cleanupOrphanCloudinaryAsset(existing.visualImage);

                        if (data.visualImage) {
                            const { updateVaultAsset } = await import("@/lib/server/cloudinary/assetVault");
                            await updateVaultAsset({
                                collection: "heros",
                                documentId: hero._id.toString(),
                                field: "visualImage",
                                newUrl: data.visualImage,
                                oldUrl: existing.visualImage,
                                title: data.title || "Home Hero Visual",
                                slug: "home-hero",
                            });
                        } else {
                            const { deleteVaultAsset } = await import("@/lib/server/cloudinary/assetVault");
                            await deleteVaultAsset({
                                url: existing.visualImage,
                                collection: "heros",
                                documentId: hero._id.toString(),
                                field: "visualImage",
                            });
                        }
                    } catch (e) {
                        console.warn("[HeroController] Media auto-cleanup notice:", e.message);
                    }
                });
            }

            await cacheManager.invalidateByTag("hero");
            return serializeDoc(hero);
        } catch (error) {
            throw new Error(error.message || "Failed to update hero section");
        }
    },
};
