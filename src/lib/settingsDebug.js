/**
 * Settings Debug Helper
 * Run this in browser console to test settings API
 */

window.testSettings = {
  // Test GET settings
  async get() {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      console.log("✅ GET /api/settings:", data);
      return data;
    } catch (error) {
      console.error("❌ GET error:", error);
    }
  },

  // Test PATCH settings
  async update(updates = {}) {
    try {
      const defaultData = {
        siteTitle: "Muhyo Tech Updated",
        siteAccent: "Tech",
        adminName: "Test Admin",
        email: "test@example.com",
        location: "Lahore, Pakistan",
        seo: {
          title: "Test Title",
          description: "Test Description"
        }
      };

      const data = { ...defaultData, ...updates };
      console.log("📤 Sending:", data);

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      console.log("✅ PATCH /api/settings Response:", result);
      return result;
    } catch (error) {
      console.error("❌ PATCH error:", error);
    }
  },

  // Check store
  checkStore() {
    try {
      const { useAdminStore } = require("@/lib/store/adminStore");
      const settings = useAdminStore.getState().settings;
      console.log("📦 Store Settings:", settings);
      return settings;
    } catch (error) {
      console.warn("Store not available in console");
    }
  },

  // Run all tests
  async runAll() {
    console.log("🧪 Starting Settings Tests...\n");
    await this.get();
    await new Promise(r => setTimeout(r, 1000));
    await this.update({ siteTitle: "Test: " + new Date().toLocaleTimeString() });
    this.checkStore();
    console.log("\n✅ Tests completed!");
  }
};

console.log("🔧 Settings Debug Loaded!");
console.log("📝 Usage:");
console.log("  testSettings.get() - Fetch current settings");
console.log("  testSettings.update({ siteTitle: 'New Title' }) - Update settings");
console.log("  testSettings.runAll() - Run all tests");
