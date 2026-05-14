import { Activity } from '../models/Activity';
import dbConnect from '../lib/dbConnect';
import { serializeDoc } from '../lib/mongooseHelper';

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
            return serializeDoc(activity);
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
            await dbConnect();
            const activities = await Activity.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
            return serializeDoc(activities);
        } catch (error) {
            return [];
        }
    }
};

