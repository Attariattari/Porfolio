import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  user: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String }
  },
  action: { 
    type: String, 
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']
  },
  module: { 
    type: String, 
    required: true,
    enum: ['PROJECTS', 'SERVICES', 'BLOGS', 'SKILLS', 'MESSAGES', 'BOOKINGS', 'SUBSCRIBERS', 'USERS', 'ABOUT', 'SETTINGS']
  },
  details: { type: String },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  createdAt: { type: Date, default: Date.now }
});

export const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
