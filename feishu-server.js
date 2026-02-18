const express = require('express');
const crypto = require('crypto');
const FeishuBot = require('./feishu-bot');
const config = require('./feishu-bot-config');

const app = express();
const bot = new FeishuBot();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 消息处理器
class MessageHandler {
  constructor(bot) {
    this.bot = bot;
    this.commands = new Map();
    this.setupCommands();
  }

  setupCommands() {
    // 注册命令
    this.commands.set('help', this.handleHelp.bind(this));
    this.commands.set('hello', this.handleHello.bind(this));
    this.commands.set('time', this.handleTime.bind(this));
    this.commands.set('status', this.handleStatus.bind(this));
  }

  // 处理消息
  async handleMessage(event) {
    const { message_type, content, chat_id, message_id } = event;

    if (message_type === 'text') {
      const textContent = JSON.parse(content).text.trim();
      const command = textContent.split(' ')[0].toLowerCase();

      // 检查是否是命令
      if (this.commands.has(command)) {
        await this.commands.get(command)(event);
      } else {
        // 默认回复
        await this.bot.replyMessage(message_id, `收到消息：${textContent}\n\n输入 "help" 查看可用命令`);
      }
    }
  }

  // help 命令
  async handleHelp(event) {
    const helpText = `🤖 飞书机器人命令列表：\n\n` +
      `• help - 显示帮助信息\n` +
      `• hello - 打招呼\n` +
      `• time - 显示当前时间\n` +
      `• status - 查看机器人状态\n\n` +
      `💡 提示：直接输入命令即可使用`;

    await this.bot.replyMessage(event.message_id, helpText);
  }

  // hello 命令
  async handleHello(event) {
    const userName = event.sender?.sender_id?.user_id || '用户';
    await this.bot.replyMessage(event.message_id, `你好，${userName}！👋\n很高兴为你服务！`);
  }

  // time 命令
  async handleTime(event) {
    const now = new Date();
    const timeString = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'long'
    });
    await this.bot.replyMessage(event.message_id, `⏰ 当前时间：\n${timeString}`);
  }

  // status 命令
  async handleStatus(event) {
    const status = `🤖 机器人状态：\n\n` +
      `• 状态：在线 ✅\n` +
      `• 运行时间：${process.uptime().toFixed(0)} 秒\n` +
      `• Node版本：${process.version}\n` +
      `• 平台：${process.platform}`;

    await this.bot.replyMessage(event.message_id, status);
  }
}

const messageHandler = new MessageHandler(bot);

// 验证飞书事件签名
function verifySignature(timestamp, nonce, encryptKey, body) {
  if (!encryptKey) return true;
  
  const signString = `${timestamp}\n${nonce}\n${encryptKey}\n${body}`;
  const signature = crypto.createHmac('sha256', encryptKey)
    .update(signString)
    .digest('base64');
  return signature;
}

// 飞书事件回调端点
app.post('/webhook/feishu', async (req, res) => {
  try {
    const { type, challenge, header, event } = req.body;

    // 处理 URL 验证（首次配置时）
    if (type === 'url_verification') {
      return res.json({ challenge });
    }

    // 处理消息事件
    if (event?.message_type === 'text') {
      await messageHandler.handleMessage(event);
    }

    res.json({ code: 0, msg: 'success' });
  } catch (error) {
    console.error('处理飞书事件错误:', error);
    res.status(500).json({ code: 500, msg: error.message });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 发送消息测试端点
app.post('/api/send-message', async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const result = await bot.sendTextMessage(chatId, text);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🤖 飞书机器人服务已启动，端口: ${PORT}`);
  console.log(`📡 Webhook 地址: http://localhost:${PORT}/webhook/feishu`);
  console.log(`💚 健康检查: http://localhost:${PORT}/health`);
});
