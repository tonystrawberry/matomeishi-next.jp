import { test, expect } from '@playwright/test';
import { authenticate } from "./utils/authenticate";

test.beforeEach(async ({ page }) => {
  await authenticate(page);
});

test('should navigate to the card creation page', async ({ page }) => {
  // Click on the menu button (containing aria-haspopup="menu") in the header to open the menu
  await page.click('button[aria-haspopup="menu"]');

  // Go to the card creation page by clicking on the div with `role="menuitem"` and the text "Business Card"
  await page.click('div[role="menuitem"]:has-text("Business Card")');

  // Wait for the card creation page to load
  await page.waitForURL('/cards/new');

  // The card creation page should contain an button with the text "Back"
  expect(page.locator('button:has-text("Back")')).not.toBeNull();

  // The card creation page should contain an h1 with "Add a Business Card"
  await expect(page.locator('h1')).toContainText('Add a Business Card');

  // The card creation page should contain a div with "Languages"
  expect(page.locator('div:has-text("Languages")')).not.toBeNull();

  // The card creation page should contain a button with "Modify"
  expect(page.locator('button:has-text("Modify")')).not.toBeNull();

  // The card creation page should contain a div with "Front Image" and "Back Image"
  expect(page.locator('div:has-text("Front Image")')).not.toBeNull();
  expect(page.locator('div:has-text("Back Image")')).not.toBeNull();

  // The card creation should contain two inputs accepting images
  const inputFileFront = await page.$('input[type="file"]');
  expect(inputFileFront).not.toBeNull();

  const inputFileBack = await page.$('input[type="file"]:nth-child(2)');
  expect(inputFileBack).not.toBeNull();

  // The card creation page should contain a button with the text "Add & Analyze"
  expect(page.locator('button:has-text("Add & Analyze")')).not.toBeNull();
});

test('should create a business card', async ({ page }) => {
  test.setTimeout(60 * 1000); // 60 seconds timeout because the API call can take a while

  // Start from the cards page
  await page.goto(`/`);

  // The login page should have redirected to the cards page (check the URL)
  await page.waitForURL('/cards');

  // Click on the menu button (containing aria-haspopup="menu") in the header to open the menu
  await page.click('button[aria-haspopup="menu"]');

  // Go to the card creation page by clicking on the div with `role="menuitem"` and the text "Business Card"
  await page.click('div[role="menuitem"]:has-text("Business Card")');

  // Click on the "Modify" button
  await page.click('button:has-text("Modify")');

  // Click on the divs with the text "French" and "Japanese" to deselect them
  await page.click('div:has-text("French")');
  await page.click('div:has-text("Japanese")');

  // Click on the first input with id="front"
  await page.click('input#front');

  // Upload the front image
  await page.setInputFiles('input#front', 'e2e/assets/business-card-front.jpg');

  // Click on the first input with id="front"
  await page.click('input#back');

  // Upload the back image
  await page.setInputFiles('input#back', 'e2e/assets/business-card-back.jpg');

  // Click on the "Add & Analyze" button
  await page.click('button:has-text("Add & Analyze")');

  // The "Add & Analyze" button should be disabled (class name should contain "disabled")
  await expect(page.locator('button:has-text("Add & Analyze")')).toHaveClass(/disabled/);

  const response = await page.waitForResponse(response =>
    response.url().includes(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/business_cards`) &&
    response.status() === 201 &&
    response.request().method() === "POST"
  );

  const body = await (await response.body()).toString();
  const code = JSON.parse(body).data.attributes.code;

  // Wait for the page to redirect (detect the URL change)
  await page.waitForURL(`/cards/${code}`);

  // The card single page should contain an h1 with "Mori Taiki" (the name of the business card)
  await expect(page.locator('h1')).toContainText('Mori Taiki');
});
