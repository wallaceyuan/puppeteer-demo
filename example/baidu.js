/**
 * Created by yuanyuan on 2018/9/1.
 */
//promise + async + await

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

;(async()=> {
    const pathToExtension = require('path').join(__dirname, '../chrome-mac/Chromium.app/Contents/MacOS/Chromium');
    let browser = await puppeteer.launch({
        headless: false,
        executablePath: pathToExtension
    })

    let page = await browser.newPage()
    await page.goto('http://image.baidu.com/')
    await page.type('input[name=word]', '名侦探柯南');
    await page.click('.s_search');


    let downloadPath = path.resolve(__dirname, '../download')

    let count = 0
    let MIN_SIZE = 5 * 1024
    page.on('response', async(res)=> {
        let header = res.headers()
        let extName = header['content-type'].split('/')[1]
        let type = header['content-type'].split('/')[0]
        if (type == 'image' && header['content-length'] > MIN_SIZE) {
            let buffer = await res.buffer()
            fs.writeFile(`${downloadPath}/${count++}.${extName}`, buffer, ()=> {
                console.log(`${downloadPath}/${count++}.${extName}:ok`)
            })
        }
    })

    await page.waitForNavigation();

    await page.evaluate(()=> {
        return new Promise((resolve, reject)=> {
            let pos = 0
            let i = 0
            let timer = setInterval(()=> {
                window.scrollBy(0, 100)
                let scrollTop = document.documentElement.scrollTop
                if (scrollTop == pos) {
                    if (i > 5) {
                        clearInterval(timer)
                        resolve()
                    } else {
                        i++
                    }
                } else {
                    pos = scrollTop
                    i = 0
                }
            }, 500)
        })
    })

})();