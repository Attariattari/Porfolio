import dbConnect from "@/lib/dbConnect";
import { Hero } from "@/models/Portfolio";
import { serializeDoc } from "@/lib/mongooseHelper";

export const HeroController = {
    // 1. Get Hero Data - Optimized with lean()
    async get() {
        try {
            await dbConnect();
            const hero = await Hero.findOne({}).lean();
            return serializeDoc(hero);
        } catch (error) {
            return null;
        }
    },

    // 2. Update Hero Data
    async update(data) {
        try {
            await dbConnect();
            data.updatedAt = new Date();
            
            const hero = await Hero.findOneAndUpdate({}, data, {
                new: true,
                upsert: true,
                runValidators: true
            }).lean();
            
            return serializeDoc(hero);
        } catch (error) {
            throw new Error(error.message || "Failed to update hero section");
        }
    }
};

