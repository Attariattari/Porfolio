# Muhyo Tech — Dynamic Multi-Account Cloudinary Architecture
### High-Performance Asset Pooling, Load Balancing & Zero-Breakage Integration Specification

---

## 1. Executive Summary

### 1.1 Objective
To transform the media storage architecture of **Muhyo Tech** from a vulnerable single-account model into a scalable, high-availability **Dynamic Cloudinary Account Pool**. 

The system enables the website to seamlessly connect **unlimited Cloudinary accounts** (1 Master account from `.env.local` + $N$ dynamic accounts managed directly from the Admin Panel). An intelligent routing layer automatically distributes uploads based on real-time remaining credits, ensuring that the project **never hits the free tier limits (25 credits) again**, while maintaining **100% backward compatibility** with all existing upload flows, forms, and database records.

### 1.2 Key Architectural Tenets
1. **Zero Flow Disruption (Adapter Pattern)**: Existing blog generators, admin forms, and service uploaders continue calling identical functions. The caller remains agnostic to which account handles the asset.
2. **Dynamic Elasticity**: No hardcoded account limits. Whether 2, 5, or 20 accounts are connected, the pool dynamically discovers, balances, and routes traffic.
3. **Master Account Preservation**: The existing primary account (`dg5gwixf1`) in `.env.local` acts as the root fail-safe. If MongoDB is unreachable or all secondary pools are exhausted, the system transparently falls back to Master.
4. **Comprehensive Admin Telemetry**: Real-time visualization of bandwidth, storage, credits used, and active status per account with on-demand synchronization.
5. **Asset Migration & Equal Distribution**: Safe background replication of existing 174 project images across connected accounts to prevent single-point storage congestion.

---

## 2. Current State Analysis (Existing Cloudinary Flow)

### 2.1 Configuration & Credentials
The project currently relies on a single set of environment variables in `.env.local`:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dg5gwixf1
CLOUDINARY_API_KEY=548625488925986
CLOUDINARY_API_SECRET=TkJ0cJ9a4PMY7MapS1Fr5Ib1YAI
CLOUDINARY_URL=cloudinary://548625488925986:TkJ0cJ9a4PMY7MapS1Fr5Ib1YAI@dg5gwixf1
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=muhyo_unsigned
```

### 2.2 Existing Codebase Ingestion Points
The current codebase interacts with Cloudinary across three distinct layers:

| Layer | File Path | Existing Method / Pattern | Dependencies |
|---|---|---|---|
| **Client Upload** | `src/lib/cloudinary.js` | `uploadToCloudinary(file)` via `FormData` to `/v1_1/${cloudName}/image/upload` | Unsigned preset (`muhyo_unsigned`) |
| **Server Blog Upload** | `src/lib/server/cloudinary/uploadBlogImage.js` | `uploadBlogImageToCloudinary(fileOrBuffer, options)` | SHA-256 HMAC signature using `CLOUDINARY_API_SECRET` |
| **Server Service Upload** | `src/lib/server/cloudinary/uploadServiceImage.js` | `uploadServiceImageToCloudinary(fileOrBuffer, options)` | Signed payload targeting `Muhyo-Tech/services` folder |
| **AI Blog Generator** | `src/lib/ai/imageGenerator.js` & `src/lib/blogAutomation.js` | Direct calls to Cloudinary upload endpoint using `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Gemini AI image prompt pipeline |
| **Delivery Optimization** | `src/lib/images/getSafeImageSrc.js` | Injects `/image/upload/f_auto,q_auto/` into Cloudinary URLs | Prevents unoptimized raw bandwidth drain |

### 2.3 Why the Previous Account Lock Occurred
- **Single Account Overload**: All 174 images and all visitor traffic hit `dg5gwixf1`.
- **Transformation-Free Raw Delivery**: Earlier assets were delivered without `f_auto,q_auto`, consuming full uncompressed bandwidth (e.g. 2–5 MB per high-res PNG).
- **Free Tier Boundary**: 25 credits/month was exceeded (reaching **33.62 credits**, 134% of limit), triggering Cloudinary's automated account suspension (`401 disabled customer`).

---

## 3. High-Level System Architecture

