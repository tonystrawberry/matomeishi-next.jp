import { test, expect } from '@playwright/test';

test('should navigate to the cards page (empty case)', async ({ page }) => {
  // Start from the index page with the e2eToken query parameter
  await page.goto(`/?email=e2e@matomeishi.com&password=ffb33b8d805962d5e58834735533fd2c32c2e0a277e79d92db6bd7c7e26bb6e7e885a94db717dab6a42953a573163a9e2bbe268d84dda6e29cb71efb9df74e42`);

  // Wait for the cards page to load
  await page.waitForURL('/cards');

  // The login page should have redirected to the cards page (check the URL)
  await expect(page).toHaveURL('/cards');

  // The cards page should contain an h1 with "Gallery"
  await expect(page.locator('h1')).toContainText('Gallery');

  // The cards page should show a div with the text "No business cards found"
  expect(page.locator('div:has-text("No business cards found")')).not.toBeNull();

  // The cards page should show a div showing the text "Try changing your search query or filters"
  expect(page.locator('div:has-text("Try changing your search query or filters")')).not.toBeNull();

  // The cards page should contain a button with the text "Add Business Card"
  expect(page.locator('button:has-text("Business Card")')).not.toBeNull();
});
