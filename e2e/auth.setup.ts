import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Perform authentication steps
  // Start from the index page with the e2eToken query parameter
  // That will automatically log in the user
  await page.goto(`/?email=e2e@matomeishi.com&password=${process.env.E2E_FIREBASE_USER_PASSWORD}`);

  // Wait until the page redirects to the cards page and stores the authentication data in the browser
  await page.waitForURL('/cards');

  // Copy the data in indexedDB to the local storage
  await page.evaluate(() => {
    // Open the IndexedDB database
    const indexedDB = window.indexedDB;
    const request = indexedDB.open('firebaseLocalStorageDb');

    request.onsuccess = function (event: any) {
      const db = event.target.result;

      // Open a transaction to access the firebaseLocalStorage object store
      const transaction = db.transaction(['firebaseLocalStorage'], 'readonly');
      const objectStore = transaction.objectStore('firebaseLocalStorage');

      // Get all keys and values from the object store
      const getAllKeysRequest = objectStore.getAllKeys();
      const getAllValuesRequest = objectStore.getAll();

      getAllKeysRequest.onsuccess = function (event: any) {
        const keys = event.target.result;

        getAllValuesRequest.onsuccess = function (event: any) {
          const values = event.target.result;

          // Copy keys and values to localStorage
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = values[i];
            localStorage.setItem(key, JSON.stringify(value));
          }
        }
      }
    }

    request.onerror = function (event: any) {
      console.error('Error opening IndexedDB database:', event.target.error);
    }
  });

  await page.context().storageState({ path: authFile });
});
