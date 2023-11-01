import { Page } from "@playwright/test";

export const authenticate = async (page: Page) => {
  // Start from the index page with the e2eToken query parameter
  await page.goto(`/`);

  // Get the authentication data from the `playwright/.auth/user.json` file (using readFileSync)
  const auth = JSON.parse(require('fs').readFileSync('playwright/.auth/user.json', 'utf8'));

  // Set the authentication data in the indexedDB of the page to authenticate the user
  await page.evaluate(auth => {
    // Open the IndexedDB database
    const indexedDB = window.indexedDB;
    const request = indexedDB.open('firebaseLocalStorageDb');

    request.onsuccess = function (event: any) {
      const db = event.target.result;

      // Start a transaction to access the object store (firebaseLocalStorage)
      const transaction = db.transaction(['firebaseLocalStorage'], 'readwrite');
      const objectStore = transaction.objectStore('firebaseLocalStorage', { keyPath: 'fbase_key' });

      // Loop through the localStorage data inside the `playwright/.auth/user.json` and add it to the object store
      const localStorage = auth.origins[0].localStorage;

      for (const element of localStorage) {
        const value = element.value;

        objectStore.put(JSON.parse(value));
      }
    }
  }, auth)
}
