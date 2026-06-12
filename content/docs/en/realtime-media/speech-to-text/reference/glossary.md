---
title: "Glossary"
description: "A list of terms used in Agora documentation."
---

## A

### Agora Analytics

Agora Analytics is a site for developers to track and analyze the usage and quality of calls.

### Agora Cloud Backup

Agora Cloud Backup is a backup cloud storage service used in cloud recording. If the recording service cannot upload the recorded files to the specified third-party cloud storage, then the service automatically and temporarily stores them in the backup cloud.

### Agora Console

Agora Console is a site for developers to manage Agora projects and services.

### App ID

An app ID is a randomly generated string provided by Agora and is the unique identifier of an app.

### App certificate

An app certificate is a randomly generated string provided by Agora for enabling token authentication. It is one of the required arguments for generating a token.

### Audience

Audience are users who do not have streaming permissions in a channel. An audience user can subscribe to remote audio and video streams, but cannot publish audio and video streams. For more information, see [user role](#user-role).

### Audience (becoming)

Becoming an audience describes a use-case within an Interactive Live Streaming channel (the channel profile is Live-Broadcast) when a host switches the user role and becomes an audience.

### Audio mixing

Audio mixing means combining multiple audio streams into one.

### Audio profile

An audio profile includes the sample rate, encoding scheme, number of channels, and bitrate for encoded audio data.

### Audio route

The audio route is the pathway audio data takes through audio hardware components during playback.

## C

### Callee

A callee is a Signaling user who receives a [call invitation](#call-invitation).

### Caller

A caller is an Signaling user who sends a [call invitation](#call-invitation).

###  Call invitation

Call invitation is a communication protocol based on the peer-to-peer messaging functionality of the Agora Signaling SDK. Call invitation supports starting, ending, accepting, and refusing calls.

### Channel

In Agora's platform, a channel is a way of grouping users together and is identified by a unique channel name. Users who connect to the same channel can communicate with each other. A channel is created when the first user joins and ceases to exist when the last user leaves.

### Channel attribute

Channel attributes are tags added to Signaling channels, including the property name, property value, the ID of the last Signaling user who updated the attribute, and the time of the last update.

### Channel message

A channel message is a message that a Signaling user sends to all Signaling users in a channel.

### Channel profile

The channel profile is a configuration that Agora uses to apply optimized algorithms for different real-time use-cases.

### Cloud proxy

Cloud proxy is a proxy service that enables users to connect to Agora services through a firewall by using fixed IP addresses.

### Cloud Recording

Cloud Recording is a component provided by Agora for recording and saving voice and video calls and interactive streaming on a third-party cloud storage through RESTful APIs.

### Co-hosting

Co-hosting describes a use-case with more than one host.

### Composite recording mode

Composite recording mode generates a single mixed audio and video file for all UIDs in a channel.

### Custom rendering

Custom rendering is the process where developers collect raw data from the SDK and process it according to specific needs.

### Custom source

Custom source is the process where an app captures raw data by itself.

## D

### Delay

In real-time audio and video communication, delay refers to the time elapsed from when the data is sent to when it is received.

###  Dual-stream mode

In the dual-stream mode, the Video SDK simultaneously transmits a higher-resolution video stream along with an additional low-resolution, low bitrate video stream.

## F

### Freeze

Freeze refers to choppy audio or video playback caused by a poor network connection or limited device performance during real-time audio and video communication.

## H

### High-quality video stream

In dual-stream mode, the SDK transmits two video streams of differing quality at the same time. See [dual stream mode](#dual-stream-mode) for details.

### Host

The host refers to a user who has streaming permissions in a channel. A host can publish audio and video. A host may also subscribe to audio and video published by other hosts.

### Host (becoming)

Becoming a host describes a use-case within an Interactive Live Streaming channel (the channel profile is Live-Broadcast) when an audience switches the user role and becomes a host.

## I

### Individual recording mode

Individual recording mode records audio and video of each UID as separate files.

### Inject online media stream

Inject online media stream refers to injecting an online media stream in an Interactive Live Streaming channel to share the stream with all users in the channel. The Agora Video SDK provides a method for developers to inject an online mixed audio and video stream or an audio only stream to a channel.

### Interactive Live Streaming

Enabled by either Agora’s Video SDK or Voice SDK, Interactive Live Streaming gives you full control over the streaming experience from a standard one-to-many stream to a highly-interactive live event.

## J

### Jitter

In real-time audio and video communication, jitter is the variation in the delay of data packets transmitted continuously on the network.

## L

### Last mile

The last mile refers to the network between the Agora edge server and the end user's device.

### Loopback test

A loopback test sends a signal from a communication device and is then returned (looped back) to it. It is often used to determine whether a device is working properly.

### Low-quality video stream

In dual-stream mode, the SDK transmits two video streams of differing quality at the same time. The low-quality video stream has a lower resolution and bitrate than the high-quality video stream. See [dual stream mode](#dual-stream-mode) for details.

## M

### MediaPlayer kit

The mediaplayer kit is a plug-in of the Video SDK to play local and online media resources and publish the media streams to other users in an Interactive Live Streaming channel.

### Media stream

A media stream is an object that contains media data.

### Media Push

Media Push enables you to upload audio and video streams from Agora channels and upload them to a Content Delivery Network (CDN) to reach a larger audience.

### Mirror

Mirroring is an effect that a video image renders.

## O

### Offline

Offline describes the status of an Signaling user who has successfully logged out of Signaling.

### Offline message

An offline message is a peer-to-peer message that an online Signaling user sends to an offline Signaling user.

### Online

Online describes the status of a user who has successfully logged in to the Agora Signaling system or stays disconnected from the Agora Signaling system for more than 30 seconds.

### On-Premise Recording

On-Premise Recording is a component provided by Agora for recording and saving voice and video calls and interactive streaming on a Linux server.

## P

### Packet loss

Packet loss refers to the data packets transmitted on the network failing to arrive at their intended destination.

### Peer-to-peer message

A peer-to-peer message is a message that an online Signaling user sends to an online or offline user.

### Publish

Publishing is the action of sending the user's audio and/or video data to the channel.

## R

### Raw data

Raw data, including raw audio data and raw video data, is the unprocessed data which developers can collect during real-time communication.

### Render the first video frame

Rendering the first video frame is the action of rendering the first video frame on the local device.

## S

### Agora SDRTN®

Software-Defined Real-Time Network (SDRTN<sup>®</sup>) is a real-time transmission network built by Agora and is the only network infrastructure specifically designed for real-time communications in the world.

### Signaling SDK

You use the Signaling SDK to implement real-time messaging use-cases that require low latency and high concurrency for a global audience.

### Slice

Slicing means cutting recorded audio or video into separate files according to specific rules. During an Agora Cloud Recording, the recording service cuts the streams and generates multiple slice files (TS or WebM files) and M3U8 files that serve as a playlist of the slice files.

### Sound localization

Sound localization means determining the distance to and direction of a sound through hearing the difference of volume, time, and timbre between users' ears.

### Stream fallback

In use-cases where multiple users engage in real-time audio and video communication, user experience can be impaired if the network condition is too poor to guarantee both audio and video at the same time.

### Stream mixing

Stream mixing means combining multiple media streams into one. It may include the mixing of video streams (video mixing) and audio streams (audio mixing).

### Subscribe

In the Agora Video SDK, subscribing is the action of receiving media streams published to the channel. In the Agora Signaling SDK, subscribing is the action of monitoring the online status of one or multiple Signaling users.

## T

### TCP

TCP (Transmission Control Protocol) is a connection-oriented and reliable transport layer communication protocol.

### Token

A token, also known as a dynamic key, is used for authentication when an app user joins an channel or logs onto the Agora Signaling.

### Transcoding

Transcoding is the process of decoding audio and video data and then re-encoding them into the target conversion output or format.

## U

### UDP

UDP (User Datagram Protocol) is a connectionless-oriented and unreliable transport layer communication protocol.

### User attribute

User attributes are tags added to Signaling users, including property names and property values.

### User ID (uid)

In the Agora Video SDK, a user ID identifies a user in the channel. The user ID is a 32-bit signed integer, with a value range from -2<sup>31</sup> to 2<sup>31</sup>-1, that you can specify yourself. If you specify `0` for the user ID when joining a channel, the SDK generates a random number and returns the value in the join channel success callback.

In the Agora Signaling SDK, a user ID identifiers a user in Signaling.

The user ID in the Agora Video SDK and the Agora Signaling SDK are independent of each other.

### User role

The type of user role determines whether the user in the channel has streaming permissions.

## V

### Video layout

Video layout arranges the display of users when multiple users are mixed into one stream, such as in Media Push or a composite recording.

### Video mixing

Video mixing means combining multiple video streams into one.

### Video profile

The video profile refers to a set of video attributes, such as resolution, bitrate, and frame rate.

### Video SDK

An SDK developed by Agora to enable developers to add real-time audio interaction to their projects.

### Voice SDK

Agora provides the Voice SDK to enable real-time audio communication.

## W

### Web page recording mode

In web page recording mode, the content and audio of a specified web page are recorded in a single file.
