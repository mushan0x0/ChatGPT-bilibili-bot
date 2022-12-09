import { ChatGPTAPI } from 'chatgpt'
import pTimeout from 'p-timeout'
import qrcodeTerminal from 'qrcode-terminal'
import Bot from './bilibili-bot'

const config = {
  AutoReply: true,
  MakeFriend: true,
  ChatGPTSessionToken: ''
}

async function getChatGPTReply(content) {
  const api = new ChatGPTAPI({ sessionToken: config.ChatGPTSessionToken })
  // ensure the API is properly authenticated (optional)
  await api.ensureAuth()
  console.log('content: ', content);
  // send a message and wait for the response
  //TODO: format response to compatible with wechat messages
  const threeMinutesMs = 3 * 60 * 1000
  const response = await pTimeout(
    api.sendMessage(content),
    {
      milliseconds: threeMinutesMs,
      message: 'ChatGPT timed out waiting for response'
    }
  )
  console.log('response: ', response);
  // response is a markdown-formatted string
  return response
}

async function replyMessage(content) {
  try {
    return await getChatGPTReply(content);
  } catch (e) {
    console.error(e);
  }
}

async function onMessage(msg) {
  return replyMessage(msg)
}


function onScan(qrcode) {
  qrcodeTerminal.generate(qrcode); // 在console端显示二维码
  const qrcodeImageUrl = [
    'https://api.qrserver.com/v1/create-qr-code/?data=',
    encodeURIComponent(qrcode),
  ].join('');

  console.log(qrcodeImageUrl);
}

async function onLogin(user) {
  console.log(`${user} has logged in`);
  const date = new Date()
  console.log(`Current time:${date}`);
  if (config.AutoReply) {
    console.log(`Automatic robot chat mode has been activated`);
  }
}

function onLogout(user) {
  console.log(`${user} has logged out`);
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

bot.on('scan', onScan);
bot.on('login', onLogin);
bot.on('logout', onLogout);
bot.on('message', onMessage)
if (config.MakeFriend) {
  // bot.on('friendship', onFriendShip);
}


bot
  .start()
  .then(() => console.log('Start to log in wechat...'))
  .catch((e) => console.error(e));


