---
title: Quickstart
description: Run the R1 workshop flow without installing a mobile app.
---

This guide gets your Convo AI Device Kit R1 talking to an AI agent through the workshop demo server. You run the server on your computer, open the browser-based control page, point the device firmware at the server, and verify the conversation from the device.

## What you will set up

- A local Python demo server for R1
- A browser control page served by the demo server
- Separate HTTPS tunnels for the browser demo and R1 backend
- R1 firmware configured with the backend tunnel URL
- A first voice conversation with the AI agent

## Prerequisites

Before you begin, ensure you have the following:

- Agora Convo AI Device Kit R1
- Python 3.7 or later
- Agora App ID and App Certificate for a project with Conversational AI enabled
- Agora Customer ID and Customer Secret for REST authentication
- LLM and TTS provider credentials used by your agent configuration
- `ngrok` or another HTTPS tunneling tool
- Node.js with Bun or npm
- Agora CLI

For Agora project setup instructions, see [Enable services](../reference/enable-services).

## Get the workshop project

Clone the workshop branch of the Python quickstart project:

```bash
git clone https://github.com/AgoraIO-Conversational-AI/agent-quickstart-python.git
cd agent-quickstart-python
git checkout r1-workshop
```

Install dependencies:

```bash tab="Bun" tabGroup="device-kit-workshop-package-manager"
bun install
```

```bash tab="npm" tabGroup="device-kit-workshop-package-manager"
npm install
```

## Configure the server

Connect the repo to your Agora project:

```bash
agora login
agora project create my-first-voice-agent --feature rtc --feature convoai
agora project use my-first-voice-agent
agora project env write server/.env.local --with-secrets
```

The CLI writes the required Agora project environment to `server/.env.local`.

At minimum, the server needs:

- Agora App ID
- Agora App Certificate
- Agora Customer ID
- Agora Customer Secret
- LLM configuration
- TTS configuration
- ASR language, such as `en-US`

Keep these values on your server only. Do not put provider keys or Agora secrets into firmware or frontend code.

## Start the demo server

Run the workshop server from the repository root:

```bash tab="Bun" tabGroup="device-kit-workshop-package-manager"
bun run dev
```

```bash tab="npm" tabGroup="device-kit-workshop-package-manager"
npm run dev
```

When the server starts, keep the terminal running and check both local endpoints:

```text
http://localhost:3000
http://localhost:3000/api/get_config
```

The first URL opens the web demo. The second URL should return JSON. The local backend runs on port `8000`.

## Expose the server to the device

Use ngrok for two separate jobs:

- Expose the web demo on port `3000` so people can open the browser UI.
- Expose the backend on port `8000` so the R1 device can reach the device protocol.

Authenticate ngrok:

```bash
ngrok config add-authtoken <YOUR_AUTH_TOKEN>
```

In one terminal, expose the web demo:

```bash
ngrok http 3000
```

Copy the HTTPS forwarding URL and use it as `YOUR_FRONTEND_NGROK_URL`.

In another terminal, expose the backend:

```bash
ngrok http 8000
```

Copy this HTTPS forwarding URL and use it as `YOUR_BACKEND_NGROK_URL`.

Before continuing, verify:

```text
YOUR_FRONTEND_NGROK_URL
YOUR_BACKEND_NGROK_URL/get_config
```

The frontend URL should load the same app as `http://localhost:3000`. The backend `/get_config` URL should return JSON.

:::warning
Use `YOUR_BACKEND_NGROK_URL` as the firmware server URL. Do not use `localhost`, `http://localhost:3000`, or `YOUR_FRONTEND_NGROK_URL` for firmware.
:::

:::warning
The demo server is for development and workshop use. Do not expose it as a production service without adding authentication, access control, logging, and operational safeguards.
:::

## Power on the device

