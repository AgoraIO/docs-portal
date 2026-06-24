---
title: Run the demo server
description: Configure and run the server used by the Convo AI Device Kit development workflow.
---
This server-side example is provided solely for demonstration and testing purposes and must not be used in a production environment. For production use, implement a dedicated server-side service that meets your security and scalability requirements.

## Install Python dependencies

Install the required Python packages:

```shell
pip install requests flask pyjwt
```

## Configure server settings

The `/server/aiot_server_demo_example/config.json` file contains the server configuration parameters. Update this file with your project credentials and service settings.

For detailed parameter descriptions, see [Start a conversational AI agent](/en/api-reference/api-ref/conversational-ai/join).

**Configuration file structure:**

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

## Run the server

Run the server from the `/server/aiot_server_demo_example` directory:

```shell
cd server/aiot_server_demo_example
python3 main.py
```

The server runs on port `5001` by default at `http://localhost:5001`. To use a different port, modify the port configuration in the code.

## Related pages

- [Demo server APIs](demo-server-apis)
- [Build and flash firmware](build-and-flash-firmware)
