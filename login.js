/**
 * Created by yuan on 2018/9/12.
 */
const puppeteer = require('puppeteer');
const CREDS = require('./creds');

(async () => {
    const pathToExtension = require('path').join(__dirname, 'chrome-mac/Chromium.app/Contents/MacOS/Chromium');
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: pathToExtension
    });
    const page = await browser.newPage();

    await page.setViewport({width: 1280, height: 800});
    await page.goto('https://weibo.com');
    await page.waitForNavigation();

    try{
        //登录
        await page.type('#loginname',CREDS.username);
        await page.type('input[name=password]',CREDS.password);

        await page.click('.login_btn a');

        //页面登录成功后，需要保证redirect 跳转到请求的页面
        await page.waitForNavigation();

    }catch (e){
        console.log('error',e)
    }

    return await page.content();



    //await browser.close();
    //return result;

    /*    await page.click('#Pl_Official_MyProfileFeed__28 > div > div:nth-child(2) > div.WB_feed_detail.clearfix > div.WB_detail > div.WB_from.S_txt2 > a:nth-child(1)')
     const result = await page.evaluate(() => {
     // return something
     })*/
})();
