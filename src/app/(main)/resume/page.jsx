import React from "react";
import ResumeClient from "./ResumeClient";
import { portfolioData } from "@/lib/data";
import { ResumeController } from "@/controllers/ResumeController";
import { serializeDoc } from "@/lib/mongooseHelper";

export const metadata = {
  title: "Professional journey | Pir Ghulam Muhyo Din",
  description:
    "Explore the career evolution, skills, and projects of Pir Ghulam Muhyo Din, a full-stack developer and project strategist dedicated to building impactful digital solutions.",
};

export default async function ResumePage() {
  // Professional Hybrid Fetching - Merge MongoDB with Fallback
  let dbResume = null;
  let resumeData = { ...portfolioData.resume }; // Start with fallback
  let dataSource = "STATIC DATA"; // Track data source

  try {
    dbResume = await ResumeController.get();

    if (dbResume) {
      // Convert Mongoose document to plain object using proper serialization
      const plainDbResume = serializeDoc(dbResume);
      dataSource = "DATABASE"; // Update data source

      // Merge: Use MongoDB fields where they exist, fallback to data.js otherwise
      resumeData = {
        name: plainDbResume?.name || portfolioData.resume.name,
        role: plainDbResume?.role || portfolioData.resume.role,
        tagline: plainDbResume?.tagline || portfolioData.resume.tagline,
        aboutSummary: plainDbResume?.aboutSummary || portfolioData.resume.about,
        about: plainDbResume?.about || portfolioData.resume.about,
        contact:
          Array.isArray(plainDbResume?.contact) &&
          plainDbResume.contact.length > 0
            ? plainDbResume.contact
            : portfolioData.resume.contact,
        stats:
          Array.isArray(plainDbResume?.stats) && plainDbResume.stats.length > 0
            ? plainDbResume.stats
            : portfolioData.resume.stats,
        experience:
          Array.isArray(plainDbResume?.experience) &&
          plainDbResume.experience.length > 0
            ? plainDbResume.experience
            : portfolioData.resume.experience,
        education:
          Array.isArray(plainDbResume?.education) &&
          plainDbResume.education.length > 0
            ? plainDbResume.education
            : portfolioData.resume.education,
        // Use skillCategories from MongoDB OR skills from data.js
        skillCategories:
          Array.isArray(plainDbResume?.skillCategories) &&
          plainDbResume.skillCategories.length > 0
            ? plainDbResume.skillCategories
            : undefined,
        skills:
          Array.isArray(plainDbResume?.skills) &&
          plainDbResume.skills.length > 0
            ? plainDbResume.skills
            : portfolioData.resume.skills,
        // Use notableProjects from MongoDB OR projects from data.js
        notableProjects:
          Array.isArray(plainDbResume?.notableProjects) &&
          plainDbResume.notableProjects.length > 0
            ? plainDbResume.notableProjects
            : undefined,
        projects:
          Array.isArray(plainDbResume?.projects) &&
          plainDbResume.projects.length > 0
            ? plainDbResume.projects
            : portfolioData.resume.projects,
      };
    }
  } catch (error) {
    console.error("Resume fetch error:", error);
  }

  return <ResumeClient resumeData={resumeData} />;
}