1. Plug the battery cable into the connector on the device.
2. Press and hold the **Middle button** until the vibration stops.
3. Release the button. The red LED blinks and the device reports that the network connection failed.

   ![R1 device power-on state](/images/convo-ai-device-kit/power_on.png)

The device is now powered on and ready for firmware setup.

## Configure and build the firmware

Open the BK AIDK repository from the `ai_release/v2.0.1` branch:

- [bekencorp/bk_aidk](https://github.com/bekencorp/bk_aidk/tree/ai_release/v2.0.1)

You can build locally if you already have the BK toolchain, or use GitHub Codespaces for the workshop path.

In the BK AIDK workspace, download and run the workshop setup script. Pass the 2.4 GHz Wi-Fi credentials and `YOUR_BACKEND_NGROK_URL` from the previous step:

```bash
curl -fL -o bk_aidk_codespaces_setup.sh \
  https://raw.githubusercontent.com/AgoraIO-Conversational-AI/agent-quickstart-python/r1-workshop/.github/workshop/bk_aidk_codespaces_setup.sh
chmod +x bk_aidk_codespaces_setup.sh
./bk_aidk_codespaces_setup.sh \
  --ssid "YOUR_WIFI_SSID" \
  --password "YOUR_WIFI_PASSWORD" \
  --server-url "YOUR_BACKEND_NGROK_URL"
```

Do not commit Wi-Fi credentials, generated config, or firmware-specific secrets back to GitHub.

Compile the firmware:

```bash
pip install click future click_option_group cryptography pycryptodome
export PYTHON=/home/codespace/.python/current/bin/python
export PATH=/home/codespace/.python/current/bin:$PATH
export ARMINO_PATH=/workspaces/bk_aidk/bk_avdk/bk_idk
export PYTHON_EXECUTABLE=$PYTHON
unset PYTHONNOUSERSITE
$PYTHON -m pip install --user --force-reinstall "setuptools==80.9.0"
make bk7258 PROJECT=beken_genie
```

When the build finishes, locate the generated `all-app.bin` file under the `build/beken_genie/bk7258` output tree:

```bash
python3 - <<'PY'
from pathlib import Path
for path in Path("build/beken_genie").rglob("all-app.bin"):
    print(path)
PY
```

Flash `all-app.bin` to your R1 device using BKFIL or the web flashing flow. If the flashing tool waits for reset, press the board reset button once and continue.

For the full firmware workflow, see [Build and flash firmware](../build/build-and-flash-firmware).

## Connect the device to Wi-Fi

The workshop setup script writes the Wi-Fi credentials into the firmware configuration. After flashing, restart or wake the device and keep it near the 2.4 GHz network you configured.

If you need to change Wi-Fi without rebuilding firmware, use the optional Android BLE provisioning app from the device kit repository. See [Optional BLE network provisioning](../build/configure-device-network).

The device is ready when the LED changes from the network-setup state to the connected state. For button and LED details, see [Device controls](../build/device-controls).

## Start a conversation

1. Keep the demo server and ngrok tunnel running.
2. Short press the **Middle button** to wake up the device.
3. Wait a few seconds for the device to connect to the server and start the AI agent.
4. Ask a question or make a request, for example:

   - "Tell me about the Agora Convo AI Device Kit."
   - "Tell me about Agora."
   - "Who is Bill Gates?"
   - "What's 15% off a $328 dress?"

5. Watch the browser control page and server logs to confirm device events, agent start, agent stop, and transcript behavior.

## Power off the device

The device enters sleep mode automatically after 3 minutes of inactivity.

To manually disconnect:

- **Sleep mode**: Press and hold the **Middle button** until the red LED turns off and vibration stops.
- **Full shutdown**: Disconnect the battery cable from the device connector.

## Next steps

Now that the workshop flow is running:

- [Run the R1 development baseline](../build/run-the-r1-demo)
- [Run the demo server](../build/run-the-demo-server)
- [Optional BLE network provisioning](../build/configure-device-network)
- [Review demo server APIs](../build/demo-server-apis)
