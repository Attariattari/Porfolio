// ===== SOCIAL LINKS CONTROLLER =====
// Handles all social links management separately from About
// Database: SocialLinks collection

import { SocialLinks } from "@/models/Portfolio";
import dbConnect from "@/lib/dbConnect";
import { SOCIAL_LINKS } from "@/lib/data";

const ALLOWED_PLATFORMS = [
    "whatsapp",
    "linkedin",
    "twitter",
    "facebook",
    "github",
    "instagram",
];

export const SocialController = {
    // ===== GET SOCIAL LINKS =====
    async get() {
        try {
            await dbConnect();

            // Get social links from DB
            const doc = await SocialLinks.findOne({}).lean();

            // IF DB has data -> use DB
            if (doc && doc.links && Array.isArray(doc.links) && doc.links.length > 0) {
                return doc.links;
            }

            // IF DB is empty -> fallback to data.js
            // Transform data.js structure to the simplified schema
            const fallbackData = ALLOWED_PLATFORMS.map(platform => {
                let key = platform;
                if (platform === 'twitter' && !SOCIAL_LINKS.twitter) key = 'x';
                
                const social = SOCIAL_LINKS[key] || SOCIAL_LINKS[platform];
                
                return {
                    platform: platform,
                    url: social ? (typeof social.url === 'function' ? social.url() : social.url) : ""
                };
            }).filter(item => item.url !== "");

            if (fallbackData.length === 0) return [];

            const initialized = await SocialLinks.findOneAndUpdate(
                {},
                { $set: { links: fallbackData, updatedAt: new Date() } },
                { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
            ).lean();
            return initialized.links || [];
        } catch (error) {
            console.error("SocialController.get() error:", error);
            return [];
        }
    },

    // ===== UPDATE SOCIAL LINKS =====
    async update(data) {
        try {
            await dbConnect();

            // Validate data structure (expecting array of {platform, url})
            const linksArray = Array.isArray(data) ? data : (data.links || []);
            
            // Filter only allowed platforms and limit to 5
            const validLinks = linksArray
                .filter(link => link && link.platform && link.url)
                .filter(link => ALLOWED_PLATFORMS.includes(link.platform.toLowerCase()))
                .map(link => ({
                    platform: link.platform.toLowerCase(),
                    url: link.url.trim(),
                }))
                .filter(link => link.url !== "")
                .slice(0, 6);

            const doc = await SocialLinks.findOneAndUpdate(
                {},
                { $set: { links: validLinks, updatedAt: new Date() } },
                { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true },
            );

            return doc.links;
        } catch (error) {
            console.error("SocialController.update() error:", error);
            throw error;
        }
    },

    // ===== GET VISIBLE SOCIAL LINKS (Shortcut for frontend) =====
    async getVisible() {
        return this.get();
    },
};

export default SocialController;
