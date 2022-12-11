import puppeteer, { Page } from "puppeteer";

export default class Bot {
  private page;
  private browser;
  scan?: (message: string) => void;
  login: ((message: string) => void) | undefined;
  logout?: (message: string) => void;
  message?: (message: string) => Promise<string>;
  friendship?: (message: string) => void;
  getVideoUrl?: (message: string) => string;
  on(
    event:
      | "scan"
      | "login"
      | "logout"
      | "message"
      | "friendship"
      | "getVideoUrl",
    callback: (message: string) => void
  ) {
    // @ts-ignore
    this[event] = callback;
  }
  private async init() {
    // 启动浏览器
    const browser = await puppeteer.launch({
      headless: true,
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
      const avatarEle = (await page.waitForSelector(
        ".header-avatar-wrap--container",
        { timeout: 5000 }
      )) as any;
      // TODO: 把用户名传给登录回调
      this.login?.("用户名xxx");
    } catch (error) {
      // 显示二维码登录
      await this.handleScan();
    }

    // 遍历评论并回复
    const videoUrl = (await this.getVideoUrl?.("xx")) as string;
    this.eachComments(videoUrl);

    // this.friendship?.(nickname)

    // TODO: 退出登录事件
    //this.logout?.(nickname)
  }
  eachComments = async (videoUrl: string) => {
    const page = this.page;
    // 跳转到视频详情页面
    await page.goto(videoUrl);
    await page.waitForSelector(".reply-item", { timeout: 99999999 });
    // 获取到待回复的评论
    const replyItems = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".reply-item")).map(
        (el, index) => {
          const rootItem: any = el.querySelectorAll(".reply-content")[0];
          const rootComment = rootItem.innerText;
          // 给按钮设置一个id，方便后面需要回复时查找
          const rootReplayBtnId = "btn" + index;
          const rootReplayBtn: any = el.querySelector(
            ".root-reply-container .reply-btn"
          );
          rootReplayBtn.id = rootReplayBtnId;
          const allComments = Array.from(
            el.querySelectorAll(".reply-content")
          ).map((el) => el.textContent);
          // 是否有折叠评论
          const hasMore = el.querySelector(".view-more-default");
          // 回复里包含来自自动回复的表示已经回复过了
          const isReplied =
            allComments.some((comment) =>
              comment?.includes("来自自动回复：")
            ) || hasMore;
          return {
            rootComment,
            isReplied,
            rootReplayBtnId,
          };
        }
      );
    });
    console.log(
      `有${replyItems.filter(({ isReplied }) => !isReplied).length}条待回复评论`
    );
    // 遍历评论并回复
    for (const { rootComment, isReplied, rootReplayBtnId } of replyItems) {
      if (!isReplied) {
        // 点击回复按钮
        (await page.$(`#${rootReplayBtnId}`)).click();
        // 没有回复过的话就获取自动回复
        const result = `来自自动回复：${await this.message?.(rootComment)}`;
        // 输入回复
        (await page.$(".reply-item .reply-box-textarea")).type(result);
        // 等待输入完成
        await new Promise((resolve) => setTimeout(resolve, 2000));
        // 点击发送
        (await page.$(".reply-item .send-text")).click();
      }
    }
    console.log("回复完成，等待5秒后刷新");
    // 回复完成后等待5秒刷新页面再回复
    setTimeout(this.eachComments, 5000, videoUrl);
  };
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
    // 等待扫码成功
    await page.waitForSelector(".header-avatar-wrap--container", {
      timeout: 99999999,
    });
  }
}
