# cx330o VoIP — 实时沟通模块

视频会议 + AI 语音 Agent，覆盖销售沟通全场景。

## 组件

| 组件 | 来源 | 说明 |
|------|------|------|
| MiroTalk SFU | `mirotalk/` | WebRTC 视频会议，支持 8K、屏幕共享、录制 |
| Bolna | `bolna/` | AI 语音 Agent，自动外呼 + 智能对话 |

## 启动

```bash
docker compose --profile voip up -d
```

## 端口

- `:87` → MiroTalk 视频会议
- `:5001` → Bolna AI 语音 Agent API
