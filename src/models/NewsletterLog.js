import mongoose from 'mongoose';

const NewsletterLogSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['blog', 'service', 'project', 'manual', 'welcome']
  },
  contentSummary: { type: String }, // For manual type, store truncated message
  targetId: { type: mongoose.Schema.Types.ObjectId }, // ID of the blog/project/service
  sentToCount: { type: Number, default: 0 },
  successCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  sentAt: { type: Date, default: Date.now }
});

export const NewsletterLog = mongoose.models.NewsletterLog || mongoose.model('NewsletterLog', NewsletterLogSchema);
