# 飞书机器人 - OpenCode 部署指南

## 🚀 快速部署

### 1. 准备工作

- 在 [飞书开放平台](https://open.feishu.cn/app) 创建机器人应用
- 获取 App ID 和 App Secret
- 在 [OpenCode](https://opencode.ai) 注册账号

### 2. 部署步骤

#### 方式一：通过 OpenCode Web 界面

1. 登录 [OpenCode](https://opencode.ai)
2. 点击 "Create Project"
3. 选择 "Import from GitHub" 或手动上传代码
4. 在项目设置中添加环境变量：
   - `FEISHU_APP_ID`: 你的飞书应用 ID
   - `FEISHU_APP_SECRET`: 你的飞书应用密钥
   - `PORT`: 3000
5. 点击 "Deploy"

#### 方式二：使用 OpenCode CLI

```bash
# 安装 OpenCode CLI
npm install -g @opencode-ai/cli

# 登录
opencode login

# 部署
opencode deploy
```

### 3. 飞书配置

1. 部署成功后，获得公网 URL（如：`https://your-app.opencode.ai`）
2. 在飞书开放平台 → 事件订阅 → 请求地址配置：
   ```
   https://your-app.opencode.ai/webhook/feishu
   ```
3. 在"权限管理"中申请权限：
   - `im:chat:readonly`
   - `im:message:send_as_bot`
   - `im:message.group_msg`
4. 订阅事件：
   - 接收消息

### 4. 验证部署

访问健康检查端点：
```
https://your-app.opencode.ai/health
```

应返回：
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "uptime": 123
}
```

## 📁 项目结构

```
feishu-bot/
├── feishu-bot.js         # 飞书机器人核心类
├── feishu-server.js      # Express 服务器
├── feishu-bot-config.js  # 配置读取
├── package.json          # 项目依赖
├── opencode.yaml         # OpenCode 部署配置
├── .env.example          # 环境变量示例
└── README.md             # 部署指南
```

## 🛠 可用命令

在飞书中 @机器人或使用以下命令：
- `help` - 显示帮助信息
- `hello` - 打招呼
- `time` - 显示当前时间
- `status` - 查看机器人状态

## 🔧 自定义命令

编辑 `feishu-server.js` 中的 `setupCommands()` 方法添加新命令：

```javascript
setupCommands() {
  this.commands.set('yourcommand', this.handleYourCommand.bind(this));
}

async handleYourCommand(event) {
  await this.bot.replyMessage(event.message_id, '你的回复内容');
}
```

## 📚 环境变量

| 变量名 | 必填 | 说明 |
|--------|------|------|
| FEISHU_APP_ID | ✅ | 飞书应用 ID |
| FEISHU_APP_SECRET | ✅ | 飞书应用密钥 |
| PORT | ❌ | 服务端口，默认 3000 |
| FEISHU_ENCRYPT_KEY | ❌ | 事件加密密钥 |
| FEISHU_VERIFICATION_TOKEN | ❌ | 验证令牌 |

## 🐛 故障排查

1. **Webhook 验证失败**
   - 检查 URL 是否正确配置
   - 确认服务已启动且端口正确

2. **消息发送失败**
   - 检查 App ID 和 App Secret 是否正确
   - 确认已申请必要权限

3. **部署失败**
   - 检查 `package.json` 中的依赖
   - 确认 `start` 脚本配置正确

## 📞 技术支持

- 飞书开放平台文档：https://open.feishu.cn/document
- OpenCode 文档：https://opencode.ai/docs

## 📝 License

MIT