import dbConnect from "@/lib/dbConnect";
import { Subscriber } from "@/models/Subscriber";
import { serializeDoc } from "@/lib/mongooseHelper";

/**
 * SubscriberController
 * Optimized for newsletter management and dashboard stats.
 */
export const SubscriberController = {
    // 1. Get All Subscribers - Optimized
    async getAll(query = {}) {
        await dbConnect();
        const { search, status, page = 1, limit = 10 } = query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const skip = (pageNum - 1) * limitNum;
        
        let filter = {};
        if (search) {
            filter.email = { $regex: search, $options: 'i' };
        }
        if (status === 'active') {
            filter.isActive = true;
        } else if (status === 'inactive') {
            filter.isActive = false;
        }

        const [subscribers, total] = await Promise.all([
            Subscriber.find(filter)
                .sort({ subscribedAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Subscriber.countDocuments(filter)
        ]);
        
        return {
            subscribers: serializeDoc(subscribers),
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            totalSubscribers: total
        };
    },
    
    // 2. Get By ID - Optimized
    async getById(id) {
        await dbConnect();
        const sub = await Subscriber.findById(id).lean();
        return sub ? serializeDoc(sub) : null;
    },

    // 3. Update Subscriber
    async update(id, data) {
        await dbConnect();
        const updated = await Subscriber.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
        return updated ? serializeDoc(updated) : null;
    },

    // 4. Get Summary Stats - Optimized with parallel counts
    async getStats() {
        await dbConnect();
        const [total, active, inactive] = await Promise.all([
            Subscriber.countDocuments(),
            Subscriber.countDocuments({ isActive: true }),
            Subscriber.countDocuments({ isActive: false })
        ]);
        
        return { total, active, inactive };
    },

    // 5. Delete Subscriber
    async delete(id) {
        await dbConnect();
        return await Subscriber.findByIdAndDelete(id).lean();
    },

    // 6. Bulk Update Status
    async bulkUpdateStatus(ids, isActive) {
        await dbConnect();
        const updateData = { 
            isActive,
            unsubscribedAt: isActive ? null : new Date()
        };
        return await Subscriber.updateMany({ _id: { $in: ids } }, { $set: updateData });
    },

    // 7. Update Last Sent Timestamp
    async updateLastSent(ids) {
        await dbConnect();
        return await Subscriber.updateMany(
            { _id: { $in: ids } },
            { $set: { lastSent: new Date() } }
        );
    }
};

