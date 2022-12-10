import puppeteer from 'puppeteer';
import comment from 'comment';

export default class Bot {
    private async init() {
        // 启动浏览器
        const browser = await puppeteer.launch();

        // 打开一个新页面
        const page = await browser.newPage();

        // 访问页面
        await page.goto('https://www.bilibili.com/');

        // 点击登录按钮
        (await page.waitForSelector('.go-login-btn', {timeout: 99999999}))?.click();

        // 等待页面中出现登录二维码
        await page.waitForSelector('[title^="https://passport.bilibili.com/h5-app/passport/login/scan"]', {timeout: 99999999});
        const qr = await page.evaluate(() => {
            // 在页面中查找title属性以https://passport.bilibili.com/h5-app/passport/login/scan开头的标签
            // @ts-ignore
            const element = document.querySelector('[title^="https://passport.bilibili.com/h5-app/passport/login/scan"]');

            return element.getAttribute('title');
        });

        console.log('qr地址',qr)
        // 登录二维码链接返回给scan回调
        // @ts-ignore
        this.scan?.(qr);

        // 等待页面中出现了`.nickname-item`标签表示登录成功
        (await page.waitForSelector('.nickname-item', {timeout: 99999999}));
        const nickname = await page.evaluate(() => {
            // @ts-ignore
            const element = document.querySelector('.nickname-item');

            return element.innerText;
        });

        // 把用户名传给登录回调
        // @ts-ignore
        this.login?.(nickname)

        Comment comment = new Comment();
        
        // TODO: 自动获取到新的评论传给message回调，获得回复，并且自动回复
        // const reply = this.message?.(nickname)

        // this.friendship?.(nickname)

        // TODO: 退出登录事件
        //this.logout?.(nickname)
    }
    scan: ((message: string) => void) | undefined;
    login: ((message: string) => void) | undefined;
    logout: ((message: string) => void) | undefined;
    message: ((message: string) => Promise<string>) | undefined;
    friendship: ((message: string) => void) | undefined;
    on(
        event: 'scan' | 'login'| 'logout' | 'message' | 'friendship',
        callback: (message: string) => void
    ) {
        // @ts-ignore
        this[event] = callback;
    }
    async start() {
        await this.init();
    }
}


