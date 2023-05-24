// import { Page, test, expect, devices } from '@playwright/test';

// test.describe.parallel('full page snapshots', () => {
//     const devicesToTest = [
//         // devices['iPhone 12 Pro'],
//         devices['Desktop Chrome'],
//         // devices['Pixel 5'],
//         // devices['iPad Pro 11'],
//     ];

//     async function isInViewport(page: Page, locator: string, viewport: { width: number; height: number }): Promise<boolean> {
//         const element = page.locator(locator);
//         const boundingBox = await element.boundingBox();

//         // Element not found, or not visible on the page
//         if (!boundingBox || !viewport) {
//         return false;
//         }

//         // Check if element is within the viewport
//         return (
//         boundingBox.x >= 0 &&
//         boundingBox.y >= 0 &&
//         boundingBox.x + boundingBox.width <= viewport.width &&
//         boundingBox.y + boundingBox.height <= viewport.height
//         );
//     }

//     for (const device of devicesToTest) {
//         test(`snapshot test on ${device.userAgent}`, async ({ page }) => {
//         await page.goto('https://radientanalytics.com');
//         // click somewhere outside of the search bar
//         await page.locator('body > div > div.MuiContainer-root.rad-styles-5p4z2l > div > div.MuiContainer-root.MuiContainer-disableGutters.rad-styles-1p0xdo8 > div > h1').click();
//         await page.setViewportSize(device.viewport);
//         await page.waitForTimeout(1000);
//         const footerSelector = 'a[href="/sitemap_form_adv_sec.xml"]';

//         let footerLocated = false;
//         let footerViewCount = 0;
//         let sectionIndex = 0;

//         const skipElements = [
//             'body > div > div.MuiContainer-root.rad-styles-5p4z2l > div > div.MuiContainer-root.MuiContainer-maxWidthXxl.MuiContainer-disableGutters.rad-styles-10pzsq1 > div.MuiStack-root.rad-styles-16p0czp > div.MuiBox-root.rad-styles-kddeoy > div > div',
//             'body > div > div.MuiContainer-root.MuiContainer-disableGutters.rad-styles-11x3sax > div > div.MuiGrid2-root.MuiGrid2-container.MuiGrid2-direction-xs-row.rad-styles-yaas4b > div:nth-child(3) > div',
//             'body > div > div.MuiContainer-root.MuiContainer-disableGutters.rad-styles-11x3sax > div > div.MuiGrid2-root.MuiGrid2-container.MuiGrid2-direction-xs-row.rad-styles-yaas4b > div:nth-child(1) > div',
//             'body > div > div.MuiContainer-root.MuiContainer-disableGutters.rad-styles-11x3sax > div > div.MuiGrid2-root.MuiGrid2-container.MuiGrid2-direction-xs-row.rad-styles-yaas4b > div:nth-child(2) > div'
//         ];

//         const skipElementsCaptured = new Set<string>();

//         do {
//             let isPageDown = true;

//             for (const skipElement of skipElements) {
//             const elementVisible = await isInViewport(page, skipElement, device.viewport);

//             if (elementVisible && !skipElementsCaptured.has(skipElement)) {
//                 const filename = `element_${device.userAgent}_${sectionIndex}.png`;

//                 // Capture screenshot of the element
//                 const elementHandle = await page.locator(skipElement);
//                 const boundingBox = await elementHandle.boundingBox();
//                 if (boundingBox) {
//                     await page.screenshot({ path: filename, clip: boundingBox });
//                     }

//                 skipElementsCaptured.add(skipElement);

//                 isPageDown = false;
//                 break;
//             }
//             }

//             if (isPageDown) {
//             const filename = `landing_${device.userAgent}_${sectionIndex}.png`;

//             // Capture full page screenshot
//             await page.screenshot({ path: filename });

//             // Scroll to next page block
//             await page.evaluate(() => {
//                 window.scrollTo(0, window.scrollY + window.innerHeight);
//             });
//             await page.waitForTimeout(500);
//             }

//             // Check if reached footer element
//             const footerElementVisible = await isInViewport(page, footerSelector, device.viewport);
//             if (footerElementVisible) {
//             footerViewCount++;
//             }
//             if (footerViewCount > 1) {
//             footerLocated = true;
//             }

//             // Increment the section count
//             sectionIndex++;
//         } while (!footerLocated);
//         });
//     }
// });

import { test, expect } from '@playwright/test';
import fs from 'fs';

const devicesToTest = [
  {
    userAgent: 'Desktop Chrome',
    viewport: { width: 1280, height: 800 },
  },
  // Add more devices if needed
];

const skipElements = [
  // Add the selectors of the elements you want to skip
];

type BoundingBoxInfo = {
    element: string;
    bounding_box: { x: number; y: number; width: number; height: number } | null;
};



async function isInViewport(page, selector, viewport) {
  return await page.evaluate(
    ([selector, viewport]) => {
      const element = document.querySelector(selector);
      if (!element) return false;

      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= viewport.height &&
        rect.right <= viewport.width
      );
    },
    [selector, viewport]
  );
}

async function save_bounding_boxes(device, bounding_boxes) {
    const filename = `bounding_boxes_${device.userAgent}.json`;
    const sanitizedBoundingBoxes = bounding_boxes.map((box) => ({
      element: box.element,
      bounding_box: box.bounding_box || {}, // Use empty object if null
    }));
    fs.writeFileSync(filename, JSON.stringify(sanitizedBoundingBoxes));
  }
  

for (const device of devicesToTest) {
  test(`snapshot test on ${device.userAgent}`, async ({ page }) => {
    await page.setViewportSize(device.viewport);

    // Navigate to the landing page
    await page.goto('https://example.com'); // Replace with your landing page URL

    // Capture the full landing page screenshot
    const landingFilename = `landing_${device.userAgent}.png`;
    await page.screenshot({ path: landingFilename, fullPage: true });

    const bounding_boxes: BoundingBoxInfo[] = [];
    const skipElementsCaptured = new Set();

    for (const skipElement of skipElements) {
      const elementVisible = await isInViewport(page, skipElement, device.viewport);

      if (elementVisible && !skipElementsCaptured.has(skipElement)) {
        const filename = `element_${device.userAgent}.png`;

        // Capture screenshot of the element
        const elementHandle = await page.locator(skipElement);
        const boundingBox = await elementHandle.boundingBox();
        await page.screenshot({ path: filename, clip: boundingBox || {}});

        // Save the bounding box information
        bounding_boxes.push({
          element: skipElement,
          bounding_box: boundingBox,
        });

        skipElementsCaptured.add(skipElement);
      }
    }

    // Save the bounding box information to a JSON file
    await save_bounding_boxes(device, bounding_boxes);
  });
}




