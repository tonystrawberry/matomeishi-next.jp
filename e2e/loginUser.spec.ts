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
