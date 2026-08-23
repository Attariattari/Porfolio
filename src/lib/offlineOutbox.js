"use client";

import { toast } from "sonner";

const OUTBOX_STORAGE_KEY = "muhyo_offline_outbox_queue";

/**
 * Get all queued offline requests
 */
export function getOfflineOutbox() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OUTBOX_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save a new pending request to the offline queue
 */
export function saveToOfflineOutbox(item) {
  if (typeof window === "undefined") return false;
  try {
    const current = getOfflineOutbox();
    const newItem = {
      id: "outbox_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      timestamp: Date.now(),
      ...item,
    };
    current.push(newItem);
    localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(current));
    return true;
  } catch (err) {
    console.warn("[OfflineOutbox] Failed to save queue item:", err);
    return false;
  }
}

/**
 * Process and send all pending offline outbox items when back online
 */
export async function syncOfflineOutbox() {
  if (typeof window === "undefined" || !navigator.onLine) return;

  const queue = getOfflineOutbox();
  if (!queue || queue.length === 0) return;

  const remaining = [];
  let successCount = 0;

  for (const item of queue) {
    try {
      const response = await fetch(item.endpoint, {
        method: item.method || "POST",
        headers: {
          "Content-Type": "application/json",
          ...(item.headers || {}),
        },
        body: JSON.stringify(item.payload),
      });

      if (response.ok) {
        successCount++;
      } else {
        // Keep in queue if server error (5xx) to retry later
        if (response.status >= 500) {
          remaining.push(item);
        }
      }
    } catch {
      // Network still interrupted; keep for next retry
      remaining.push(item);
    }
  }

  try {
    localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(remaining));
  } catch {}

  if (successCount > 0) {
    toast.success(
      `⚡ Back Online: ${successCount} saved offline message${successCount > 1 ? "s were" : " was"} sent successfully!`,
      { duration: 5000 }
    );
  }
}
