'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader, KeyRound, Shield } from 'lucide-react';
import { toast } from 'sonner';

const PASSKEY_STRENGTH = {
  weak: { color: '#ef4444', label: 'Weak', width: '33%' },
  medium: { color: '#f59e0b', label: 'Medium', width: '66%' },
  strong: { color: '#10b981', label: 'Strong', width: '100%' },
};

export default function ChangePasskeyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();


  const token = searchParams.get('token');

  // State
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // Form state
  const [newPasskey, setNewPasskey] = useState('');
  const [confirmPasskey, setConfirmPasskey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passkeyStrength, setPasskeyStrength] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!token) {
          setError('No reset token provided. Please check your email link.');
          setLoading(false);
          return;
        }

        console.log('[ChangePasskey] Verifying token...');
        const response = await fetch('/api/admin/security/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || data.error || 'Invalid or expired token');
          setLoading(false);
          return;
        }

        console.log('[ChangePasskey] ✅ Token verified');
        setTokenValid(true);
        setUserEmail(data.data.email);
        setExpiresAt(new Date(data.data.expiresAt));
        setLoading(false);
      } catch (err) {
        console.error('[ChangePasskey] Verification error:', err);
        setError('Failed to verify token. Please try again.');
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Calculate time remaining
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setError('Reset link has expired');
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // Analyze passkey strength
  useEffect(() => {
    if (!newPasskey) {
      setPasskeyStrength(null);
      return;
    }

    const hasUpperCase = /[A-Z]/.test(newPasskey);
    const hasLowerCase = /[a-z]/.test(newPasskey);
    const hasNumbers = /\d/.test(newPasskey);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPasskey);
    const isLongEnough = newPasskey.length >= 8;

    let strength = 'weak';
    if (hasUpperCase && hasLowerCase && hasNumbers && isLongEnough) {
      strength = 'medium';
    }
    if (hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars && isLongEnough) {
      strength = 'strong';
    }

    setPasskeyStrength({
      strength,
      metrics: {
        length: `${newPasskey.length}/128 chars`,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChars,
        isLongEnough,
      },
    });
  }, [newPasskey]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Validation
      if (!newPasskey || !confirmPasskey) {
        setError('Please enter both passkeys');
        setSubmitting(false);
        return;
      }

      if (newPasskey !== confirmPasskey) {
        setError('Passkeys do not match');
        setSubmitting(false);
        return;
      }

      if (newPasskey.length < 8) {
        setError('Passkey must be at least 8 characters');
        setSubmitting(false);
        return;
      }

      if (!passkeyStrength || passkeyStrength.strength === 'weak') {
        setError('Passkey is too weak. Please use uppercase, lowercase, numbers, and special characters.');
        setSubmitting(false);
        return;
      }

      console.log('[ChangePasskey] Submitting passkey change...');

      const response = await fetch('/api/admin/security/change-passkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPasskey,
          confirmPasskey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[ChangePasskey] Error:', data.message || data.error);
        setError(data.message || data.error || 'Failed to change passkey');
        setSubmitting(false);
        return;
      }

      console.log('[ChangePasskey] ✅ Passkey changed and auto-logged in');
      
      // Store the new token if provided
      if (data.data?.token) {
        localStorage.setItem('admin_token', data.data.token);
        // Also set cookie for middleware (though server already did)
        document.cookie = `admin_auth_token=${data.data.token}; path=/; max-age=86400; SameSite=Lax`;
      }

      toast.success('Passkey changed! Session established. Entering dashboard...');
      setSuccess(true);

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1500);
    } catch (err) {
      console.error('[ChangePasskey] Submit error:', err);
      setError('An unexpected error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your reset link...</p>
        </motion.div>
      </div>
    );
  }

  // Invalid or expired token
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-slate-800/50 border border-red-500/20 rounded-24 p-12 text-center backdrop-blur-xl">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-black uppercase tracking-tighter mb-4 text-red-400">
              Invalid Reset Link
            </h1>
            <p className="text-muted-foreground mb-8">{error}</p>
            <button
              onClick={() => router.push('/admin/login')}
              className="px-8 py-3 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl transition-colors"
            >
              Back to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-24 p-12 text-center backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
            </motion.div>
            <h1 className="text-2xl font-black uppercase tracking-tighter mb-4 text-green-400">
              Passkey Updated
            </h1>
            <p className="text-muted-foreground mb-2">
              Your custom passkey has been set and your session is active.
            </p>
            <p className="text-sm text-accent font-bold mb-8 uppercase tracking-widest">
              Initializing Dashboard Access...
            </p>
            <Loader className="w-6 h-6 text-accent animate-spin mx-auto" />
          </div>
        </motion.div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto mt-12"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-accent/10 border border-accent/20 text-accent">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">
              Create Your <span className="text-accent">Custom Passkey</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            You're now the Super Admin of Muhyo Tech. Set your own secure passkey.
          </p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 border border-white/10 rounded-24 p-8 backdrop-blur-xl mb-8"
        >
          {/* Email Display */}
          <div className="mb-8 p-6 bg-slate-900/50 border border-accent/20 rounded-2xl">
            <p className="text-sm text-muted-foreground mb-2">Account Email</p>
            <p className="text-lg font-mono font-bold text-accent">{userEmail}</p>
          </div>

          {/* Time Remaining */}
          <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
            <Lock className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm font-bold text-blue-400">Reset Link Valid</p>
              <p className="text-xs text-blue-300">{timeLeft}</p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-400">Error</p>
                <p className="text-xs text-red-300">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Passkey Field */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-accent mb-3 block">
                New Passkey
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPasskey}
                  onChange={(e) => setNewPasskey(e.target.value)}
                  placeholder="Enter your new passkey"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Strength Indicator */}
              {passkeyStrength && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-bold">Strength</p>
                    <p className={`text-xs font-bold ${
                      passkeyStrength.strength === 'strong'
                        ? 'text-green-400'
                        : passkeyStrength.strength === 'medium'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}>
                      {passkeyStrength.strength.toUpperCase()}
                    </p>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: PASSKEY_STRENGTH[passkeyStrength.strength].width,
                      }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                      style={{
                        backgroundColor: PASSKEY_STRENGTH[passkeyStrength.strength].color,
                      }}
                    />
                  </div>

                  {/* Checklist */}
                  <div className="space-y-2 mt-4">
                    {[
                      { key: 'isLongEnough', label: '8+ characters' },
                      { key: 'hasUpperCase', label: 'Uppercase (A-Z)' },
                      { key: 'hasLowerCase', label: 'Lowercase (a-z)' },
                      { key: 'hasNumbers', label: 'Numbers (0-9)' },
                      { key: 'hasSpecialChars', label: 'Special chars (!@#$...)' },
                    ].map((req) => (
                      <div key={req.key} className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            passkeyStrength.metrics[req.key]
                              ? 'bg-green-500'
                              : 'bg-slate-700'
                          }`}
                        >
                          {passkeyStrength.metrics[req.key] && (
                            <span className="text-white text-xs font-bold">✓</span>
                          )}
                        </div>
                        <span
                          className={`text-xs ${
                            passkeyStrength.metrics[req.key]
                              ? 'text-green-400'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Passkey Field */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-accent mb-3 block">
                Confirm Passkey
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPasskey}
                  onChange={(e) => setConfirmPasskey(e.target.value)}
                  placeholder="Re-enter your passkey"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Match Indicator */}
              {newPasskey && confirmPasskey && (
                <div className="mt-3">
                  {newPasskey === confirmPasskey ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Passkeys match</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Passkeys don't match</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <p className="text-xs text-yellow-300 leading-relaxed">
                <strong>🔒 Security:</strong> Your passkey is hashed and securely stored. Never share it. You will be automatically logged in after this change.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                submitting ||
                !newPasskey ||
                !confirmPasskey ||
                newPasskey !== confirmPasskey ||
                !passkeyStrength ||
                passkeyStrength.strength === 'weak'
              }
              className={`w-full px-6 py-4 font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                submitting || !newPasskey || !confirmPasskey
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-accent to-cyan-500 text-white hover:shadow-lg hover:shadow-accent/50'
              }`}
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Setting Passkey...
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5" />
                  Set Custom Passkey
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>After setting your passkey, you'll be redirected to your dashboard.</p>
        </div>
      </motion.div>
    </div>
  );
}