```
                          ┌──────────────────────────────────────┐
                          │         Caller Ingestion Point        │
                          │ (Blog Drip / Admin / AI / Lightbox)  │
                          └──────────────────┬───────────────────┘
                                             │
                                             ▼
                          ┌──────────────────────────────────────┐
                          │   Smart Cloudinary Adapter Engine    │
                          │   (src/lib/cloudinary/adapter.js)   │
                          └──────────────────┬───────────────────┘
                                             │
                                             ▼
                          ┌──────────────────────────────────────┐
                          │     Account Pool Router / Arbiter     │
                          │    - Reads Master (.env) + DB Pool   │
                          │    - Checks Real-time Credit Health  │
                          │    - Selects Optimal Account (Max    │
                          │      remaining credits, non-paused)  │
                          └──────────────────┬───────────────────┘
                                             │
                 ┌───────────────────────────┼───────────────────────────┐
                 ▼                           ▼                           ▼
      ┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
      │  Master Account     │     │  Secondary Pool A   │     │  Secondary Pool B   │
      │  (dg5gwixf1 / .env) │     │  (e.g., muhyo-blog) │     │  (e.g., muhyo-serv) │
      │  Capacity: 25 Cred  │     │  Capacity: 25 Cred  │     │  Capacity: 25 Cred  │
      └─────────────────────┘     └─────────────────────┘     └─────────────────────┘
                 │                           │                           │
                 └───────────────────────────┼───────────────────────────┘
                                             │
                                             ▼
                          ┌──────────────────────────────────────┐
                          │       Returned Secure Image URL       │
                          │ (e.g. res.cloudinary.com/[cloud]/...)│
                          └──────────────────┬───────────────────┘
                                             │
                                             ▼
                          ┌──────────────────────────────────────┐
                          │  MongoDB Persistence (Zero Schema    │
                          │  Changes: saved as standard string)  │
                          └──────────────────────────────────────┘
```

---

## 4. Database Schema Design (MongoDB)

A new dedicated collection, `cloudinaryaccounts`, is introduced in MongoDB. Existing collections (`blogs`, `services`, `projects`, `siteconfigs`) remain 100% unchanged because they simply store standard URL strings.

### 4.1 `CloudinaryAccount` Schema
```javascript
// src/models/CloudinaryAccount.js
import mongoose from "mongoose";

const CloudinaryAccountSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      default: "Secondary Media Account",
    },
    cloudName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    apiKey: {
      type: String,
      required: true,
      trim: true,
    },
    apiSecret: {
      type: String,
      required: true,
      trim: true,
      // In production, encrypted via AES-256 before write
    },
    uploadPreset: {
      type: String,
      default: "ml_default",
      trim: true,
    },
    isMaster: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 1, // 1 = standard, higher = preferred
    },
    status: {
      type: String,
      enum: ["healthy", "warning", "exhausted", "error", "paused"],
      default: "healthy",
    },
    // Real-Time Metrics from Cloudinary Usage API
    usage: {
      totalCredits: { type: Number, default: 25 },
      usedCredits: { type: Number, default: 0 },
      remainingCredits: { type: Number, default: 25 },
      usagePercent: { type: Number, default: 0 },
      bandwidthBytes: { type: Number, default: 0 },
      storageBytes: { type: Number, default: 0 },
      transformations: { type: Number, default: 0 },
      lastSyncedAt: { type: Date, default: null },
    },
    // Failure & Error Tracking
    errorLogs: [
      {
        timestamp: { type: Date, default: Date.now },
        message: String,
        httpCode: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual index for fast routing queries
CloudinaryAccountSchema.index({ isActive: 1, "usage.remainingCredits": -1 });

export default mongoose.models.CloudinaryAccount ||
  mongoose.model("CloudinaryAccount", CloudinaryAccountSchema);
```

---

## 5. Pool Engine & Routing Algorithm

### 5.1 The Account Arbiter (`src/lib/server/cloudinary/poolManager.js`)
The Arbiter performs three core operations:

#### Operation 1: Unified Pool Resolution
1. Fetches all active accounts where `isActive === true` from MongoDB.
2. Checks if Master account (`.env.local`) is present in the list; if not, injects Master as the base node.
3. If MongoDB is offline, falls back to the in-memory Master configuration without throwing an exception.

