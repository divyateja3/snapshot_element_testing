import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Folder for test artifacts such as screenshots, videos, traces, etc.
    testDir: './tests',
    outputDir: 'test-results',
    use: {
      screenshot: 'only-on-failure',
    },
    expect: {
        toMatchSnapshot: {
            maxDiffPixels: 100,
            threshold:0.2
        },
    },
    updateSnapshots: 'none',
    timeout: 30000,
    // reporter: `html`,
    
    // projects: [
    //     {
    //         name: 'chromium',
    //         use: {
    //         ...devices['Desktop Chrome'],
    //         },
    //     },
    //     {
    //         name: 'Mobile Safari',
    //         use: {
    //         ...devices['iPhone 12 Pro'],
    //         },
    //     },
    //     {
    //         name: 'Tab Safari',
    //         use: {
    //         ...devices['iPad Pro 11'],
    //         },
    //     },
    //     // {
    //     //   name: 'Mobile Chrome',
    //     //   use: { ...devices['Pixel 5'] },
    //     // },
    //     ],
    
});