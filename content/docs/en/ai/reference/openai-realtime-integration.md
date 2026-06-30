---
title: OpenAI Realtime quickstart
description: Build a Python service that bridges Agora real-time audio with the OpenAI Realtime API.
---

This quickstart shows how to combine Agora real-time audio transport with the OpenAI Realtime API. The sample agent joins an Agora channel, subscribes to a user's audio, streams PCM audio to OpenAI, and sends synthesized audio plus transcript messages back through Agora.

This is the custom integration path. If you want Agora to manage the voice-agent runtime for you, use the main Conversational AI Engine quickstart instead.

## Understand the tech

The Python service contains two main pieces:

- `RealtimeKitAgent`: Connects to an Agora channel and to the OpenAI Realtime API. It streams RTC audio to the model with `rtc_to_model`, receives model audio with `model_to_rtc`, and handles transcript and tool messages from the model.
- HTTP control server: Starts and stops agent processes through `/start_agent` and `/stop_agent`, so a browser or device can join the same Agora channel and talk to the agent.

The audio path is:

1. A user joins an Agora channel from a client app or the Agora Voice Call Demo.
2. The Python agent joins the same channel with the Agora server-side SDK.
3. The agent subscribes to the user's audio and sends PCM frames to the OpenAI Realtime API.
4. The agent receives OpenAI audio deltas, pushes them back to the Agora channel, and sends transcript messages through Agora chat.

## Prerequisites

Before you begin, make sure you have:

- An Agora account and project.
- An Agora App ID and App Certificate.
- An OpenAI API key with Realtime API access.
- Python 3.10 or later.
- FFmpeg.
- PyAudio and the system audio dependencies required by your operating system.

On Ubuntu, install FFmpeg and PyAudio with:

```bash
sudo apt update
sudo apt install ffmpeg python3-pyaudio
```

## Get the sample project

The fastest way to run the integration is to use the Agora demo project:

```bash
git clone https://github.com/AgoraIO/openai-realtime-python.git
cd openai-realtime-python
```

Follow the repository README for the latest complete code. The rest of this page explains the project structure and the core pieces you need to configure and test.

## Project structure

If you build the project step by step, use this structure:

```text
realtime_agent/
  __init__.py
  .env
  agent.py
  logger.py
  main.py
  parse_args.py
  tools.py
  utils.py
  requirements.txt
  realtime/
    connection.py
    struct.py
```

The key files are:

- `agent.py`: Defines `RealtimeKitAgent` and the Agora-to-OpenAI audio bridge.
- `main.py`: Starts the HTTP server and manages agent processes.
- `tools.py`: Registers local and pass-through tools for model calls.
- `utils.py`: Provides PCM audio utilities.
- `parse_args.py`: Parses channel and user ID arguments.
- `realtime/connection.py`: Manages the OpenAI Realtime WebSocket connection.
- `realtime/struct.py`: Defines client and server message structures for the Realtime API.

## Install dependencies

Create and activate a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

Install the dependencies from the sample project:

```bash
pip install -r requirements.txt
```

At minimum, the project uses:

```text
agora-python-server-sdk==2.0.5
agora-realtime-ai-api==1.0.6
aiohttp==3.10.6
openai==1.37.1
PyAudio==0.2.14
python-dotenv==1.0.1
pydantic==2.9.2
```

## Configure environment variables

Create a `.env` file and fill in your credentials:

```bash
AGORA_APP_ID=
AGORA_APP_CERT=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-realtime-preview
SERVER_PORT=8080
```

Keep Agora credentials and the OpenAI API key on the server side. Do not ship them in a browser or device app.

## Implement the agent

In `agent.py`, define `RealtimeKitAgent` with methods for setup, bidirectional audio streaming, and model message handling:

```python
class RealtimeKitAgent:
    @classmethod
    async def setup_and_run_agent(
        cls,
        *,
        engine,
        options,
        inference_config,
        tools,
    ) -> None:
        channel = engine.create_channel(options)
        await channel.connect()

        try:
            async with RealtimeApiConnection(
                base_uri="wss://api.openai.com",
                api_key=os.getenv("OPENAI_API_KEY"),
                verbose=False,
            ) as connection:
                await connection.send_request(
                    SessionUpdate(
                        session=SessionUpdateParams(
                            turn_detection=inference_config.turn_detection,
                            tools=tools.model_description() if tools else [],
                            tool_choice="auto",
                            input_audio_format="pcm16",
                            output_audio_format="pcm16",
                            instructions=inference_config.system_message,
                            voice=inference_config.voice,
                            model=os.environ.get(
                                "OPENAI_MODEL",
                                "gpt-4o-realtime-preview",
                            ),
                            modalities=["text", "audio"],
                        )
                    )
                )

                agent = cls(connection=connection, tools=tools, channel=channel)
                await agent.run()
        finally:
            await channel.disconnect()
```

The agent waits for a remote user, subscribes to that user's audio, and starts three asynchronous loops:

```python
asyncio.create_task(self.rtc_to_model())
asyncio.create_task(self.model_to_rtc())
asyncio.create_task(self._process_model_messages())
```

### Stream Agora audio to OpenAI

Implement `rtc_to_model` to read audio frames from the Agora channel and send them to the Realtime API:

```python
async def rtc_to_model(self) -> None:
    if self.subscribe_user is None:
        await asyncio.sleep(0.1)

    audio_frames = self.channel.get_audio_frames(self.subscribe_user)

    async for audio_frame in audio_frames:
        await self.connection.send_audio_data(audio_frame.data)
        await asyncio.sleep(0)
```

