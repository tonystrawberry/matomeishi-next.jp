import { test, expect } from '@playwright/test';



test('should navigate to the cards page (empty case)', async ({ page }) => {
  // Start from the index page with the e2eToken query parameter
  await page.goto(`/`);

  // Wait for the cards page to load
  await page.waitForURL('/cards');

  // The cards page should contain an h1 with "Gallery"
  await expect(page.locator('h1')).toContainText('Gallery');

  // The cards page should show a div with the text "No business cards found"
  expect(page.locator('div:has-text("No business cards found")')).not.toBeNull();

  // The cards page should show a div showing the text "Try changing your search query or filters"
  expect(page.locator('div:has-text("Try changing your search query or filters")')).not.toBeNull();

  // The cards page should contain a button with the text "Add Business Card"
  expect(page.locator('button:has-text("Business Card")')).not.toBeNull();
});
