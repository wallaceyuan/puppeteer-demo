const puppeteer = require('puppeteer');

(async () => {
    const pathToExtension = require('path').join(__dirname, '../chrome-mac/Chromium.app/Contents/MacOS/Chromium');
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: pathToExtension
    });
    const page = await browser.newPage();
    await page.setViewport({width: 1000, height: 500});
    await page.goto('https://weibo.com/rmrb');
    await page.waitForNavigation();
    await page.screenshot({path: 'rmrb.png'});
    await browser.close();
})();