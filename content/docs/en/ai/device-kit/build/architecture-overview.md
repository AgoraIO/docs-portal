---
title: Architecture overview
description: Understand how the Convo AI Device Kit solution is composed across device, cloud, and software layers.
---
The Convo AI Device Kit solution is built on Agora's Media Stream Acceleration (RTSA) or IoT SDK and Conversational AI Engine. RTSA is Agora's RTC client product designed specifically for the IoT industry, providing the real-time communication foundation for voice AI interactions.

## Solution architecture

The Convo AI Device Kit solution consists of two main components connected through Agora's backend.

![Solution Architecture](https://assets-docs.agora.io/images/convo-ai-device-kit/architecture.png)

- **Convo AI Device Kit**

  The hardware device handles local processing including power management, Bluetooth pairing, voice wake-up, OTA updates, and peripheral driver support. It captures audio and video through dedicated modules, encodes the data, and transmits it through RTSA (Real-Time Streaming Acceleration) to Agora's SD-RTN. The device also receives and decodes audio/video responses for playback.

- **Conversational AI Engine**

  The cloud service processes the incoming audio and video streams. It has two main components:

  - **Convo AI Core**: Handles AI-powered voice activity detection (VAD), noise reduction, echo cancellation, interruption detection, background voice filtering, and snapshot/frame capture
  - **Cascade Model**: Processes the audio through Speech-to-Text (STT), sends the text to a Large Language Model (LLM), and converts the response back to speech using Text-to-Speech (TTS)

The system uses G.711/G.722 audio codecs and MJPEG/H.264 video codecs for efficient real-time transmission between the device and cloud services, enabling low-latency conversational AI interactions.

## Hardware architecture

The R1 Kit integrates multiple hardware components to enable multimodal AI interactions:

![R1 Kit Hardware](https://assets-docs.agora.io/images/convo-ai-device-kit/device.png)

**Key components:**

- Dual-screen LCD/Single touch LCD (optional)
- Digital video port
- Bi-color LED indicator
- Dual-microphone array with solder pads and connectors
- Speaker with solder pads and connector
- Gyroscope for motion sensing
- SD NAND storage
- Battery connector for portable power
- NFC support
- USB-to-UART interface
- Reset button and side buttons
- Vibration motor (expandable)

## Software architecture

The software package provides a complete development framework for building conversational AI applications:

![R1 Kit Software](https://assets-docs.agora.io/images/convo-ai-device-kit/developer-kit.png)

## Related pages

- [Specifications and compatibility](specifications-and-compatibility)
