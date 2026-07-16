---
title: Run the R1 demo
description: Build a local Python voice agent, expose it with ngrok, compile BK7258 firmware, and flash it to the R1 device.
---

Use this workshop flow when you want to build a voice-first AI companion locally, then connect an R1 device to that agent through the BK7258 firmware workflow.

## What you will build

By the end of this workshop, you will have:

- A local Python-backed Conversational AI quickstart running on your computer
- A browser demo exposed through an ngrok tunnel
- A backend tunnel that the R1 firmware can reach
- BK7258 `beken_genie` firmware compiled with your Wi-Fi and backend URL settings
- The generated firmware flashed to an R1 development board
- A working voice conversation between the R1 hardware and your agent

## Prerequisites

Before you begin, prepare the following:

- Node.js, Bun or npm, Git, and your preferred AI coding tool
- The [Agora CLI](https://www.npmjs.com/package/agoraio-cli)
- An R1 development board based on BK7258
- A 2.4 GHz Wi-Fi network that the R1 device can join
- A USB cable for the `USB TO UART` interface
- A firmware flashing tool, such as BKFIL for desktop or a workshop-provided web flashing flow

## Install Agora Skills and CLI

Install Agora Skills so your AI coding tool has Agora product context for the workshop:

```bash
npx skills add github:AgoraIO/skills
```

Install the Agora CLI:

```bash
curl -fsSL https://dl.agora.io/cli/install.sh | sh
agora --version
```

After installing the skills and CLI, you can ask your AI coding tool to inspect the quickstart, explain request flow, trace `/api/*` routes, or customize the agent greeting.

## Clone and run the voice agent quickstart

Clone the workshop repository and check out the workshop branch:

```bash
git clone https://github.com/AgoraIO-Conversational-AI/agent-quickstart-python.git
cd agent-quickstart-python
git checkout r1-workshop
```

Install dependencies:

```bash tab="Bun" tabGroup="package-manager"
bun install
```

```bash tab="npm" tabGroup="package-manager"
npm install
```

Connect the repository to your Agora project:

```bash
agora login
agora project create my-first-voice-agent --feature rtc --feature convoai
agora project use my-first-voice-agent
agora project env write server/.env.local --with-secrets
```

Start the local quickstart:

```bash tab="Bun" tabGroup="package-manager"
bun run dev
```

```bash tab="npm" tabGroup="package-manager"
npm run dev
```

The quickstart exposes two local services:

| Service | URL |
| --- | --- |
| Web app | `http://localhost:3000` |
| Local backend | `http://localhost:8000` |

Before continuing:

1. Open `http://localhost:3000` and confirm the web app loads.
2. Open `http://localhost:3000/api/get_config` and confirm it returns JSON.
3. Start a conversation session from the web app.
4. Keep this terminal running. You will start ngrok in another terminal.

## Configure ngrok URLs

Use ngrok for two separate tasks:

- Expose the web app on port `3000` so people can open the demo in a browser.
- Expose the backend on port `8000` so the R1 device can reach the device protocol.

Keep these URLs separate. The frontend URL is for browser users. The backend URL is the value you compile into firmware as `--server-url`.

Copy your ngrok auth token from the ngrok dashboard, then authenticate ngrok locally:

![Copy ngrok auth token](https://github.com/AgoraIO-Conversational-AI/agent-quickstart-python/blob/r1-workshop/.github/workshop/images/0783dd7d-f647-49cb-aa31-923aac9d346f.png?raw=1)

```bash
ngrok config add-authtoken <YOUR_AUTH_TOKEN>
```

### Share the web demo

In a new terminal, expose the web app:

```bash
ngrok http 3000
```

Copy the HTTPS forwarding URL and treat it as `YOUR_FRONTEND_NGROK_URL`.

![ngrok forwarding URL](https://github.com/AgoraIO-Conversational-AI/agent-quickstart-python/blob/r1-workshop/.github/workshop/images/645b7270-d503-4464-90ce-aa46f7da5d3a.png?raw=1)

### Expose the backend for R1

In another terminal, expose the backend:

```bash
ngrok http 8000
```

Copy the HTTPS forwarding URL and treat it as `YOUR_BACKEND_NGROK_URL`. Use this value later when you run the firmware setup script.

The backend terminal shows a forwarding URL in the same location as the web demo terminal. Copy the HTTPS URL from the terminal running `ngrok http 8000`, not the terminal running `ngrok http 3000`.

Before continuing:

1. Open `YOUR_FRONTEND_NGROK_URL` and confirm it loads the same web app as `http://localhost:3000`.
2. Open `YOUR_BACKEND_NGROK_URL/get_config` and confirm it returns JSON for the IoT device protocol.
3. Keep both ngrok tunnels running while the device is connected.

:::warning
Do not use `localhost`, `http://localhost:3000`, or `YOUR_FRONTEND_NGROK_URL` as the firmware server URL. The firmware must use `YOUR_BACKEND_NGROK_URL` from `ngrok http 8000`.
:::

## Prepare the R1 hardware

The R1 development kit integrates the Agora Conversational AI workflow with BK7258 hardware. It supports microphone and speaker I/O, Wi-Fi Station mode, BLE, AEC and NS audio processing, G.711 and G.722 audio codecs, and development interfaces for flashing and debugging.

Before flashing, identify these interfaces on the board:

- `USB TO UART` interface for flashing and serial debugging
- Speaker and microphone ports for voice input and output
- Reset button for boot or flash recovery
- Side buttons for user input during demos
- USB-C, power, and battery connector paths
- UART expansion pins for debugging or extension

During flashing, keep the reset button accessible. If the flashing tool waits for reset, press the reset button once and continue.

For the reference project, see the [Beken AIDK `beken_genie` documentation](https://docs.bekencorp.com/arminodoc/bk_aidk/bk7258/en/v2.0.1/projects/beken_genie/index.html).

## Create the BK AIDK Codespaces workspace

Open the original factory development environment for the BK hardware:

1. Open the [bekencorp/bk_aidk](https://github.com/bekencorp/bk_aidk) repository.
2. Select the `ai_release/v2.0.1` branch.
3. Click **Code** or **+**, then create a GitHub Codespaces environment from that branch.

:::note
If older workshop material mentions `ai_server/v2.0.1`, use `ai_release/v2.0.1` for the public GitHub repository.
:::

After the Codespace opens, add `bk_aidk_codespaces_setup.sh` to the root of the `bk_aidk` workspace. The terminal should already be in the repository root, usually `/workspaces/bk_aidk/`.

Download the setup script:

```bash
curl -fL -o bk_aidk_codespaces_setup.sh \
  https://raw.githubusercontent.com/AgoraIO-Conversational-AI/agent-quickstart-python/r1-workshop/.github/workshop/bk_aidk_codespaces_setup.sh
```

Make the script executable and run it with your 2.4 GHz Wi-Fi credentials and backend ngrok URL:

```bash
chmod +x bk_aidk_codespaces_setup.sh
./bk_aidk_codespaces_setup.sh \
  --ssid "YOUR_WIFI_SSID" \
  --password "YOUR_WIFI_PASSWORD" \
  --server-url "YOUR_BACKEND_NGROK_URL"
```

Replace `YOUR_BACKEND_NGROK_URL` with the full HTTPS forwarding URL from `ngrok http 8000`, for example `https://abc123.ngrok-free.app`.

## Compile the firmware

Run the following block from the Codespaces terminal:

```bash
# Install missing Python packages.
pip install click future click_option_group cryptography pycryptodome

# Point the build to the Codespaces Python runtime.
export PYTHON=/home/codespace/.python/current/bin/python
export PATH=/home/codespace/.python/current/bin:$PATH
export ARMINO_PATH=/workspaces/bk_aidk/bk_avdk/bk_idk
export PYTHON_EXECUTABLE=$PYTHON

unset PYTHONNOUSERSITE
$PYTHON -m pip install --user --force-reinstall "setuptools==80.9.0"

# Confirm the Python runtime and package path before compiling.
$PYTHON - <<'PY'
import sys
print(sys.executable)
print(sys.version)
import pkg_resources
print(pkg_resources.__file__)
PY

# Compile.
make bk7258 PROJECT=beken_genie
```

When the build finishes, locate the generated firmware artifact. The expected output is an `all-app.bin` file under the `build/beken_genie/bk7258` output tree. Use that file for flashing unless the workshop host provides a prebuilt firmware binary.

If you need to find the artifact, run:

```bash
python3 - <<'PY'
from pathlib import Path
for path in Path("build/beken_genie").rglob("all-app.bin"):
    print(path)
PY
```

For lower-level flashing details, see the [Beken firmware flashing documentation](https://docs.bekencorp.com/arminodoc/bk_idk/bk7258/en/v_ai_2.0.1/get-started/index.html#burn-code).

## Flash the firmware

Use either desktop BKFIL or the workshop-provided web flashing flow.

### Option A: Desktop BKFIL

For macOS, use the [BKFIL macOS package](https://agora-packages.s3.us-west-2.amazonaws.com/BKFIL_macos_4.0.1.25123002.zip), unless your workshop host provides a different version.

1. Connect the board over USB.
2. Choose the correct serial port.
3. Select the generated `all-app.bin` file, or a workshop-provided firmware binary.
4. Set the baudrate, commonly `1500000`.
5. Start flashing.
6. If prompted, press reset on the board.
7. Wait for the success message before unplugging or rebooting the device.

![Desktop BKFIL successful flash](https://github.com/AgoraIO-Conversational-AI/agent-quickstart-python/blob/r1-workshop/.github/workshop/images/1de54204-d760-4976-ab8c-6cbfaabc8216.png?raw=1)

### Option B: Web BKFIL

1. Open the BKFIL web UI provided by the workshop host.
2. Select the serial port from the dropdown.
3. Confirm the baud settings, such as `1500000` and `AppResetBaud 115200` when required.
4. Select the generated `all-app.bin` file.
5. Start download or flash.
6. Reset the chip if prompted.
7. Wait for erase and download progress to complete.

![Select serial port and baud](https://github.com/AgoraIO-Conversational-AI/agent-quickstart-python/blob/r1-workshop/.github/workshop/images/f64ace50-88d1-4314-b123-9a8e4c9b3c99.png?raw=1)

![Web BKFIL download and erase flow](https://github.com/AgoraIO-Conversational-AI/agent-quickstart-python/blob/r1-workshop/.github/workshop/images/45652655-5c11-4e19-bd40-b3b33e3605b9.png?raw=1)

## Validate the workshop

Confirm each item before considering the workshop complete:

- The local quickstart starts without backend or credential errors.
- `http://localhost:3000` loads the web app.
- `http://localhost:3000/api/get_config` returns JSON.
- `YOUR_FRONTEND_NGROK_URL` loads the web app.
- `YOUR_BACKEND_NGROK_URL/get_config` returns JSON.
- `bk_aidk_codespaces_setup.sh` was run with the 2.4 GHz Wi-Fi credentials and `YOUR_BACKEND_NGROK_URL`.
- The firmware build produces `all-app.bin`.
- The board appears on a valid serial port.
- The flash process completes successfully.
- The device captures microphone input.
- The agent returns audio through the device speaker.
- Transcript or voice interaction works in the web UI.

## Troubleshooting

| Issue | What to check |
| --- | --- |
| No serial device appears | Reconnect USB, close apps that may lock the serial port, then retry the flashing tool. |
| Flashing hangs at reset or check | Press the reset button on the board, then retry flashing. |
| No frontend tunnel URL | Verify the ngrok auth token and restart `ngrok http 3000`. |
| No backend tunnel URL | Verify the ngrok auth token and restart `ngrok http 8000`. |
| Agent does not start | Verify that Agora project environment variables were written to `server/.env.local`. |
| Web app cannot reach backend | Ensure the backend is running and port `8000` is free. |
| Device cannot reach the agent | Verify the firmware setup used `YOUR_BACKEND_NGROK_URL`, not the frontend URL. |

## Useful commands

Use these commands from the `agent-quickstart-python` repository:

```bash tab="Bun" tabGroup="package-manager"
# full local stack
bun run dev

# health checks
bun run doctor
bun run doctor:local

# verification
bun run verify
bun run verify:local
bun run verify:web
```

```bash tab="npm" tabGroup="package-manager"
# full local stack
npm run dev

# health checks
npm run doctor
npm run doctor:local

# verification
npm run verify
npm run verify:local
npm run verify:web
```