#### Operation 2: Best-Fit Selection Algorithm
When an upload arrives:
1. Filters out accounts where `status === "exhausted"`, `status === "paused"`, or `usage.usagePercent >= 88%`.
2. Sorts remaining candidates by:
   - Primary: `usage.remainingCredits` (Descending — highest free headroom first)
   - Secondary: `priority` (Descending)
3. Selects the top candidate as the active target for the transaction.
4. Returns the candidate credentials `{ cloudName, apiKey, apiSecret, uploadPreset }`.

#### Operation 3: Background Health & Usage Sync
Leverages the Cloudinary Admin Usage API:
```text
GET https://api.cloudinary.com/v1_1/${cloudName}/usage
Authorization: Basic base64(apiKey:apiSecret)
```
- Computes `credits = (bandwidth_bytes / 1GB) + (storage_bytes / 1GB) + (transformations / 1000)`.
- Updates `usedCredits`, `remainingCredits`, and assigns status:
  - `< 70%`: 🟢 `healthy`
  - `70% - 85%`: 🟡 `warning`
  - `> 85%`: 🔴 `exhausted` (Automatically switches out of upload circulation)

---

## 6. Backward Compatibility (Zero-Breakage Guarantee)

### 6.1 Preserving Existing Upload Signatures
Existing components import upload functions from:
- `src/lib/cloudinary.js` -> `uploadToCloudinary(file)`
- `src/lib/server/cloudinary/uploadBlogImage.js` -> `uploadBlogImageToCloudinary(fileOrBuffer, options)`
- `src/lib/server/cloudinary/uploadServiceImage.js` -> `uploadServiceImageToCloudinary(fileOrBuffer, options)`

**The Adapter Upgrade:**
Instead of refactoring components, the internal implementations of these three functions are updated to invoke the Arbiter:

```javascript
// Example: Backward-compatible signature in uploadBlogImage.js
export async function uploadBlogImageToCloudinary(fileOrBuffer, options = {}) {
  // 1. Ask the Arbiter for the best account currently available
  const activeAccount = await poolManager.getOptimalAccount({ purpose: "blog" });
  
  // 2. Execute upload against selected account's credentials
  const { cloudName, apiKey, apiSecret } = activeAccount;
  
  // 3. Existing signed multipart upload logic proceeds 100% identically
  // ...
  
  // 4. Returns standard { url, publicId, width, height }
  return { url: data.secure_url, ... };
}
```

### 6.2 Frontend Link Resolution
Next.js `<Image />` and HTML `<img />` tags resolve image URLs through `src/lib/images/getSafeImageSrc.js`.
Because Cloudinary image URLs are self-contained (e.g. `https://res.cloudinary.com/[CLOUD_NAME]/image/upload/...`), the browser and CDN resolve images based on the domain in the link. 
- Image A from `dg5gwixf1` loads from `res.cloudinary.com/dg5gwixf1/...`
- Image B from `muhyo-tech-02` loads from `res.cloudinary.com/muhyo-tech-02/...`
- **Result**: No routing changes or reverse proxies are needed in the frontend.

---

## 7. Admin Control Center & Telemetry UI

A dedicated management portal is integrated into the Admin Dashboard at:
`/admin/media-pool` (accessible via the Admin Sidebar).

### 7.1 Key UI Components

