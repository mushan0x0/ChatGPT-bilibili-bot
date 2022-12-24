<h1 align="center">ChatGPT-bilibili-bot🤖</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/badge/License-ISC-yellow.svg" />
  </a>
</p>

> ChatGPT-bilibili-bot fork from [ChatGPT-wecaht-bot](https://github.com/AutumnWhj/ChatGPT-wechat-bot/).
>
> ChatGPT bilibili bot is a bilibili assistant based on NodeJS and webchaty. This tool use ChatGPT auto reply your video’s comment.

## How to start?

1. Firstly, you should have an OpenAI account

2. Run this project on local.

```javascript
// install dependencies
npm i

// start:
// dev
npm run dev

//or
// build
npm run build
// run lib
node lib/bundle.esm.js

```

3. you can see your logs, and Enter your ChatGPT email and passsword

   > This needs to be entered when you run it for the first time，then app will save your email and password in `account.txt` file

![image-20221224112825247](https://notes.zijiancode.cn/2022/12/24/image-20221224112825247.png)

4. scan qrcode to login bilibili

   > Similarly, this is only required for the first run

   ![image-20221210230648038](https://notes.zijiancode.cn/2022/12/24/image-20221210230648038.png)

5. Enter your video url, then bot will auto reply comment.

![image-20221224113029818](https://notes.zijiancode.cn/2022/12/24/image-20221224113029818.png)

> then, app will save url in `video.txt` file

6. When the program detects a comment that needs to be replied for the first time, it will call up the browser to log in, which may require you to manually identify through the robot

![image-20221224113425377](https://notes.zijiancode.cn/2022/12/24/image-20221224113425377.png)
