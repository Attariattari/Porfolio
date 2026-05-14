import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String },
  passkey: { type: String },
  role: { type: String, enum: ['user', 'admin', 'super-admin', 'root-super-admin'], default: 'user' },
  status: { type: String, enum: ['pending', 'approved', 'denied', 'removed'], default: 'pending' },
  permissions: { type: Object, default: {} },
  
  // ===== PASSWORD RESET SYSTEM (Enterprise-Grade) =====
  // Password reset token for secure credential changes
  passwordResetToken: { type: String, index: true }, // JWT token hash
  passwordResetExpires: { type: Date, index: true }, // Token expiration
  passwordResetUsed: { type: Boolean, default: false }, // One-time use validation
  
  // Password change audit trail
  lastPasswordChangedAt: { type: Date }, // When passkey was last changed
  passwordChangedBy: { type: String }, // Email/source of password change ('admin_transfer', 'user_initiated', etc.)
  passwordChangeReason: { type: String }, // Reason for change
  
  // Session security
  passwordChangeInvalidatesSessionsBefore: { type: Date }, // All older sessions are invalid
  
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
}, { strict: false }); // CRITICAL: Allows saving fields even if schema is slightly stale in memory

export default mongoose.models.User || mongoose.model('User', UserSchema);

// Notification Model
const NotificationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read', 'approved', 'denied'], default: 'unread' },
  relatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

// PendingCode Model
const PendingCodeSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  code: { type: String, required: true },
  type: { type: String, default: 'setup' },
  expiry: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// TTL Index to auto-delete expired codes
PendingCodeSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });

export const PendingCode = mongoose.models.PendingCode || mongoose.model('PendingCode', PendingCodeSchema);
