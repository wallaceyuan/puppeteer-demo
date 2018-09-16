/**
 * Created by yuan on 2018/9/12.
 */
const puppeteer = require('puppeteer');
var conf = require('./../config/config');
var pool = conf.pool;
var save = require('./save')
var login = require('./login')

;(async() => {
    const pathToExtension = require('path').join(__dirname, '../chrome-mac/Chromium.app/Contents/MacOS/Chromium');
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: pathToExtension
    });
    const page = await browser.newPage();

    await page.setViewport({width: 1280, height: 800});

    await login(page)

    await page.goto('https://weibo.com/rmrb');
    await page.waitForNavigation();

    await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'})

    const user = await getWeibo(page)

    page.on('response', async(res)=> {
        const url = res.url()
        if (url.indexOf('small') > -1) {
            let text = await res.text()
            var mid = getQueryVariable(res.url(), 'mid');
            var delHtml = delHtmlTag(JSON.parse(text).data.html)
            var matchReg = /\：.*?(?= )/gi;
            var matchRes = delHtml.match(matchReg)
            if (matchRes && matchRes.length) {
                let comment = []
                matchRes.map((v)=> {
                    comment.push({mid, content: v.split('：')[1]})
                })
                pool.getConnection(function (err, connection) {
                    save.comment({"connection": connection, "res": comment}, function () {
                        console.log('insert success')
                    })
                })
            }
        }
    })

    pool.getConnection(function (err, connection) {
        save.content({"connection": connection, "res": user}, function () {
            console.log('insert success')
        })
    })
})()

async function getWeibo(page) {
    const LIST_SELECTOR = 'div[action-type=feed_list_item]'
    return await page.evaluate((infoDiv)=> {
        return Array.prototype.slice.apply(document.querySelectorAll(infoDiv))
            .map($userListItem => {
                var weiboDiv = $($userListItem)
                var webUrl = 'http://weibo.com'
                var weiboInfo = {
                    "tbinfo": weiboDiv.attr("tbinfo"),
                    "mid": weiboDiv.attr("mid"),
                    "isforward": weiboDiv.attr("isforward"),
                    "minfo": weiboDiv.attr("minfo"),
                    "omid": weiboDiv.attr("omid"),
                    "text": weiboDiv.find(".WB_detail>.WB_text").text().trim(),
                    'link': webUrl.concat(weiboDiv.find(".WB_detail>.WB_from a").eq(0).attr("href")),
                    "sendAt": weiboDiv.find(".WB_detail>.WB_from a").eq(0).attr("date")
                };

                if (weiboInfo.isforward) {
                    var forward = weiboDiv.find("div[node-type=feed_list_forwardContent]");

                    if (forward.length > 0) {
                        var forwardUser = forward.find("a[node-type=feed_list_originNick]");

                        var userCard = forwardUser.attr("usercard");

                        weiboInfo.forward = {
                            name: forwardUser.attr("nick-name"),
                            id: userCard ? userCard.split("=")[1] : "error",
                            text: forward.find(".WB_text").text().trim(),
                            "sendAt": weiboDiv.find(".WB_detail>.WB_from a").eq(0).attr("date")
                        };
                    }
                }

                $('.WB_handle span[node-type=comment_btn_text]').each(async(i, v)=> {
                    $(v).trigger('click')
                })
                return weiboInfo
            })
    }, LIST_SELECTOR)
}

function delHtmlTag(str) {
    return str.replace(/<[^>]+>/g, "");//去掉所有的html标记
}
function getQueryVariable(url, variable) {
    var vars = url.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}