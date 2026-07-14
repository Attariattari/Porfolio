import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import {
    Goal,
    RoadmapItem,
    Milestone,
    GoalsVision,
    Project,
    Service,
    Blog,
    GoalActivityLog,
    GoalsConfig,
} from "@/models/Portfolio";
import { Subscriber } from "@/models/Subscriber";
import { portfolioData } from "@/lib/data";
import { serializeDoc } from "@/lib/mongooseHelper";
import { emitSocketEvent, SOCKET_EVENTS } from "@/lib/socket";
import { cacheManager, withCache } from "@/lib/cache";
import { revalidatePath } from "next/cache";

const goalsPageData = portfolioData.goalsData || {};
const fallbackGoalsData = Array.isArray(goalsPageData) ?
    goalsPageData :
    goalsPageData.goals || [];
const fallbackRoadmapData = Array.isArray(portfolioData.roadmapData) && portfolioData.roadmapData.length > 0 ?
    portfolioData.roadmapData :
    goalsPageData.roadmap || [];
const fallbackMilestonesData = portfolioData.milestonesData || [];

const invalidateGoalsCache = async () => {
    await Promise.all([
        cacheManager.invalidateByTag("goals"),
        cacheManager.invalidateByTag("roadmap"),
        cacheManager.invalidateByTag("milestones"),
        cacheManager.invalidateByTag("goals_vision"),
    ]).catch(() => {});
    revalidatePath("/goals");
};

/**
 * GoalController
 * Optimized for production with DB + fallback logic, caching, and real-time updates
 */
