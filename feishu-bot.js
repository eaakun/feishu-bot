const axios = require('axios');
const config = require('./feishu-bot-config');

class FeishuBot {
  constructor() {
    this.baseUrl = config.baseUrl;
    this.appId = config.appId;
    this.appSecret = config.appSecret;
    this.accessToken = null;
    this.tokenExpireTime = 0;
  }

  // 获取飞书访问令牌
  async getAccessToken() {
    // 如果令牌还有效，直接返回
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/auth/v3/app_access_token/internal`, {
        app_id: this.appId,
        app_secret: this.appSecret
      });

      if (response.data.code === 0) {
        this.accessToken = response.data.app_access_token;
        // 令牌提前 5 分钟过期
        this.tokenExpireTime = Date.now() + (response.data.expire - 300) * 1000;
        return this.accessToken;
      } else {
        throw new Error(`获取访问令牌失败: ${response.data.msg}`);
      }
    } catch (error) {
      console.error('获取访问令牌错误:', error.message);
      throw error;
    }
  }

  // 发送文本消息到群聊
  async sendTextMessage(chatId, text) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.post(
        `${this.baseUrl}/message/v4/send`,
        {
          chat_id: chatId,
          msg_type: 'text',
          content: {
            text: text
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code === 0) {
        console.log('消息发送成功');
        return response.data;
      } else {
        throw new Error(`发送消息失败: ${response.data.msg}`);
      }
    } catch (error) {
      console.error('发送消息错误:', error.message);
      throw error;
    }
  }

  // 发送富文本消息
  async sendRichTextMessage(chatId, title, content) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.post(
        `${this.baseUrl}/message/v4/send`,
        {
          chat_id: chatId,
          msg_type: 'post',
          content: {
            post: {
              zh_cn: {
                title: title,
                content: content
              }
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code === 0) {
        console.log('富文本消息发送成功');
        return response.data;
      } else {
        throw new Error(`发送富文本消息失败: ${response.data.msg}`);
      }
    } catch (error) {
      console.error('发送富文本消息错误:', error.message);
      throw error;
    }
  }

  // 回复用户消息
  async replyMessage(messageId, text) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.post(
        `${this.baseUrl}/message/v4/reply`,
        {
          message_id: messageId,
          msg_type: 'text',
          content: {
            text: text
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code === 0) {
        console.log('回复消息成功');
        return response.data;
      } else {
        throw new Error(`回复消息失败: ${response.data.msg}`);
      }
    } catch (error) {
      console.error('回复消息错误:', error.message);
      throw error;
    }
  }

  // 获取用户OpenID
  async getUserOpenId(code) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.post(
        `${this.baseUrl}/contact/v3/users/me`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code === 0) {
        return response.data.data;
      } else {
        throw new Error(`获取用户信息失败: ${response.data.msg}`);
      }
    } catch (error) {
      console.error('获取用户信息错误:', error.message);
      throw error;
    }
  }
}

module.exports = FeishuBot;
