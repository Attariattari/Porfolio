import dbConnect from "@/lib/dbConnect";
import { About } from "@/models/Portfolio";
import { serializeDoc } from "@/lib/mongooseHelper";

export const AboutController = {
    // 1. Get Profile - Optimized with lean()
    async get() {
        await dbConnect();
        const profile = await About.findOne({}).lean();
        return serializeDoc(profile);
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