export const GoalController = {
    // ===== INTERNAL HELPERS =====

    getGoalsPageData() {
        return Array.isArray(portfolioData.goalsData) ? {} : portfolioData.goalsData || {};
    },

    // Helper to log activities
    async _logActivity(action, entityType, entityId, title, description = "") {
        try {
            await GoalActivityLog.create({
                action,
                entityType,
                entityId: entityId?.toString(),
                title,
                description,
                createdAt: new Date(),
            });

            // Emit real-time event for changelog
            emitSocketEvent("CHANGELOG_UPDATED", {
                action,
                entityType,
                title,
                createdAt: new Date(),
            });
        } catch (error) {
            console.error("[GoalController._logActivity] Error:", error);
        }
    },

    // ===== GOALS MANAGEMENT =====

    // Get all goals - merged DB + fallback
    async getAllGoals(filterPublished = false) {
        const cacheKey = filterPublished ? "goals:list:published" : "admin:goals:list";

        try {
            return await withCache(
                cacheKey,
                async() => {
                    await dbConnect();
                    const query = filterPublished ? { publishStatus: "published" } : {};

                    const dbGoals = await Goal.find(query)
                        .sort({ order: 1, featured: -1, createdAt: -1 })
                        .lean();

                    if (dbGoals.length > 0) return serializeDoc(dbGoals);

                    const uploadedTitles = new Set(dbGoals.map((g) => g.title));
                    const fallbackGoals = fallbackGoalsData
                        .filter((g) => !uploadedTitles.has(g.title))
                        .map((g) => ({
                            ...g,
                            _id: `fallback_${g.id}`,
                            _isFromDataJs: true,
                            publishStatus: "published",
                        }));

                    return [...serializeDoc(dbGoals), ...fallbackGoals];
                },
                300, // 5 minute cache
                ["goals"],
            );
        } catch (error) {
            console.error("[GoalController.getAllGoals] Error:", error);
            return fallbackGoalsData.map((g) => ({
                ...g,
                _id: `fallback_${g.id}`,
                _isFromDataJs: true,
            }));
        }
    },

    // Get single goal
    async getGoal(identifier) {
        try {
            await dbConnect();
            const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
            const query = {
                $or: [
                    ...(isObjectId ? [{ _id: identifier }] : []),
                    { title: identifier },
                ],
            };

            const goal = await Goal.findOne(query).lean();
            if (goal) return serializeDoc(goal);

            // Fallback
            const fallbackGoal = fallbackGoalsData.find(
                (g) => g.id?.toString() === identifier || g.title === identifier,
            );
            if (fallbackGoal) {
                return {
                    ...fallbackGoal,
                    _id: `fallback_${fallbackGoal.id}`,
                    _isFromDataJs: true,
                    publishStatus: "published",
                };
            }
            return null;
        } catch (error) {
            console.error("[GoalController.getGoal] Error:", error);
            return null;
        }
    },

    // Create goal
    async createGoal(data) {
        try {
            await dbConnect();

            // Uniqueness Check
            const existing = await Goal.findOne({ title: data.title });
            if (existing) return serializeDoc(existing);

            const goal = new Goal(data);
            await goal.save();

            // Log activity
            await this._logActivity(
                "create",
                "goal",
                goal._id,
                goal.title,
                "New goal established.",
            );

            // Emit real-time event
            emitSocketEvent("GOALS_UPDATED", {
                action: "create",
                data: serializeDoc(goal),
            });

            await invalidateGoalsCache();
            return serializeDoc(goal);
        } catch (error) {
            console.error("[GoalController.createGoal] Error:", error);
            throw error;
        }
    },

    // Update goal
    async updateGoal(id, data) {
        try {
            await dbConnect();

            // Check if it's a valid ObjectId to prevent crash
            const isValidId = mongoose.Types.ObjectId.isValid(id);
            let goal;

            if (isValidId) {
                goal = await Goal.findByIdAndUpdate(id, data, { new: true }).lean();
            }

            // If not found or not valid ID, create it (Upsert logic for migration)
            if (!goal) {
                return this.createGoal(data);
            }

            const oldGoal = await Goal.findById(id).lean();

            if (goal) {
                // Log significant changes
                if (data.status && data.status !== oldGoal.status) {
                    await this._logActivity(
                        data.status === "completed" ? "complete" : "update",
                        "goal",
                        goal._id,
                        goal.title,
                        `Status updated to ${data.status}.`,
                    );
                } else if (data.featured && !oldGoal.featured) {
                    await this._logActivity(
                        "featured",
                        "goal",
                        goal._id,
                        goal.title,
                        "Goal promoted to primary objective.",
                    );
                }

                emitSocketEvent("GOALS_UPDATED", {
                    action: "update",
                    data: serializeDoc(goal),
                });
            }

            await invalidateGoalsCache();
            return serializeDoc(goal);
        } catch (error) {
            console.error("[GoalController.updateGoal] Error:", error);
            throw error;
        }
    },

    // Delete goal
    async deleteGoal(id) {
        try {
            await dbConnect();
            const goal = await Goal.findById(id).lean();
            const result = await Goal.findByIdAndDelete(id);

            if (result) {
                await this._logActivity(
                    "delete",
                    "goal",
                    id,
                    goal ? goal.title : "Deleted Goal",
                    "Goal removed from system.",
                );

                emitSocketEvent("GOALS_UPDATED", {
                    action: "delete",
                    data: { _id: id },
                });
            }

            await invalidateGoalsCache();
            return result;
        } catch (error) {
            console.error("[GoalController.deleteGoal] Error:", error);
            throw error;
        }
    },

    // Reorder goals
    async reorderGoals(goalsData) {
        try {
            await dbConnect();
            const updates = [];

            for (const item of goalsData) {
                if (!item._isFromDataJs) {
                    updates.push(
                        Goal.findByIdAndUpdate(
                            item._id, { order: item.order }, { new: true },
                        ),
                    );
                }
            }

            const results = await Promise.all(updates);

            emitSocketEvent("GOALS_UPDATED", {
                action: "reorder",
                data: results.map(serializeDoc),
            });

            await invalidateGoalsCache();
            return results;
        } catch (error) {
            console.error("[GoalController.reorderGoals] Error:", error);
            throw error;
        }
    },

    // ===== ROADMAP MANAGEMENT =====

    // Get all roadmap items
    async getAllRoadmap(filterPublished = false) {
        const cacheKey = filterPublished ? "goals:roadmap:published" : "admin:goals:roadmap";

        try {
            return await withCache(
                cacheKey,
                async() => {
                    await dbConnect();
                    const query = filterPublished ? { publishStatus: "published" } : {};

                    const dbRoadmap = await RoadmapItem.find(query)
                        .sort({ order: 1, createdAt: -1 })
                        .lean();

                    if (dbRoadmap.length > 0) return serializeDoc(dbRoadmap);

                    const dbTitles = new Set(dbRoadmap.map((r) => r.title));
                    const fallbackRoadmap = fallbackRoadmapData
                        .filter((r) => !dbTitles.has(r.title))
                        .map((r) => ({
                            ...r,
                            _id: `fallback_${r.id}`,
                            _isFromDataJs: true,
                            publishStatus: "published",
                        }));

                    const merged = [...dbRoadmap.map(serializeDoc), ...fallbackRoadmap];

                    // Strict Title Deduplication (Case-Insensitive)
                    const uniqueMap = new Map();
                    merged.forEach(item => {
                        const titleKey = item.title.trim().toLowerCase();
                        if (!uniqueMap.has(titleKey)) {
                            uniqueMap.set(titleKey, item);
                        }
                    });

                    return Array.from(uniqueMap.values());
                },
                300, ["roadmap"],
            );
        } catch (error) {
            console.error("[GoalController.getAllRoadmap] Error:", error);
            return fallbackRoadmapData.map((r) => ({
                ...r,
                _id: `fallback_${r.id}`,
                _isFromDataJs: true,
            }));
        }
    },

    // Create roadmap item
    async createRoadmapItem(data) {
        try {
            await dbConnect();

            // Uniqueness Check
            const existing = await RoadmapItem.findOne({ title: data.title });
            if (existing) return serializeDoc(existing);

            const item = new RoadmapItem(data);
            await item.save();

            await this._logActivity(
                "create",
                "roadmap",
                item._id,
                item.title,
                "Roadmap item added to trajectory.",
            );

            emitSocketEvent("ROADMAP_UPDATED", {
                action: "create",
                data: serializeDoc(item),
            });

            await invalidateGoalsCache();
            return serializeDoc(item);
        } catch (error) {
            console.error("[GoalController.createRoadmapItem] Error:", error);
            throw error;
        }
    },

    // Update roadmap item
    async updateRoadmapItem(id, data) {
        try {
            await dbConnect();
            const item = await RoadmapItem.findByIdAndUpdate(id, data, {
                new: true,
            }).lean();

            if (item) {
                await this._logActivity(
                    "update",
                    "roadmap",
                    id,
                    item.title,
                    "Roadmap trajectory adjusted.",
                );

                emitSocketEvent("ROADMAP_UPDATED", {
                    action: "update",
                    data: serializeDoc(item),
                });
            }

            await invalidateGoalsCache();
            return serializeDoc(item);
        } catch (error) {
            console.error("[GoalController.updateRoadmapItem] Error:", error);
            throw error;
        }
    },

    // Delete roadmap item
    async deleteRoadmapItem(id) {
        try {
            await dbConnect();
            const item = await RoadmapItem.findById(id).lean();
            const result = await RoadmapItem.findByIdAndDelete(id);

            if (result) {
                await this._logActivity(
                    "delete",
                    "roadmap",
                    id,
                    item?.title || "Deleted Roadmap Item",
                    "Roadmap item removed.",
                );

                emitSocketEvent("ROADMAP_UPDATED", {
                    action: "delete",
                    data: { _id: id },
                });
            }

            await invalidateGoalsCache();
            return result;
        } catch (error) {
            console.error("[GoalController.deleteRoadmapItem] Error:", error);
            throw error;
        }
    },

    // ===== MILESTONE MANAGEMENT =====

    // Get all milestones
    async getAllMilestones(filterPublished = false) {
        const cacheKey = filterPublished ? "goals:milestones:published" : "admin:goals:milestones";

        try {
            return await withCache(
                cacheKey,
                async() => {
                    await dbConnect();
                    const query = filterPublished ? { publishStatus: "published" } : {};

                    const dbMilestones = await Milestone.find(query)
                        .sort({ order: 1, date: -1 })
                        .lean();

                    if (dbMilestones.length > 0) return serializeDoc(dbMilestones);

                    const dbTitles = new Set(dbMilestones.map((m) => m.title));
                    const fallbackMilestones = fallbackMilestonesData
                        .filter((m) => !dbTitles.has(m.title))
                        .map((m) => ({
                            ...m,
                            _id: `fallback_${m.id}`,
                            _isFromDataJs: true,
                            publishStatus: "published",
                        }));

                    const merged = [...dbMilestones.map(serializeDoc), ...fallbackMilestones];

                    // Strict Title Deduplication (Case-Insensitive)
                    const uniqueMap = new Map();
                    merged.forEach(item => {
                        const titleKey = item.title.trim().toLowerCase();
                        if (!uniqueMap.has(titleKey)) {
                            uniqueMap.set(titleKey, item);
                        }
                    });

                    return Array.from(uniqueMap.values());
                },
                300, ["milestones"],
            );
        } catch (error) {
            console.error("[GoalController.getAllMilestones] Error:", error);
            return fallbackMilestonesData.map((m) => ({
                ...m,
                _id: `fallback_${m.id}`,
                _isFromDataJs: true,
            }));
        }
    },

    // Create milestone
    async createMilestone(data) {
        try {
            await dbConnect();

            // Uniqueness Check
            const existing = await Milestone.findOne({ title: data.title });
            if (existing) return serializeDoc(existing);

            const milestone = new Milestone(data);
            await milestone.save();

            await this._logActivity(
                "create",
                "milestone",
                milestone._id,
                milestone.title,
                "Significant milestone achieved and logged.",
            );

            emitSocketEvent("MILESTONES_UPDATED", {
                action: "create",
                data: serializeDoc(milestone),
            });

            await invalidateGoalsCache();
            return serializeDoc(milestone);
        } catch (error) {
            console.error("[GoalController.createMilestone] Error:", error);
            throw error;
        }
    },

    // Update milestone
    async updateMilestone(id, data) {
        try {
            await dbConnect();
            const milestone = await Milestone.findByIdAndUpdate(id, data, {
                new: true,
            }).lean();

            if (milestone) {
                await this._logActivity(
                    "update",
                    "milestone",
                    id,
                    milestone.title,
                    "Milestone data refined.",
                );

                emitSocketEvent("MILESTONES_UPDATED", {
                    action: "update",
                    data: serializeDoc(milestone),
                });
            }

            await invalidateGoalsCache();
            return serializeDoc(milestone);
        } catch (error) {
            console.error("[GoalController.updateMilestone] Error:", error);
            throw error;
        }
    },

    // Delete milestone
    async deleteMilestone(id) {
        try {
            await dbConnect();
            const milestone = await Milestone.findById(id).lean();
            const result = await Milestone.findByIdAndDelete(id);

            if (result) {
                await this._logActivity(
                    "delete",
                    "milestone",
                    id,
                    milestone?.title || "Deleted Milestone",
                    "Milestone record archived.",
                );

                emitSocketEvent("MILESTONES_UPDATED", {
                    action: "delete",
                    data: { _id: id },
                });
            }

            await invalidateGoalsCache();
            return result;
        } catch (error) {
            console.error("[GoalController.deleteMilestone] Error:", error);
            throw error;
        }
    },

    // ===== VISION MANAGEMENT =====

    // Get vision data
    async getVision() {
        const cacheKey = "goals:data";

        try {
            return await withCache(
                cacheKey,
                async() => {
                    await dbConnect();
                    const vision = await GoalsVision.findOne({}).lean();

                    if (vision) return serializeDoc(vision);

                    // Return fallback
                    return {
                        missionStatement: portfolioData.goalsVision?.missionStatement || "",
                        visionStatement: portfolioData.goalsVision?.visionStatement || "",
                        founderMessage: portfolioData.goalsVision?.founderMessage || "",
                        _isFromDataJs: true,
                    };
                },
                600, // 10 minute cache
                ["goals_vision"],
            );
        } catch (error) {
            console.error("[GoalController.getVision] Error:", error);
            return {
                missionStatement: portfolioData.goalsVision?.missionStatement || "",
                visionStatement: portfolioData.goalsVision?.visionStatement || "",
                founderMessage: portfolioData.goalsVision?.founderMessage || "",
                _isFromDataJs: true,
            };
        }
    },

    // Update vision
    async updateVision(data) {
        try {
            await dbConnect();
            const vision = await GoalsVision.findOneAndUpdate({}, data, {
                new: true,
                upsert: true,
            }).lean();

            await this._logActivity(
                "update",
                "vision",
                vision._id,
                "Vision Updated",
                "Strategic vision/mission statements refined.",
            );

            emitSocketEvent("VISION_UPDATED", { data: serializeDoc(vision) });

            await invalidateGoalsCache();
            return serializeDoc(vision);
        } catch (error) {
            console.error("[GoalController.updateVision] Error:", error);
            throw error;
        }
    },

    // ===== HEALTH & INSIGHTS =====

    // Get Company Health
    async getCompanyHealth() {
        try {
            await dbConnect();

            // Get Config
            let config = await GoalsConfig.findOne({}).lean();
            if (!config) {
                config = await GoalsConfig.create({ healthMode: "auto" });
            }

            const [
                goals,
                roadmap,
                milestones,
                blogs,
                projects,
                services,
                subscribers,
            ] = await Promise.all([
                Goal.find({ publishStatus: "published" }).lean(),
                RoadmapItem.countDocuments({ publishStatus: "published" }),
                Milestone.countDocuments({ publishStatus: "published" }),
                Blog.find({ publishStatus: "published" }).lean(),
                Project.countDocuments({ publishStatus: "published" }),
                Service.countDocuments({ publishStatus: "published" }),
                Subscriber.countDocuments({ isActive: true }),
            ]);

            const activeGoals = goals.filter(
                (g) => g.status === "in-progress",
            ).length;
            const completedGoals = goals.filter(
                (g) => g.status === "completed",
            ).length;
            const featuredBlogs = blogs.filter((b) => b.featured).length;

            // Health Calculation (Auto)
            let healthScore = 0;
            if (config.healthMode === "manual") {
                healthScore = config.manualHealthScore;
            } else {
                // Auto calculation logic
                const goalCompletionRate =
                    goals.length > 0 ? (completedGoals / goals.length) * 100 : 100;
                const blogConsistency =
                    blogs.length > 5 ? 100 : (blogs.length / 5) * 100;
                healthScore = Math.round(
                    goalCompletionRate * 0.7 + blogConsistency * 0.3,
                );
            }

            return {
                activeGoals,
                completedGoals,
                roadmapItems: roadmap,
                milestones: milestones,
                publishedBlogs: blogs.length,
                featuredBlogs,
                services,
                projects,
                subscribers,
                systemHealth: healthScore,
                healthMode: config.healthMode,
                lastUpdated: new Date(),
            };
        } catch (error) {
            console.error("[GoalController.getCompanyHealth] Error:", error);
            return { systemHealth: 90, lastUpdated: new Date() };
        }
    },

    // Generate AI Strategic Insights
    async generateStrategicInsights(forceRegenerate = false) {
        try {
            await dbConnect();
            const visionDoc = await GoalsVision.findOne({});

            // Check cache
            if (!forceRegenerate &&
                visionDoc?.aiInsights &&
                visionDoc?.lastAiRefresh
            ) {
                const ageInHours =
                    (new Date() - visionDoc.lastAiRefresh) / (1000 * 60 * 60);
                if (ageInHours < 24) {
                    return visionDoc.aiInsights;
                }
            }

            // Fetch Data for analysis
            const goals = await Goal.find({ publishStatus: "published" }).lean();
            const roadmap = await RoadmapItem.find({
                publishStatus: "published",
            }).lean();

            if (goals.length === 0) return {};

            // Analyis Logic
            const highestProgress = [...goals].sort(
                (a, b) => b.progress - a.progress,
            )[0];
            const mostCritical = goals
                .filter((g) => g.priority === "critical")
                .sort((a, b) => a.progress - b.progress)[0];

            const categories = {};
            goals.forEach((g) => {
                categories[g.category] =
                    (categories[g.category] || 0) + (g.progress || 0);
            });
            const fastestGrowing = Object.keys(categories).sort(
                (a, b) => categories[b] - categories[a],
            )[0];

            const completedRoadmap = roadmap.filter(
                (r) => r.status === "completed",
            ).length;
            const roadmapCompletion =
                roadmap.length > 0 ? (completedRoadmap / roadmap.length) * 100 : 0;

            const insights = {
                highestProgressGoal: {
                    title: highestProgress.title,
                    progress: highestProgress.progress,
                },
                mostCriticalGoal: mostCritical ? {
                    title: mostCritical.title,
                    priority: "Critical",
                } : null,
                fastestGrowingArea: fastestGrowing,
                upcomingPriority: roadmap.find(
                    (r) => r.status === "in-progress" || r.status === "upcoming",
                )?.title || "Next Strategic Expansion",
                executionHealthScore: Math.round(
                    goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length,
                ),
                projectedCompletionDate: "Q4 2025", // Mock logic for simplicity
            };

            // Save to DB
            await GoalsVision.findOneAndUpdate({}, {
                aiInsights: insights,
                lastAiRefresh: new Date(),
            }, { upsert: true }, );

            return insights;
        } catch (error) {
            console.error("[GoalController.generateStrategicInsights] Error:", error);
            return {};
        }
    },

    // Get Public Changelog
    async getPublicChangelog(limit = 15) {
        try {
            await dbConnect();
            const logs = await GoalActivityLog.find({})
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
            return serializeDoc(logs);
        } catch (error) {
            console.error("[GoalController.getPublicChangelog] Error:", error);
            return [];
        }
    },

    async getRecentProgress(publicOnly = true) {
        try {
            await dbConnect();
            const query = {
                entityType: "progress",
                ...(publicOnly ? { publishStatus: "published" } : {}),
            };

            const updates = await GoalActivityLog.find(query)
                .sort({ isPinned: -1, order: 1, createdAt: -1 })
                .lean();

            if (updates.length > 0) {
                return serializeDoc(updates);
            }

            return (goalsPageData.recentProgress || []).map((title, index) => ({
                _id: `fallback_progress_${index + 1}`,
                _isFromDataJs: true,
                action: "progress",
                entityType: "progress",
                title,
                description: "",
                category: "Roadmap",
                publishStatus: "published",
                order: index,
                createdAt: new Date(0),
            }));
        } catch (error) {
            console.error("[GoalController.getRecentProgress] Error:", error);
            return (goalsPageData.recentProgress || []).map((title, index) => ({
                _id: `fallback_progress_${index + 1}`,
                _isFromDataJs: true,
                title,
                description: "",
                category: "Roadmap",
                publishStatus: "published",
                order: index,
                createdAt: new Date(0),
            }));
        }
    },

    async createRecentProgress(data) {
        try {
            await dbConnect();
            const progress = await GoalActivityLog.create({
                action: "progress",
                entityType: "progress",
                title: data.title,
                description: data.description || "",
                category: data.category || "Content",
                publishStatus: data.publishStatus || "published",
                order: data.order || 0,
                isPinned: Boolean(data.isPinned),
                createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            });

            emitSocketEvent("CHANGELOG_UPDATED", {
                action: "progress",
                entityType: "progress",
                title: progress.title,
                createdAt: progress.createdAt,
            });

            await invalidateGoalsCache();
            return serializeDoc(progress);
        } catch (error) {
            console.error("[GoalController.createRecentProgress] Error:", error);
            throw error;
        }
    },

    async updateRecentProgress(id, data) {
        try {
            await dbConnect();
            const update = {
                ...data,
                ...(data.createdAt ? { createdAt: new Date(data.createdAt) } : {}),
            };
            const progress = await GoalActivityLog.findOneAndUpdate({
                _id: id,
                entityType: "progress",
            }, update, { new: true }).lean();

            await invalidateGoalsCache();
            return progress ? serializeDoc(progress) : null;
        } catch (error) {
            console.error("[GoalController.updateRecentProgress] Error:", error);
            throw error;
        }
    },

    async deleteRecentProgress(id) {
        try {
            await dbConnect();
            const deleted = await GoalActivityLog.findOneAndDelete({
                _id: id,
                entityType: "progress",
            });
            await invalidateGoalsCache();
            return deleted;
        } catch (error) {
            console.error("[GoalController.deleteRecentProgress] Error:", error);
            throw error;
        }
    },

    // ===== STATISTICS =====

    // Get goals statistics
    async getGoalsStats() {
        try {
            const fallbackSummary = !Array.isArray(portfolioData.goalsData) ?
                portfolioData.goalsData?.progressMetrics :
                null;

            if (fallbackSummary) {
                return fallbackSummary;
            }

            await dbConnect();
            const goals = await Goal.find({ publishStatus: "published" }).lean();
            const fallback = fallbackGoalsData;

            const allGoals = goals.length > 0 ? goals : fallback;

            return {
                totalGoals: allGoals.length,
                completedGoals: allGoals.filter((g) => g.status === "completed").length,
                inProgressGoals: allGoals.filter((g) => g.status === "in-progress")
                    .length,
                upcomingGoals: allGoals.filter((g) => g.status === "planned").length,
                overallProgress: allGoals.length > 0 ?
                    Math.round(
                        allGoals.reduce((sum, g) => sum + (g.progress || 0), 0) /
                        allGoals.length,
                    ) : 0,
            };
        } catch (error) {
            console.error("[GoalController.getGoalsStats] Error:", error);
            return {
                totalGoals: 0,
                completedGoals: 0,
                inProgressGoals: 0,
                upcomingGoals: 0,
                overallProgress: 0,
            };
        }
    },

    // ===== IMPORT DEFAULT DATA =====

    async importDefaultGoals() {
        try {
            await dbConnect();
            const results = {
                goals: 0,
                roadmap: 0,
                milestones: 0,
            };

            // 1. Goals
            for (const g of fallbackGoalsData) {
                const exists = await Goal.findOne({ title: g.title });
                if (!exists) {
                    const data = {...g };
                    delete data.id;
                    await Goal.create(data);
                    results.goals++;
                }
            }

            // 2. Roadmap
            for (const r of fallbackRoadmapData) {
                const exists = await RoadmapItem.findOne({ title: r.title });
                if (!exists) {
                    const data = {...r };
                    delete data.id;
                    await RoadmapItem.create(data);
                    results.roadmap++;
                }
            }

            // 3. Milestones
            for (const m of fallbackMilestonesData) {
                const exists = await Milestone.findOne({ title: m.title });
                if (!exists) {
                    const data = {...m };
                    delete data.id;
                    await Milestone.create(data);
                    results.milestones++;
                }
            }

            await invalidateGoalsCache();
            return results;
        } catch (error) {
            console.error("[GoalController.importDefaultGoals] Error:", error);
            throw error;
        }
    },

    // Update Config
    async updateConfig(data) {
        try {
            await dbConnect();
            const config = await GoalsConfig.findOneAndUpdate({}, data, {
                new: true,
                upsert: true,
            }).lean();
            await invalidateGoalsCache();
            return serializeDoc(config);
        } catch (error) {
            console.error("[GoalController.updateConfig] Error:", error);
            throw error;
        }
    },
};