```
┌────────────────────────────────────────────────────────────────────────┐
│  CLOUDINARY MEDIA POOL MANAGER                 [+ Add Account] [⟳ Sync]│
├────────────────────────────────────────────────────────────────────────┤
│  OVERVIEW METRICS                                                      │
│  ┌──────────────────┐ ┌──────────────────┐ ┌─────────────────────────┐ │
│  │ Connected Accounts│ │ Total Pool Credits│ │ Active Upload Target   │ │
│  │ 4 Accounts (3 On) │ │ 78.4 / 100.0 Left│ │ Account #3 (24.2 Left) │ │
│  └──────────────────┘ └──────────────────┘ └─────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│  CONNECTED ACCOUNTS                                                    │
│                                                                        │
│  1. Primary Master (dg5gwixf1) [ENV] [ACTIVE 🟢]                       │
│     Usage: [████████████████░░░░░░░░] 33.6 / 55.0 Credits (61%)        │
│     Storage: 1.2 GB | Bandwidth: 14.8 GB | Actions: [View] [Sync]     │
│                                                                        │
│  2. Muhyo Blog Pool (muhyo-blogs-01) [DB] [ACTIVE 🟢] [NEXT TARGET ★]  │
│     Usage: [██░░░░░░░░░░░░░░░░░░░░░░] 2.1 / 25.0 Credits (8%)         │
│     Storage: 240 MB | Bandwidth: 1.1 GB | Actions: [Edit] [Pause]     │
│                                                                        │
│  3. Muhyo Services Pool (muhyo-services-01) [DB] [ACTIVE 🟢]           │
│     Usage: [█░░░░░░░░░░░░░░░░░░░░░░░] 1.4 / 25.0 Credits (5%)         │
│     Storage: 180 MB | Bandwidth: 800 MB | Actions: [Edit] [Pause]     │
│                                                                        │
│  4. Legacy Archive (muhyo-old) [DB] [PAUSED ⏸]                         │
│     Usage: [██████████████████████░░] 22.8 / 25.0 Credits (91%)        │
│     Actions: [Edit] [Resume] [Delete]                                  │
└────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Core Admin Features
1. **Live Visual Usage Meters**: Color-coded progress bars (Green < 70%, Amber 70-85%, Red > 85%).
2. **Interactive Credential Validation**: When adding a new account, the form issues a background ping to Cloudinary API. If credentials fail (`401 invalid credentials`), it warns the user before saving.
3. **One-Click Maintenance Actions**:
   - **Pause/Resume**: Instantly toggle any account out of upload rotation.
   - **Force Sync**: Re-poll all accounts from Cloudinary live APIs.
   - **Delete**: Safe delete (blocked for Master account).

---

## 8. Existing Asset Migration & Equal Distribution Plan

To eliminate historical congestion on the master account (`dg5gwixf1`), a safe migration script will evenly redistribute the existing 174 assets across all connected pool accounts.

### 8.1 Migration Algorithm
```text
Step 1: Extract all 174 verified Cloudinary image records from MongoDB & static data.
Step 2: Calculate distribution quota: Quota = Total Assets / N Active Accounts.
Step 3: For each asset:
        a. Download original file buffer from source Cloudinary URL.
        b. Upload buffer to destination account using identical publicId.
        c. Verify destination URL responds with HTTP 200.
        d. Update MongoDB document reference (Blog, Service, Project) with new URL.
Step 4: Keep source asset intact on master account until migration verification is complete.
```

---

## 9. Implementation Roadmap

| Phase | Milestone | Deliverables | Risk Level |
|---|---|---|---|
| **Phase 1** | **Data Model & Backend Arbiter** | Create `CloudinaryAccount.js` model; implement `poolManager.js` with usage sync and best-fit routing. | Low (Additive) |
| **Phase 2** | **Zero-Breakage Adapter Layer** | Upgrade `uploadBlogImage.js`, `uploadServiceImage.js`, and `uploadToCloudinary.js` to route via Arbiter with Master fallback. | Minimal (100% backward compatible) |
| **Phase 3** | **Admin API Endpoints** | Build `/api/admin/cloudinary-pool` CRUD endpoints with input validation and usage polling. | Low |
| **Phase 4** | **Admin Control Panel UI** | Build `/admin/media-pool` dashboard with live status meters, modal forms, and account controls. | Low |
| **Phase 5** | **Asset Migration Utility** | Background script to distribute the 174 assets across pool accounts and patch MongoDB records. | Zero (Preserves original URLs until verified) |

---

## 10. Summary & Guarantees

1. **No Code Breakage**: All current blog generators, forms, and image lightbox components operate without modifications to their API contracts.
2. **Unlimited Free Scaling**: By pooling $N$ free accounts, the project unlocks $N \times 25$ credits per month (e.g. 5 accounts = 125 credits/month).
3. **Autonomous Resilience**: Accounts nearing exhaustion are automatically sidelined before suspensions can occur.
4. **Full Transparency**: The site owner retains full visual visibility over every byte and credit across the entire infrastructure from the admin dashboard.
