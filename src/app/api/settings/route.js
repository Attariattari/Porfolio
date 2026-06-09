import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { SiteConfig } from "@/models/Portfolio";
import { apiResponse } from "@/lib/apiResponse";
import mongoose from "mongoose";
import eventBus, { ADMIN_EVENTS } from "@/lib/eventBus";

// GET /api/settings - Fetch current site configuration
export async function GET(request) {
    try {
        await dbConnect();
        const dbName = mongoose.connection.db.databaseName;
        console.log(
            `[GET] Connected to DB: ${dbName}, State: ${mongoose.connection.readyState}`,
        );

        // Get the site config (should be only one document)
        let config = await SiteConfig.findOne();

        // If no config exists, create default one
        if (!config) {
            config = new SiteConfig({
                siteTitle: "Muhyo Tech",
                siteAccent: "Tech",
                adminName: "Pir Ghulam Muhyo Din",
                email: "attariattari549@gmail.com",
                location: "Lahore, Pakistan",
                seo: {
                    title: "Muhyo Tech - Full Stack Developer",
                    description: "Full Stack Web Developer specializing in modern web applications",
                },
            });
            await config.save();
        }

        return apiResponse.success(config, "Settings fetched successfully");
    } catch (error) {
        console.error("Settings fetch error:", error);
        return apiResponse.error("Failed to fetch settings", 500, error.message);
    }
}

// PATCH /api/settings - Update site configuration
export async function PATCH(request) {
    try {
        await dbConnect();
        const dbName = mongoose.connection.db.databaseName;
        console.log(
            `[PATCH] Connected to DB: ${dbName}, State: ${mongoose.connection.readyState}`,
        );

        const data = await request.json();

        if (!data) {
            return apiResponse.error("No data provided", 400);
        }

        console.log("Updating settings with data:", JSON.stringify(data, null, 2));

        // Construct update object dynamically to avoid overwriting fields with undefined
        const updateData = {
            updatedAt: new Date(),
        };

        if (data.siteTitle) updateData.siteTitle = data.siteTitle;
        if (data.siteAccent) updateData.siteAccent = data.siteAccent;
        if (data.adminName) updateData.adminName = data.adminName;
        if (data.email) updateData.email = data.email;
        if (data.location) updateData.location = data.location;
        if (data.seo) updateData.seo = data.seo;
        if (data.socialLinks) updateData.socialLinks = data.socialLinks;

        // Use findOneAndUpdate with upsert to ensure a document exists and is updated
        const savedConfig = await SiteConfig.findOneAndUpdate({}, // Empty filter to match the first (and only) document
            { $set: updateData }, {
                new: true, // Return the updated document
                upsert: true, // Create if doesn't exist
                runValidators: true,
                setDefaultsOnInsert: true,
            },
        );

        console.log("✅ Settings synchronized successfully");
        console.log("Collection:", savedConfig.constructor.modelName);
        console.log("Document ID:", savedConfig._id);

        // Emit socket event for real-time update
        try {
            eventBus.emit(ADMIN_EVENTS.SETTINGS_UPDATE, savedConfig.toObject());
            console.log("📡 Real-time settings event emitted via EventBus");
        } catch (ioError) {
            console.warn("Socket.io emit warning:", ioError.message);
            // Continue anyway - socket is optional
        }

        return apiResponse.success(
            savedConfig.toObject(),
            "Settings updated successfully",
        );
    } catch (error) {
        console.error("❌ Settings update error:", error);
        return apiResponse.error("Failed to update settings", 500, error.message);
    }
}