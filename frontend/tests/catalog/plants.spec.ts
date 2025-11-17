import { test, expect } from "@playwright/test";

test.describe("Plant catalog journey", () => {
  test("allows toggling between fish and plant filters", async ({ page }) => {
    await page.goto("/products?product_type=plant");

    const plantsToggle = page.getByRole("button", { name: /plants/i });
    const fishToggle = page.getByRole("button", { name: /fish/i });

    await expect(plantsToggle).toBeVisible();
    await expect(plantsToggle).toHaveAttribute("aria-pressed", "true");

    await fishToggle.click();
    await expect(page).toHaveURL(/product_type=fish/);
  });

  test("navigates from plant list to detail page", async ({ page }) => {
    await page.goto("/products?product_type=plant");

    const firstCard = page.locator('[data-testid="catalog-card"]').first();
    await expect(firstCard).toBeVisible();

    await firstCard.getByRole("link", { name: /view details/i }).click();

    await expect(page.locator('[data-testid="product-detail-title"]')).toBeVisible();
  });

  test("shows plant quick-link helper when viewing plant catalog", async ({ page }) => {
    await page.goto("/products?product_type=plant");

    await expect(page.getByText(/new to aquarium plants/i)).toBeVisible();
  });
});

