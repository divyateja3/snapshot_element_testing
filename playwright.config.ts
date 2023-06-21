import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Folder for test artifacts such as screenshots, videos, traces, etc.
    testDir: './tests',
    testMatch: '**/*.test.ts',

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
    workers: 4 ,   

    // reporter: `html`,

  
});