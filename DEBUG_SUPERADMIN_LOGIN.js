// DEBUG GUIDE - Super Admin Login & Transfer System
// Use this to check if everything is working properly

// ============================================
// BROWSER CONSOLE DEBUGGING
// ============================================

// 1. Open browser console (F12 or Ctrl+Shift+I)
// 2. Look for these console logs:

// LOGIN DEBUGGING:
// ✅ SUCCESS: [Login] ✅ Token stored in localStorage
// ✅ SUCCESS: [Login Response] { status: 200, success: true, data: {...} }
// ✅ SUCCESS: [Login] ✅ Login successful, redirecting...

// ❌ ERROR: [Login] ❌ Login failed: { code: "NOT_FOUND", message: "..." }
// ❌ ERROR: [Login] ❌ Network error: ...

// ============================================
// FLOW 1: First-Time Setup (DB Empty)
// ============================================

// Step 1: Check if .env has values
console.log("Check .env.local has:");
// SUPER_ADMIN_EMAIL=attariattari549@gmail.com
// SUPER_ADMIN_NAME=Pir Ghulam Muhyo Din

// Step 2: Delete SiteConfig from MongoDB (make DB empty)
// In MongoDB Compass or CLI:
// db.siteconfigs.deleteMany({})

// Step 3: Restart app
// Expected: App creates SiteConfig automatically from .env
// Console should show: "[getSuperAdminConfigWithFallback] First run: Creating SiteConfig with .env values"

// Step 4: Try to login with .env email
// Email: attariattari549@gmail.com
// Passkey: (will be shown after transfer completes)
// Expected: Login succeeds

// ============================================
// FLOW 2: Super Admin Transfer to New Email
// ============================================

// Step 1: Login as current Super Admin
// Step 2: Go to Settings → Super Admin Security
// Step 3: Click "Transfer Super Admin Email"
// Step 4: Enter new email (e.g., newemail@example.com)
// Step 5: Verify OTP from current email
// Step 6: Complete final confirmation

// Expected Console Logs:
// [TransferController.initiateTransfer] Starting...
// [TransferController] Current Super Admin Email: attariattari549@gmail.com From DB: true
// [TransferController.verifyCurrentEmail] OTP verified
// [TransferController] Generated new passkey for Super Admin
// [TransferController] Created new Super Admin user account with passkey
// [TransferController] SiteConfig updated with new Super Admin
// [TransferController.confirmTransfer] ... completed successfully

// Look for this in success modal:
// - New email address shown
// - Passkey displayed (can copy it)
// - Manual "Go to Login" button to redirect

// ============================================
// FLOW 3: Login with New Super Admin
// ============================================

// Step 1: After transfer, click "Go to Login"
// Step 2: Enter new email (newemail@example.com)
// Step 3: Enter passkey (shown in previous modal)
// Step 4: Click Login

// Expected Console:
// [Login Response] { status: 200, success: true, data: {...} }
// [Login] ✅ Token stored in localStorage
// [Login] ✅ Login successful, redirecting...
// → Redirects to /admin/dashboard

// ❌ If failing:
// Check console for: [Login] ❌ Login failed: { code: "...", message: "..." }
// Most common issues:
// 1. Passkey doesn't match → Copy it correctly from transfer modal
// 2. User not in DB → Check if new admin user was created in transfer
// 3. Status not "approved" → Check DB user.status field

// ============================================
// FLOW 4: Check Super Admin Name Display
// ============================================

// Step 1: Login successfully as Super Admin
// Step 2: Check if name shows "SuperAdmin" (not formatted name)
// Step 3: Check JWT token contains correct name

// In console:
function checkJWT() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log("❌ No token in localStorage");
    return;
  }
  
  try {
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    console.log("✅ JWT Payload:", payload);
    console.log("  - Name:", payload.name);
    console.log("  - Email:", payload.email);
    console.log("  - Role:", payload.role);
  } catch (e) {
    console.error("❌ Failed to decode JWT:", e);
  }
}

checkJWT();

// ============================================
// DATABASE CHECKS
// ============================================

// 1. Check SiteConfig in MongoDB:
// db.siteconfigs.findOne()
// Should have:
// {
//   superAdminEmail: "attariattari549@gmail.com",
//   superAdminTransferHistory: [],
//   adminName: "Pir Ghulam Muhyo Din",
//   ...
// }

// 2. Check User collection:
// db.users.findOne({ email: "attariattari549@gmail.com" })
// Should have:
// {
//   email: "attariattari549@gmail.com",
//   name: "SuperAdmin",
//   role: "super-admin",
//   status: "approved",
//   passkey: "XXXXXXXXXXX",
//   ...
// }

// ============================================
// COMMON ISSUES & SOLUTIONS
// ============================================

// ISSUE 1: Login page auto-refreshes, error not visible
// SOLUTION: New fix added - errors now stay for 5 seconds before redirect
// Check console for: [Login] ❌ Login failed: ...

// ISSUE 2: New Super Admin can't login
// SOLUTION: We now generate and set passkey on new user creation
// Check if User has passkey: db.users.findOne({ email: "newemail@com" }).passkey

// ISSUE 3: Name shows formatted instead of "SuperAdmin"
// SOLUTION: Fixed - new admin created with name: "SuperAdmin"
// Check JWT: checkJWT() should show name: "SuperAdmin"

// ISSUE 4: ".env email not being used when DB empty"
// SOLUTION: getSuperAdminConfigWithFallback() auto-creates SiteConfig from .env
// Check logs: "[getSuperAdminConfigWithFallback] First run: Creating SiteConfig with .env values"

// ISSUE 5: Transfer fails, shows generic error
// SOLUTION: Check console for specific error details
// [TransferController.confirmTransfer] Error: {specific message}

// ============================================
// MANUAL TEST COMMANDS
// ============================================

// Test 1: Get current Super Admin config
async function testGetConfig() {
  const res = await fetch('/api/admin/settings');
  const data = await res.json();
  console.log("Super Admin Email from DB:", data?.superAdminEmail);
}
testGetConfig();

// Test 2: Check if .env fallback works
// In code: Use getSuperAdminConfigWithFallback(dbConnect, SiteConfig)
// Will return { superAdminEmail, isFromDatabase, isInitialized }

// Test 3: Simulate first-time setup
async function testFirstTimeSetup() {
  // Delete SiteConfig from DB
  // Restart app
  // Check console for: "[getSuperAdminConfigWithFallback] First run: Creating SiteConfig"
}

// ============================================
// MONITORING CHECKLIST
// ============================================

// When testing, check for all these:
// ✅ Console errors visible before redirect
// ✅ New Super Admin passkey generated
// ✅ New admin user created with passkey
// ✅ Name displays as "SuperAdmin"
// ✅ .env values used on first setup
// ✅ Database values preferred when available
// ✅ Transfer history logged
// ✅ Old admin downgraded to regular admin
// ✅ Sessions invalidated after transfer
// ✅ Emails sent to both parties

// ============================================
