const { test, expect } = require("@playwright/test");

const publicRoutes = [
  "/",
  "/about",
  "/services",
  "/projects",
  "/blog",
  "/contact",
];

test.describe("Production public-page safety", () => {
  for (const route of publicRoutes) {
    test(`${route} renders without a server error`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });

      expect(response, `No document response received for ${route}`).not.toBeNull();
      expect(response.status(), `${route} returned an error status`).toBeLessThan(400);
      await expect(page.locator("body")).not.toBeEmpty();
    });
  }

  for (const viewport of [
    { name: "mobile", width: 412, height: 823 },
    { name: "desktop", width: 1440, height: 900 },
  ]) {
    test(`homepage has no hydration errors on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const errors = [];

      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });

      await page.goto("/", { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      const hydrationErrors = errors.filter((message) =>
        /hydration|minified react error #418/i.test(message),
      );
      expect(hydrationErrors).toEqual([]);
    });
  }

  test("footer client islands preserve newsletter and navigation behavior", async ({ page }) => {
    await page.route("**/api/subscribe", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Subscribed" }),
      });
    });

    await page.goto("/", { waitUntil: "networkidle" });
    const emailInput = page.getByLabel("Email address for project updates");
    await emailInput.fill("performance-test@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();
    await expect(emailInput).toHaveAttribute("placeholder", "Subscribed successfully");

    await page.getByRole("button", { name: "Back to top" }).scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Back to top" }).click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);

    await page.goto("/privacy", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
