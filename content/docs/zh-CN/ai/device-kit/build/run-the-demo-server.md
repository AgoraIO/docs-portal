---
title: 运行 Demo Server
description: 配置并启动 Convo AI Device Kit 开发流程所需的服务端示例。
---

这个服务端示例仅用于演示和测试，不适合直接用于生产环境。正式上线时，请按你的安全和扩展性要求实现自己的服务端。

## 安装 Python 依赖

```shell
pip install requests flask pyjwt
```

## 配置服务端参数

更新 `/server/aiot_server_demo_example/config.json` 中的项目凭据和服务配置。

```json
{
  "app_id": "YOUR_AGORA_APP_ID",
  "app_certificate": "YOUR_AGORA_APP_CERTIFICATE",
  "customer_key": "YOUR_CUSTOMER_KEY",
  "customer_secret": "YOUR_CUSTOMER_SECRET",
  "asr": {
    "language": "en-US"
  },
  "parameters": {
    "output_audio_codec": "G722"
  },
  "tts": {
    "vendor": "YOUR_TTS_VENDOR",
    "params": {}
  },
  "idle_timeout": 30,
  "llm": {
    "url": "YOUR_LLM_API_URL",
    "params": {
      "model": "YOUR_LLM_MODEL"
    },
    "api_key": "YOUR_LLM_API_KEY",
    "system_messages": [
      {
        "role": "system",
        "content": "You are a helpful chatbot."
      }
    ],
    "max_history": 10,
    "greeting_message": "Hello, this is your AI assistant. How can I help you?",
    "failure_message": "Sorry, I am temporarily unable to answer your question."
  }
}
```

## 启动服务

```shell
cd server/aiot_server_demo_example
python3 main.py
```

默认监听地址为 `http://localhost:5001`。

## 相关页面

- [Demo Server API](demo-server-apis.md)
- [构建并烧录固件](build-and-flash-firmware.md)
