const puppeteer = require('puppeteer');

(async () => {
    const pathToExtension = require('path').join(__dirname, 'chrome-mac/Chromium.app/Contents/MacOS/Chromium');
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: pathToExtension
    });
    const page = await browser.newPage();
    await page.goto('https://www.baidu.com');
    await page.setViewport({width: 1000, height: 500});
    await page.screenshot({path: 'example.png'});
    await browser.close();
})();