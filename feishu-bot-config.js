// 飞书机器人配置 - 使用环境变量
require('dotenv').config();

const config = {
  appId: process.env.FEISHU_APP_ID,
  appSecret: process.env.FEISHU_APP_SECRET,
  // 飞书 API 基础地址
  baseUrl: 'https://open.feishu.cn/open-apis',
  // 事件订阅配置（如果需要）
  eventConfig: {
    encryptKey: process.env.FEISHU_ENCRYPT_KEY || '',  // 如果启用了加密，请填写
    verificationToken: process.env.FEISHU_VERIFICATION_TOKEN || ''  // 事件订阅验证令牌
  }
};

// 验证必要的环境变量
if (!config.appId || !config.appSecret) {
  console.error('错误: 请设置 FEISHU_APP_ID 和 FEISHU_APP_SECRET 环境变量');
  process.exit(1);
}

module.exports = config;
