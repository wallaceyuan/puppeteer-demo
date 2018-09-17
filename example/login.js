/**
 * Created by yuan on 2018/9/12.
 */
const puppeteer = require('puppeteer');
const CREDS = require('./creds');


const login = async (page) => {
    await page.click('.gn_login_list li a[node-type="loginBtn"]');
    await page.waitFor(2000)
    try{
        await page.type('input[name=username]',CREDS.username,{delay:30});
        await page.type('input[name=password]',CREDS.password,{delay:30});
        await page.click('.item_btn a');

        await page.waitForNavigation();

        //页面登录成功后，需要保证redirect 跳转到请求的页面
        await page.click('li[node-type="tab_all"]')

        await page.waitForNavigation();

    }catch (e){
        console.log('error',e)
    }
    //return await page.content();
}

module.exports = login