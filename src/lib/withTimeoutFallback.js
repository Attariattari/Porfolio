/**
 * Resolves asynchronous content within a fixed response budget.
 *
 * Public pages use this to preserve crawlability when an optional database,
 * cache, or third-party service is temporarily slow. The original operation
 * remains safely handled, while the page renders its existing fallback data.
 */
export async function withTimeoutFallback(task, fallback, timeoutMs = 3000) {
  const fallbackValue = () =>
    typeof fallback === "function" ? fallback() : fallback;

  let timer;
  const guardedTask = Promise.resolve(task).catch(() => fallbackValue());
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve(fallbackValue()), timeoutMs);
  });

  try {
    return await Promise.race([guardedTask, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
