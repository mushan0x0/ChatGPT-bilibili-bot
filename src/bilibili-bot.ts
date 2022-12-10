import puppeteer, {Page} from "puppeteer";

// 读取并且回复评论
const videoUrl =
    "https://www.bilibili.com/video/BV13P4y117S2/?vd_source=94d46242b5004349ffbc65d6cb74bc57";

export default class Bot {
  private page;
  private browser;
  private async init() {
    // 启动浏览器
    const browser = await puppeteer.launch({
      headless: false,
      userDataDir: "./userData", // 设置用户数据目录，保存登录数据
    });
    this.browser = browser;

    // 打开一个新页面
    const page = await browser.newPage();
    this.page = page;

    // 访问页面
    await page.goto("https://www.bilibili.com/");

    try {
      // 如果有头像元素了代表已经登录了
      const avatarEle = await page.waitForSelector('.header-avatar-wrap--container', { timeout: 5000 }) as any;
      // TODO: 把用户名传给登录回调
      this.login?.('用户名xxx');
    } catch (error) {
      // 显示二维码登录
      await this.handleScan()
    }

    // 跳转到视频详情页面
    await page.goto(videoUrl);

    // 遍历评论并回复
    this.eachComments();

    // TODO: 自动获取到新的评论传给message回调，获得回复，并且自动回复
    // const reply = this.message?.(nickname)

    // this.friendship?.(nickname)

    // TODO: 退出登录事件
    //this.logout?.(nickname)
  }
  async eachComments() {
    const page = this.page;
    await page.waitForSelector(".reply-item", { timeout: 99999999 });
    // 获取到待回复的评论
    const replyItems = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.reply-item'))
        .map(el => {
          const rootItem: any = el.querySelectorAll('.reply-content')[0];
          const rootComment = rootItem.innerText;
          const rootReplayBtn = rootItem.querySelector('.reply-btn');
          const allComments = Array.from(el.querySelectorAll('.reply-content'))
            .map(el => el.textContent)
          // 回复里包含来自自动回复的表示已经回复过了
          const isReplied = allComments.some((comment) => comment?.includes('来自自动回复：'));
          return {
            rootComment,
            isReplied,
            rootReplayBtn,
          }
        });

    });
    // 遍历评论并回复
    for (const {rootComment, isReplied, rootReplayBtn} of replyItems) {
      if (!isReplied) {
        // 没有回复过的话就获取自动回复
        const result = await this.message?.(rootComment);
        console.log('result', result)
      }
    }
  }
  scan: ((message: string) => void) | undefined;
  login: ((message: string) => void) | undefined;
  logout: ((message: string) => void) | undefined;
  message: ((message: string) => Promise<string>) | undefined;
  friendship: ((message: string) => void) | undefined;
  on(
    event: "scan" | "login" | "logout" | "message" | "friendship",
    callback: (message: string) => void
  ) {
    // @ts-ignore
    this[event] = callback;
  }
  async start() {
    await this.init();
  }
  async handleScan() {
    const page = this.page;
    // 点击登录按钮
    (
        await page.waitForSelector(".go-login-btn", { timeout: 99999999 })
    )?.click();

    // 等待页面中出现登录二维码
    await page.waitForSelector(
        '[title^="https://passport.bilibili.com/h5-app/passport/login/scan"]',
        { timeout: 99999999 }
    );
    const qr = await page.evaluate(() => {
      // 在页面中查找title属性以https://passport.bilibili.com/h5-app/passport/login/scan开头的标签
      const element = document.querySelector(
          '[title^="https://passport.bilibili.com/h5-app/passport/login/scan"]'
      ) as any;

      return element.getAttribute("title");
    });

    // 登录二维码链接返回给scan回调
    // @ts-ignore
    this.scan?.(qr);
  }
}
