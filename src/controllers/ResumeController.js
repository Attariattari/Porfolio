import dbConnect from "@/lib/dbConnect";
import { Resume } from "@/models/Portfolio";
import { serializeDoc } from "@/lib/mongooseHelper";

export const ResumeController = {
    // GET THE CURRENT RESUME DATA
    get: async() => {
        await dbConnect();
        return serializeDoc(await Resume.findOne({}));
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
        return serializeDoc(updated);
    },
};