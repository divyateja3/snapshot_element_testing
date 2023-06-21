import { Page, test, expect, devices } from '@playwright/test';

async function isInViewport(page: Page, locator: string, viewport: { width: number; height: number }): Promise<boolean> {
    const element = page.locator(locator);
    const boundingBox = await element.boundingBox();

    // Element not found, or not visible on the page
    if (!boundingBox || !viewport) {
        return false;
    }

    // Check if element is within the viewport
    return (
        boundingBox.x >= 0 &&
        boundingBox.y >= 0 &&
        boundingBox.x + boundingBox.width <= viewport.width &&
        boundingBox.y + boundingBox.height <= viewport.height
    );
}

async function replaceElementsWithBlank(page, selectors) {
    for (const selector of selectors) {
        await page.evaluate((sel: any) => {
            const element = document.querySelector(sel);
            if (element) {
                const blankDiv = document.createElement('div');
                blankDiv.style.width = `${element.offsetWidth}px`;
                blankDiv.style.height = `${element.offsetHeight}px`;
                blankDiv.style.backgroundColor = 'grey';

                element.parentNode.replaceChild(blankDiv, element);
            }
        }, selector);
    }
}

test(`snapshot test on mobile`, async ({ page }) => {
    const device = devices['iPhone 12 Pro']
    await page.goto('https://radientanalytics.com');
    await page.setViewportSize(device.viewport);
    await page.waitForTimeout(1000);

    const skipElements = [
        // 'body > div.MuiContainer-root.MuiContainer-disableGutters.rad-styles-8d97to > div.MuiContainer-root.MuiContainer-disableGutters.rad-styles-11x3sax > div > div.MuiGrid2-root.MuiGrid2-container.MuiGrid2-direction-xs-row.rad-styles-yaas4b > div:nth-child(1) > div',
        // 'body > div.MuiContainer-root.MuiContainer-disableGutters.rad-styles-8d97to > div.MuiContainer-root.MuiContainer-disableGutters.rad-styles-11x3sax > div > div.MuiGrid2-root.MuiGrid2-container.MuiGrid2-direction-xs-row.rad-styles-yaas4b > div:nth-child(2) > div',
        // 'body > div.MuiContainer-root.MuiContainer-disableGutters.rad-styles-8d97to > div.MuiContainer-root.MuiContainer-disableGutters.rad-styles-11x3sax > div > div.MuiGrid2-root.MuiGrid2-container.MuiGrid2-direction-xs-row.rad-styles-yaas4b > div:nth-child(3) > div',
        'body > div.MuiContainer-root.MuiContainer-disableGutters.rad-styles-8d97to > div.MuiContainer-root.MuiContainer-disableGutters.rad-styles-11x3sax > div > div.MuiGrid2-root.MuiGrid2-container.MuiGrid2-direction-xs-row.rad-styles-yaas4b > div:nth-child(1) > div > div.MuiCardContent-root.rad-styles-1qw96cp',
        'body > div.MuiContainer-root.MuiContainer-disableGutters.rad-styles-8d97to > div.MuiContainer-root.MuiContainer-disableGutters.rad-styles-11x3sax > div > div.MuiGrid2-root.MuiGrid2-container.MuiGrid2-direction-xs-row.rad-styles-yaas4b > div:nth-child(2) > div > div.MuiCardContent-root.rad-styles-1qw96cp',
        'body > div.MuiContainer-root.MuiContainer-disableGutters.rad-styles-8d97to > div.MuiContainer-root.MuiContainer-disableGutters.rad-styles-11x3sax > div > div.MuiGrid2-root.MuiGrid2-container.MuiGrid2-direction-xs-row.rad-styles-yaas4b > div:nth-child(3) > div > div.MuiCardContent-root.rad-styles-1qw96cp'
    ];

    // Save snapshots of individual elements
    for (const [index, selector] of skipElements.entries()) {
        const element = await page.locator(selector);
        // await element.screenshot({ path: `elements/${device.userAgent}/element_${index}.png`});
    }

    // Replace elements with blank divs
    await replaceElementsWithBlank(page, skipElements);
    await page.evaluate(() => {
        window.scrollTo(0, 0);
    });
    const footerSelector = 'a[href="/sitemap_form_adv_sec.xml"]';
    let footerLocated = false;
    let footerViewCount = 0;
    let sectionIndex = 0;

    do {
        // let filename = `landing/${device.userAgent}/landing_${device.userAgent}_${sectionIndex}.png`;
        // await page.screenshot({ path: filename });

        let filename = `match_${device.userAgent}_${sectionIndex}.png`
        expect(await page.screenshot()).toMatchSnapshot(filename);

        // Scroll to next page block
        await page.evaluate(() => {
            window.scrollTo(0, window.scrollY + window.innerHeight);
        });
        await page.waitForTimeout(500);

        // Check if reached footer element
        const footerElementVisible = await isInViewport(page, footerSelector, device.viewport);
        if (footerElementVisible) {
            footerViewCount++;
        }
        if (footerViewCount > 1) {
            footerLocated = true;
        }

        // Increment the section count
        sectionIndex++;
    } while (!footerLocated);
});

