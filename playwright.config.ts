

import { PlaywrightTestConfig, devices } from '@playwright/test'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Reference: https://playwright.dev/docs/test-configuration
const config: PlaywrightTestConfig = {
  // Timeout per test
  timeout: 20 * 1000,
  // Timeout for each assertion
  expect: {
    timeout: 5 * 1000,
  },
  // Test directory
  testDir: path.join(__dirname, 'e2e'),
  // If a test fails, retry it additional 2 times
  retries: 0,
  // Artifacts folder where screenshots, videos, and traces are stored.
  outputDir: 'playwright/test-results/',
  // Run tests in files in parallel
  fullyParallel: true,
  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: 'html',
  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
  webServer: {
    command: 'npm run dev:e2e',
    url: 'http://localhost:3002',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },

  use: {
    // Retry a test if its failing with enabled tracing. This allows you to analyse the DOM, console logs, network traffic etc.
    // More information: https://playwright.dev/docs/trace-viewer
    trace: 'on',

    // All available context options: https://playwright.dev/docs/api/class-browser#browser-new-context
    // contextOptions: {
    //   ignoreHTTPSErrors: true,
    // },
    baseURL: 'http://localhost:3002'
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        bypassCSP: true, // add this to disable cors
        launchOptions: {
          args: ['--disable-web-security'], // add this to disable cors
        }
      },
      dependencies: ['setup'],
    },
    // Test against mobile viewports.
    // {
    //   name: 'Mobile Safari',
    //   use: devices['iPhone 12'],
    // },
  ],
}
export default config
