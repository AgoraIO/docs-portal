---
title: "Product overview"
description: "Understand the features and functionality supplied by Signaling."
---

Agora's Signaling API enables low-latency metadata synchronization and real-time event notifications. With features like channel management, presence updates, and attribute synchronization, it enhances real-time applications with ultra-low latency and high scalability.

Extend Agora's Signaling SDKs with advanced capabilities such as stream channels, attribute storage and distribution, and integration with third-party services via webhooks to create dynamic and interactive real-time experiences.

## Start building with

- [SDK quickstart](index.mdx) - Customize your experience from the start with our flexible Video SDK.
- [Authentication](get-started/authentication-workflow.md)
- [API reference](https://docs.agora.io/en/signaling/reference/api)

## Product Features

- [**Message channels**](build/channels/message-channel.md) - Real-time messaging that enables asynchronous pub/sub message transmission without the need for immediate response. Publishers send messages to the channel, subscribers receive messages from the channels they sign up to. Depending on your business needs, send string or binary payloads.
- [**Stream channels**](build/channels/stream-channel.md) - A real-time data pipeline that enables the uninterrupted flow of data from one point to another without delay or latency. Depending on your business needs, send string or binary payloads
- [**Topics**](build/channels/topics.md) - Facilitate effective data stream management and communication between users in real time in Stream channels. Enable users to subscribe to, distribute, and notify users subscribed to a topic. Publishers send messages to a topic, subscribers receive messages in the topics they sign up to.
- [**Presence**](build/presence.md) - In online collaboration apps, enable users to see the availability of their contacts. Presence information is typically displayed as a status message or with an icon next to a user's name. It helps users determine the availability of others for communication or collaboration.
- [**Storage**](build/storage/store-user-metadata.md) - Persist and managing data that is exchanged between different clients or devices in real-time. Ensure that messages are not lost or dropped during transmission and enable quick and reliable message delivery to any number of clients.
- [**Locks**](build/storage/store-channel-metadata.md) - Critical resource management mechanism to prevent mutual interference. Ensure that messages are processed in a specific order and prevent concurrent access to the same data. When your app accesses a resource, it can lock on that resource to prevent other clients from accessing it.
