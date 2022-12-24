import { ChatGPTAPIBrowser } from "chatgpt";
import pTimeout from "p-timeout";
import qrcodeTerminal from "qrcode-terminal";
import Bot from "./bilibili-bot";
import fs from "fs";
import readline from "readline";

const config = {
  email: "",
  password: "",
};

async function getChatGPTReply(content) {
  const api = await initSession(config.email, config.password);
  let res = await api.sendMessage(content);
  console.log("response: ", res);
  // response is a markdown-formatted string
  return res.response as string;
}

async function onMessage(msg) {
  console.log("content: ", msg);
  let result;
  try {
    result = await getChatGPTReply(msg);
  } catch (e: any) {
    console.log(e.message);
    console.log("获取超时，重试中...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return onMessage(msg);
  }
  return result;
}

function onScan(qrcode) {
  qrcodeTerminal.generate(qrcode); // 在console端显示二维码
  const qrcodeImageUrl = [
    "https://api.qrserver.com/v1/create-qr-code/?data=",
    encodeURIComponent(qrcode),
  ].join("");

  console.log("Please open bilibili and scan the code to log in.");
}

async function onLogin(user) {
  console.log(`${user} has logged in`);
  const date = new Date();
  console.log(`Current time:${date}`);
}

function onLogout(user) {
  console.log(`${user} has logged out`);
}

async function onGetVideoUrl(url) {
  let videoUrl = await getVideoUrl();
  return videoUrl as string;
}
// async function onFriendShip(friendship) {
//   const frienddShipRe = /chatgpt|chat/
//   if (friendship.type() === 2) {
//     if (frienddShipRe.test(friendship.hello())) {
//       await friendship.accept()
//     }
//   }
// }

const bot = new Bot();

bot.on("scan", onScan);
bot.on("login", onLogin);
bot.on("logout", onLogout);
bot.on("message", onMessage);
bot.on("getVideoUrl", onGetVideoUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 读取文件信息
function readFile(filename: string) {
  try {
    return fs.readFileSync(filename, "utf8");
  } catch (err) {
    return null;
  }
}

// 定义一个函数用于尝试从文件中读取登录 token，如果读取失败就提示用户输入
async function getAccount() {
  let filename = "account.txt";
  // {"email":"123@abc.com","password":"123456"}
  let account = readFile(filename);
  if (!account) {
    let email = (await enterEmail()) as string;
    let password = (await enterPassword()) as string;
    account = JSON.stringify({ email: email, password: password });
    fs.writeFileSync(filename, account);
  }
  return account as string;
}

function enterEmail() {
  return new Promise((resolve) => {
    rl.question("Please enter your ChatGPT email: ", (email) => {
      resolve(email);
    });
  });
}

function enterPassword() {
  return new Promise((resolve) => {
    rl.question("Please enter your ChatGPT password: ", (password) => {
      resolve(password);
    });
  });
}

// 尝试从文件(TODO：读取视频列表)中读取视频地址，如果读取失败就提示用户输入
async function getVideoUrl() {
  let filename = "video.txt";
  let videoUrl = readFile(filename);
  if (!videoUrl) {
    videoUrl = (await enterVideoUrl()) as string;
    fs.writeFileSync(filename, videoUrl);
  }

  return videoUrl as string;
}

// 提示用户输入视频地址
function enterVideoUrl() {
  return new Promise((resolve, reject) => {
    rl.question("Please enter your bilibili video url: ", (videoUrl) => {
      rl.close();
      resolve(videoUrl);
    });
  });
}

let cacheApi: any = null;

async function initSession(email: string, password: string) {
  if (cacheApi) {
    return cacheApi;
  }
  const api = new ChatGPTAPIBrowser({
    email: email,
    password: password,
  });

  await api.initSession();
  cacheApi = api;
  return cacheApi;
}

// 获取登录账号信息，初始化session, 启动应用
getAccount().then((account) => {
  let accountJson = JSON.parse(account);
  config.email = accountJson.email;
  config.password = accountJson.password;
  bot
    .start()
    .then(() => console.log("Start to log in bilibili..."))
    .catch((e) => console.error(e));
});
