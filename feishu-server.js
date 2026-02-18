require('dotenv').config();

const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const app = express();

const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;
const FEISHU_VERIFICATION_TOKEN = process.env.FEISHU_VERIFICATION_TOKEN;

let accessToken = null;
let tokenExpireTime = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpireTime) {
    return accessToken;
  }
  try {
    const response = await axios.post('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
      app_id: FEISHU_APP_ID,
      app_secret: FEISHU_APP_SECRET
    });
    if (response.data.code === 0) {
      accessToken = response.data.app_access_token;
      tokenExpireTime = Date.now() + (response.data.expire - 300) * 1000;
      return accessToken;
    }
  } catch (error) {
    console.error('获取token失败:', error.message);
  }
  return null;
}

async function replyMessage(messageId, text) {
  try {
    const token = await getAccessToken();
    if (!token) return;
    await axios.post('https://open.feishu.cn/open-apis/message/v4/reply', {
      message_id: messageId,
      msg_type: 'text',
      content: JSON.stringify({ text })
    }, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('回复消息失败:', error.message);
  }
}

app.use(express.json());

app.post('/webhook/feishu', async (req, res) => {
  try {
    const { type, challenge, encrypt } = req.body;

    if (type === 'url_verification') {
      return res.json({ challenge });
    }

    let event = req.body.event;
    if (encrypt) {
      return res.json({ code: 0, msg: 'success' });
    }

    if (event?.message_type === 'text') {
      const content = JSON.parse(event.content);
      const text = content.text?.trim() || '';
      
      let reply = '收到消息';
      if (text === 'help') {
        reply = '可用命令: help, hello, time, status';
      } else if (text === 'hello') {
        reply = '你好！';
      } else if (text === 'time') {
        reply = new Date().toLocaleString('zh-CN');
      } else if (text === 'status') {
        reply = `状态: 在线\n运行时间: ${process.uptime().toFixed(0)}秒`;
      }
      
      await replyMessage(event.message_id, reply);
    }

    res.json({ code: 0, msg: 'success' });
  } catch (error) {
    console.error('处理错误:', error);
    res.status(500).json({ code: 500, msg: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('OK');
});

app.get('/health', (req, res) => {
  res.send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务启动: ${PORT}`);
});
