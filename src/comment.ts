import {Page} from "puppeteer";

export default class Comment {
  public async readAndReplyComment(page: Page, videoUrl: string) {
    // 访问视频页面
    await page.goto(videoUrl);

    // 等待出现评论区
    await page.waitForSelector(".reply-content", { timeout: 99999999 });

    const comments = await page.evaluate(() => {
      // @ts-ignore
      const element = document.querySelector(".reply-content");

      return element;
    });

    // 每条评论的class reply-item

    // 评论class root-reply-container

    // 评论内容class reply-content

    // 评论回复按钮 reply-btn

    // 如何判断是pu发的评论, 评论中用户信息的class user-info, up主标志class up-icon

    // 如何判断是回复我的, class: jump-link user, 中带有文本 @up主名称

    // 点击回复按钮后，输入框class reply-box-textarea

    // 子评论列表class sub-reply-list

    // 子评论calss sub-reply-content

    // 子评论内容calss sub-reply-content

    // 子评论回复按钮 sub-reply-btn
  }
}
