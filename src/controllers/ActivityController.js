import { Activity } from '../models/Activity';
import dbConnect from '../lib/dbConnect';
import { serializeDoc } from '../lib/mongooseHelper';
import { withCache, deleteCache, deleteCachePattern } from '@/lib/cache';

/**
 * ActivityController
 * Optimized for system logging and dashboard performance.
 */
export const ActivityController = {
    // 1. Log activity - Optimized with background creation
    async log({ user, action, module, details, targetId }) {
        try {
            await dbConnect();
            const activity = await Activity.create({
                user: {
                    name: user.name || 'Admin',
                    email: user.email,
                    role: user.role
                },
                action,
                module,
                details,
                targetId
            });
            const serialized = serializeDoc(activity);
            deleteCache("admin:activity:recent:10").catch(() => {});
            deleteCache("admin:activity:recent:15").catch(() => {});
            deleteCachePattern("admin:activity:recent:*").catch(() => {});
            return serialized;
        } catch (error) {
            // Silently fail to not break main flow
            return null;
        }
    },

    // 2. Log from session wrapper
    async logFromSession(session, { action, module, details, targetId }) {
        if (!session) return;
        return ActivityController.log({
            user: {
                name: session.name || session.user?.name || 'Admin',
                email: session.email || session.user?.email,
                role: session.role
            },
            action,
            module,
            details,
            targetId
        });
    },

    // 3. Get recent activities - Optimized with lean()
    async getRecent(limit = 10) {
        try {
            return await withCache(`admin:activity:recent:${limit}`, async () => {
                await dbConnect();
                const activities = await Activity.find()
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .lean();
                return serializeDoc(activities);
            }, 30, ["activity"]);
        } catch (error) {
            return [];
        }
    }
};

