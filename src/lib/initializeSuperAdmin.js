/**
 * Initialize Super Admin Configuration on App Startup
 * 
 * This module ensures that the Super Admin email is properly configured
 * on application startup using a professional fallback system:
 * 
 * 1. If database has SiteConfig with superAdminEmail → Use it
 * 2. If database has SiteConfig but no superAdminEmail → Initialize from .env
 * 3. If no SiteConfig exists → Create from .env values (first run)
 * 4. If database error → Use .env values as emergency fallback
 * 
 * This should be called in middleware or API initialization.
 */

import dbConnect from "@/lib/dbConnect";
import { getSuperAdminConfigWithFallback } from "@/lib/transferUtils";

// Cache the initialized config
let cachedConfig = null;
let initializationPromise = null;

/**
 * Initialize Super Admin configuration (singleton pattern)
 * Safe to call multiple times - returns cached config after first init
 */
export async function initializeSuperAdminConfig() {
  // Return cached config if already initialized
  if (cachedConfig) {
    return cachedConfig;
  }

  // Prevent concurrent initialization attempts
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = performInitialization();
  cachedConfig = await initializationPromise;
  return cachedConfig;
}

/**
 * Perform the actual initialization
 */
async function performInitialization() {
  try {
    // Lazy load to avoid circular imports
    const { default: SiteConfig } = await import("@/models/Portfolio");

    console.log("[initializeSuperAdmin] Starting Super Admin configuration...");

    // Call the professional fallback function
    const config = await getSuperAdminConfigWithFallback(dbConnect, SiteConfig);

    console.log("[initializeSuperAdmin] ✅ Super Admin configured:", {
      email: config.superAdminEmail,
      name: config.superAdminName,
      source: config.isFromDatabase ? "Database" : "Environment",
      firstRun: config.isInitialized,
    });

    return config;
  } catch (error) {
    console.error("[initializeSuperAdmin] ❌ Initialization failed:", error.message);

    // Return emergency fallback
    return {
      superAdminEmail: (
        process.env.SUPER_ADMIN_EMAIL ||
        process.env.SUPERADMIN_EMAIL ||
        "attariattari549@gmail.com"
      ).toLowerCase(),
      superAdminName: process.env.SUPER_ADMIN_NAME || "Pir Ghulam Muhyo Din",
      isFromDatabase: false,
      isInitialized: false,
      isEmergencyFallback: true,
    };
  }
}

/**
 * Get the cached configuration (must call initializeSuperAdminConfig first)
 */
export function getSuperAdminConfig() {
  if (!cachedConfig) {
    throw new Error(
      "Super Admin config not initialized. Call initializeSuperAdminConfig() first."
    );
  }
  return cachedConfig;
}

/**
 * Reset cache (useful for testing)
 */
export function resetSuperAdminCache() {
  cachedConfig = null;
  initializationPromise = null;
}

/**
 * Force reinitialize (useful for admin updates)
 */
export async function reinitializeSuperAdminConfig() {
  resetSuperAdminCache();
  return initializeSuperAdminConfig();
}
