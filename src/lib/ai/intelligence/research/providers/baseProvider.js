/**
 * Base Research Provider Class
 * 
 * Abstract base class for research providers (Search, Documentation, Source).
 * Enforces operation-level timeout boundaries, error isolation, and uniform response shapes.
 */

export class BaseResearchProvider {
  constructor({ name = "base_provider", timeoutMs = 3500 } = {}) {
    this.name = name;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Executes provider action with strict AbortController timeout bounds.
   * Never throws uncaught error; returns safe payload object on failure.
   */
  async executeBounded(actionFn) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const result = await Promise.race([
        actionFn(controller.signal),
        new Promise((_, reject) => {
          controller.signal.addEventListener("abort", () => {
            const err = new Error(`Provider '${this.name}' operation timed out after ${this.timeoutMs}ms.`);
            err.code = "PROVIDER_TIMEOUT";
            reject(err);
          });
        }),
      ]);

      return {
        success: true,
        provider: this.name,
        data: result,
        error: null,
      };
    } catch (error) {
      console.warn(`[ResearchProvider:${this.name}] Operation warning:`, error.message);
      return {
        success: false,
        provider: this.name,
        data: null,
        error: error.message,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Abstract research entrypoint to be overridden by subclasses.
   */
  async conductResearch(request = {}) {
    throw new Error(`conductResearch() must be implemented by subclass ${this.constructor.name}`);
  }
}
