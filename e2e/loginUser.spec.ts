import { test, expect } from '@playwright/test';

test('should navigate to the login page', async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto('/');

  // The login page should contain an h1 with "Let's store business cards"
  await expect(page.locator('h1')).toContainText("Let's store business cards");

  // The login page should contain an p with "Sign in to start storing business cards."
  await expect(page.locator('p')).toContainText('Sign in to start storing business cards.');

  // The login page should contain an input with the id "email" and the placeholder "matomeishi@gmail.com"
  await expect(page.locator('#email')).toHaveAttribute('placeholder', 'matomeishi@gmail.com');

  // The login page should contain a button with the text "Sign in with Email"
  const emailButton = page.locator('button:has-text("Sign in with Email")').first();
  expect(emailButton).not.toBeNull();


  // The login page should contain a button with the text "Sign in with Google"
  const googleButton = page.locator('button:has-text("Sign in with Google")').first();
  expect(googleButton).not.toBeNull();
});

test('should login with email & password', async ({ page }) => {
  // Start from the index page with the e2eToken query parameter
  await page.goto(`/?email=e2e@matomeishi.com&password=ffb33b8d805962d5e58834735533fd2c32c2e0a277e79d92db6bd7c7e26bb6e7e885a94db717dab6a42953a573163a9e2bbe268d84dda6e29cb71efb9df74e42`);

  // Wait for the cards page to load
  await page.waitForURL('/cards');

  // The login page should have redirected to the cards page (check the URL)
  await expect(page).toHaveURL('/cards');
});
