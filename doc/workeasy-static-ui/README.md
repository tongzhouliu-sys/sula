# WorkEasy 静态 UI 研究版

这是一个完全独立的前台静态还原，不连接原网站接口，不包含登录凭据或真实业务数据。

## 访问方式

直接双击 `index.html` 即可浏览。为获得更稳定的路由与资源加载体验，也可以在本目录启动任意静态文件服务器，例如：

```bash
python3 -m http.server 8080
```

然后访问 `http://localhost:8080/`。

## 页面

- `#/login` 登录页
- `#/chat` 聊天
- `#/workspace` 文件
- `#/skills` 技能管理
- `#/tools` 内置工具
- `#/mcp` MCP 工具集
- `#/cron-jobs` 定时任务
- `#/skill-pool` 技能库
- `#/mcp-pool` MCP 广场
- `#/feedback` 反馈建议
- `#/personal-info` 个人信息
- `#/dashboard` 仪表盘
- `#/activity` 活动记录
- `#/channels` IM 机器人
- `#/connectors` 连接器

所有按钮仅产生本地演示交互，不会向任何外部服务发送数据。