### Stream OpenAI audio to Agora

Implement `model_to_rtc` to push model audio back into the Agora channel:

```python
async def model_to_rtc(self) -> None:
    while True:
        frame = await self.audio_queue.get()
        await self.channel.push_audio_frame(frame)
```

### Process model messages

Handle Realtime API messages by clearing queued audio on speech start, queueing audio deltas for playback, and sending transcript messages through Agora chat:

```python
async def _process_model_messages(self) -> None:
    async for message in self.connection.listen():
        match message:
            case InputAudioBufferSpeechStarted():
                await self.channel.clear_sender_audio_buffer()
                while not self.audio_queue.empty():
                    self.audio_queue.get_nowait()

            case ResponseAudioDelta():
                self.audio_queue.put_nowait(base64.b64decode(message.delta))

            case ResponseAudioTranscriptDelta():
                asyncio.create_task(
                    self.channel.chat.send_message(
                        ChatMessage(
                            message=to_json(message),
                            msg_id=message.item_id,
                        )
                    )
                )

            case ResponseAudioTranscriptDone():
                asyncio.create_task(
                    self.channel.chat.send_message(
                        ChatMessage(
                            message=to_json(message),
                            msg_id=message.item_id,
                        )
                    )
                )
```

## Implement the OpenAI connection

In `realtime/connection.py`, create a WebSocket client for the OpenAI Realtime API:

```python
class RealtimeApiConnection:
    def __init__(
        self,
        base_uri: str,
        api_key: str | None = None,
        path: str = "/v1/realtime",
        model: str = "gpt-4o-realtime-preview",
    ):
        self.url = f"{base_uri}{path}"
        if "model=" not in self.url:
            self.url += f"?model={model}"

        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        self.session = aiohttp.ClientSession()
        self.websocket = None

    async def connect(self):
        headers = {"OpenAI-Beta": "realtime=v1"}
        auth = aiohttp.BasicAuth("", self.api_key) if self.api_key else None
        self.websocket = await self.session.ws_connect(
            url=self.url,
            auth=auth,
            headers=headers,
        )

    async def send_audio_data(self, audio_data: bytes):
        base64_audio_data = base64.b64encode(audio_data).decode("utf-8")
        await self.send_request(InputAudioBufferAppend(audio=base64_audio_data))

    async def listen(self):
        async for msg in self.websocket:
            if msg.type == aiohttp.WSMsgType.TEXT:
                yield self.handle_server_message(msg.data)
```

## Add HTTP start and stop endpoints

In `main.py`, use an HTTP server to start and stop agent processes. Keep a process map keyed by channel name:

```python
active_processes = {}
```

The `/start_agent` endpoint validates the request body, starts a process, and stores it:

```python
async def start_agent(request):
    data = await request.json()
    channel_name = data["channel_name"]
    uid = int(data["uid"])

    if channel_name in active_processes and active_processes[channel_name].is_alive():
        return web.json_response(
            {"error": f"Agent already running for channel: {channel_name}"},
            status=400,
        )

    process = Process(
        target=run_agent_in_process,
        args=(app_id, app_cert, channel_name, uid, inference_config),
    )
    process.start()
    active_processes[channel_name] = process

    return web.json_response({"status": "Agent started!"})
```

The `/stop_agent` endpoint terminates a process for the specified channel:

```python
async def stop_agent(request):
    data = await request.json()
    channel_name = data["channel_name"]
    process = active_processes.get(channel_name)

    if process and process.is_alive():
        os.kill(process.pid, signal.SIGKILL)
        active_processes.pop(channel_name, None)
        return web.json_response(
            {"status": "Agent process terminated", "channel_name": channel_name}
        )

    return web.json_response(
        {"error": "No active agent found for the provided channel_name"},
        status=404,
    )
```

Register the routes:

```python
app.add_routes([web.post("/start_agent", start_agent)])
app.add_routes([web.post("/stop_agent", stop_agent)])
```

## Run and test

To run a single agent directly:

```bash
python3 -m main agent --channel_name=<channel_name> --uid=<agent_uid>
```

To run the HTTP control server:

```bash
python3 -m main server
```

Start an agent:

```bash
curl 'http://localhost:8080/start_agent' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "channel_name": "test",
    "uid": 123
  }'
```

Stop the agent:

```bash
curl 'http://localhost:8080/stop_agent' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "channel_name": "test"
  }'
```

Join the same Agora channel from a client app or the [Agora Voice Call Demo](https://webdemo.agora.io/basicVoiceCall/index.html), speak into the channel, and confirm that the model response audio returns to the channel.

## Troubleshooting

- If the agent does not join the channel, confirm that `AGORA_APP_ID`, `AGORA_APP_CERT`, channel name, and user ID are correct.
- If OpenAI does not respond, confirm that `OPENAI_API_KEY` has Realtime API access and that `OPENAI_MODEL` is valid for your account.
- If audio is silent or distorted, confirm that the RTC audio format and the Realtime API session audio format are both `pcm16`.
- If `/start_agent` returns an existing-process error, call `/stop_agent` for that channel before starting another agent.

## Reference

- [Demo project on GitHub](https://github.com/AgoraIO/openai-realtime-python)
- [Voice calling quickstart](/en/realtime-media/voice/quickstart)
- [RTC API reference](/en/api-reference/api-ref/rtc)
