import dbConnect from "../dbConnect.js";
import { JobExecution } from "../../models/JobExecution.js";
import { getWorkerId } from "./workerIdentity.js";

const DEFAULT_LEASE_DURATION_MS = 2 * 60 * 1000; // 2 minutes rolling lease

/**
 * Attempts to atomically acquire a job slot lease for a specific daily slot (e.g., "2026-08-12-01").
 *
 * Prevents multiple workers from running AI processing simultaneously:
 * 1. If slot is fresh, creates a new JobExecution with unique index constraint.
 * 2. If another active worker holds the lease, returns ownedByOther: true (0 AI calls made).
 * 3. If a previous worker's lease expired (crash/timeout), takes over the lease atomically.
 */
export async function acquireJobSlot({
  slot,
  source = "primary",
  leaseDurationMs = DEFAULT_LEASE_DURATION_MS,
} = {}) {
  await dbConnect();
  const workerId = getWorkerId();
  const now = new Date();
  const leaseExpiresAt = new Date(now.getTime() + leaseDurationMs);

  try {
    // Attempt to create a new job slot reservation
    const newJob = await JobExecution.create({
      slot,
      source,
      workerId,
      status: "processing",
      leaseAcquiredAt: now,
      leaseExpiresAt,
      lastHeartbeatAt: now,
      currentStage: "SLOT_CLAIMED",
    });

    console.log(`[DistributedLock] Worker "${workerId}" acquired NEW slot lock: ${slot}`);
    return {
      acquired: true,
      job: newJob.toObject(),
      workerId,
      resumed: false,
    };
  } catch (error) {
    // E11000 Duplicate key error on 'slot' means slot was already claimed
    if (error?.code !== 11000) {
      throw error;
    }
  }

  // Slot already exists. Check if current worker already owns it or if lease expired.
  const existingJob = await JobExecution.findOne({ slot }).lean();
  if (!existingJob) {
    return { acquired: false, ownedByOther: true, message: "Slot unavailable." };
  }

  // If completed, no duplicate execution needed
  if (existingJob.status === "completed") {
    return {
      acquired: false,
      completed: true,
      job: existingJob,
      message: `Slot ${slot} is already completed.`,
    };
  }

  // If currently processing and lease is STILL VALID
  if (existingJob.status === "processing" && existingJob.leaseExpiresAt > now) {
    if (existingJob.workerId === workerId) {
      // Re-entry by the same worker instance
      await renewJobLease({ jobId: existingJob._id, workerId, leaseDurationMs });
      return {
        acquired: true,
        job: existingJob,
        workerId,
        resumed: true,
      };
    }

    console.log(
      `[DistributedLock] Slot ${slot} is currently owned by active worker "${existingJob.workerId}". Skipping execution.`,
    );
    return {
      acquired: false,
      ownedByOther: true,
      activeWorkerId: existingJob.workerId,
      leaseExpiresAt: existingJob.leaseExpiresAt,
      message: `Slot ${slot} is currently owned by active worker ${existingJob.workerId}.`,
    };
  }

  // Lease EXPIRED or previous attempt failed: Failover takeover
  const takenOverJob = await JobExecution.findOneAndUpdate(
    {
      _id: existingJob._id,
      $or: [
        { status: "processing", leaseExpiresAt: { $lte: now } },
        { status: "claimed" },
        { status: "failed", retryCount: { $lt: 3 } },
      ],
    },
    {
      $set: {
        status: "processing",
        workerId,
        leaseAcquiredAt: now,
        leaseExpiresAt,
        lastHeartbeatAt: now,
      },
      $inc: { retryCount: 1 },
    },
    { new: true },
  ).lean();

  if (takenOverJob) {
    console.log(
      `[DistributedLock] Worker "${workerId}" TAKEOVER expired/failed slot lock: ${slot} (Previous worker: ${existingJob.workerId})`,
    );
    return {
      acquired: true,
      job: takenOverJob,
      workerId,
      resumed: true,
      tookOverFrom: existingJob.workerId,
    };
  }

  return {
    acquired: false,
    ownedByOther: true,
    message: `Slot ${slot} ownership could not be acquired.`,
  };
}

/**
 * Renews the lease timestamp while long-running AI pipeline tasks are executing.
 */
export async function renewJobLease({
  jobId,
  workerId,
  leaseDurationMs = DEFAULT_LEASE_DURATION_MS,
} = {}) {
  if (!jobId || !workerId) return false;
  await dbConnect();

  const now = new Date();
  const leaseExpiresAt = new Date(now.getTime() + leaseDurationMs);

  const updated = await JobExecution.findOneAndUpdate(
    { _id: jobId, workerId, status: "processing" },
    {
      $set: {
        leaseExpiresAt,
        lastHeartbeatAt: now,
      },
    },
    { new: true },
  );

  if (!updated) {
    console.warn(
      `[DistributedLock] Heartbeat renewal failed for job ${jobId} and worker ${workerId} (Lease stolen or job finished).`,
    );
    return false;
  }

  return true;
}

/**
 * Updates stage progress and merges checkpoint data into MongoDB.
 */
export async function checkpointJobStage({
  jobId,
  workerId,
  stage,
  checkpointData = {},
  leaseDurationMs = DEFAULT_LEASE_DURATION_MS,
} = {}) {
  if (!jobId || !workerId || !stage) return null;
  await dbConnect();

  const now = new Date();
  const leaseExpiresAt = new Date(now.getTime() + leaseDurationMs);

  const updateFields = {
    currentStage: stage,
    leaseExpiresAt,
    lastHeartbeatAt: now,
  };

  Object.entries(checkpointData).forEach(([key, val]) => {
    if (val !== undefined) {
      updateFields[`checkpointData.${key}`] = val;
    }
  });

  const updated = await JobExecution.findOneAndUpdate(
    { _id: jobId, workerId, status: "processing" },
    { $set: updateFields },
    { new: true },
  ).lean();

  if (updated) {
    console.log(`[DistributedLock] Checkpoint saved for job ${jobId} -> Stage: ${stage}`);
  }

  return updated;
}

/**
 * Marks a job slot complete after full blog creation and image handling.
 */
export async function completeJobSlot({ jobId, workerId, blogId } = {}) {
  if (!jobId) return false;
  await dbConnect();

  await JobExecution.updateOne(
    { _id: jobId },
    {
      $set: {
        status: "completed",
        currentStage: "IMAGE_COMPLETED",
        "checkpointData.blogId": blogId ? String(blogId) : null,
        finishedAt: new Date(),
      },
    },
  );

  console.log(`[DistributedLock] Job ${jobId} marked COMPLETED.`);
  return true;
}

/**
 * Marks a job slot failed after unrecoverable errors.
 */
export async function failJobSlot({ jobId, workerId, reason } = {}) {
  if (!jobId) return false;
  await dbConnect();

  await JobExecution.updateOne(
    { _id: jobId },
    {
      $set: {
        status: "failed",
        failureReason: String(reason || "Execution error").slice(0, 500),
      },
    },
  );

  console.log(`[DistributedLock] Job ${jobId} marked FAILED.`);
  return true;
}
