import { ChatGPTAPI } from "chatgpt";
import pTimeout from "p-timeout";
import qrcodeTerminal from "qrcode-terminal";
import Bot from "./bilibili-bot";
import fs from "fs";
import readline from "readline";

const config = {
  AutoReply: true,
  MakeFriend: true,
  ChatGPTSessionToken: "",
};

async function getChatGPTReply(content) {
  const api = new ChatGPTAPI({ sessionToken: config.ChatGPTSessionToken });
  // ensure the API is properly authenticated (optional)
  await api.ensureAuth();
  // send a message and wait for the response
  //TODO: format response to compatible with wechat messages
  const threeMinutesMs = 10 * 60 * 1000;
  const response = await pTimeout(api.sendMessage(content), {
    milliseconds: threeMinutesMs,
    message: "ChatGPT timed out waiting for response",
  });
  console.log("response: ", response);
  // response is a markdown-formatted string
  return response;
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
  if (config.AutoReply) {
    console.log(`Automatic robot chat mode has been activated`);
  }
}

function onLogout(user) {
  console.log(`${user} has logged out`);
}

async function onGetVideoUrl(url) {
  let videoUrl = await getVideoUrl();
  return videoUrl;
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
if (config.MakeFriend) {
  // bot.on('friendship', onFriendShip);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 定义一个函数用于提示用户输入登录 token
function promptForToken() {
  return new Promise((resolve, reject) => {
    rl.question("Please enter your ChatGPT session token: ", (token) => {
      rl.close();
      resolve(token);
    });
  });
}

// 定义一个函数用于提示用户输入视频地址
function promptForVideoUrl() {
  return new Promise((resolve, reject) => {
    rl.question("Please enter your bilibili video url: ", (videoUrl) => {
      rl.close();
      resolve(videoUrl);
    });
  });
}

// 定义一个函数用于尝试从文件中读取登录 token
function readTokenFromFile() {
  try {
    return fs.readFileSync("token.txt", "utf8");
  } catch (err) {
    return null;
  }
}

// 定义一个函数用于尝试从文件中读取登录 token，如果读取失败就提示用户输入
async function getToken() {
  let token = readTokenFromFile();
  if (!token) {
    token = (await promptForToken()) as string;
    fs.writeFileSync("token.txt", token);
  }
  return token as string;
}

// 定义一个函数用于尝试从文件(TODO：读取视频列表)中读取视频地址，如果读取失败就提示用户输入
async function getVideoUrl() {
  let videoUrl = (await promptForVideoUrl()) as string;
  return videoUrl as string;
}

// 现在您可以调用 getToken 函数来获取登录 token，然后使用它登录您的应用
getToken().then((token) => {
  config.ChatGPTSessionToken = token;
  bot
    .start()
    .then(() => console.log("Start to log in bilibili..."))
    .catch((e) => console.error(e));
});
