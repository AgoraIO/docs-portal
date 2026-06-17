---
title: "Chat glossary"
description: "Explains Chat-related metrics."
---

# Chat glossary

This page explains Chat-related metrics.

## Scale metrics

### Total registered users

The accumulated number of registered users under this project as of the current time. This number could decline if some UIDs are deleted.

### Daily new users

The number of newly registered users under this project today (00:00 – current time).

### Daily active users (DAU)

The number of users who log in or send or receive messages today (00:00 – current time).  A user connected through multiple devices is regarded as one active user.

### Monthly Max. DAU

The highest number of DAU from 00:00 on the first day of this month to the current time.

### Total CHAT_GROUP.toLowerCase()s

The number of created CHAT_GROUP.toLowerCase()s under this project as of the current time (disbanded CHAT_GROUP.toLowerCase()s are excluded).

### Daily new CHAT_GROUP.toLowerCase()s

The number of newly created CHAT_GROUP.toLowerCase()s under this project today (00:00 – current time).

### Daily disbanded CHAT_GROUP.toLowerCase()s

The number of disbanded CHAT_GROUP.toLowerCase()s under this project today (00:00 – current time).

### Daily active CHAT_GROUP.toLowerCase()s

The number of CHAT_GROUP.toLowerCase()s that send uplink messages or receive downlink messages today (00:00 – current time).

### Total CHAT_ROOM.toLowerCase()s

The number of created CHAT_ROOM.toLowerCase()s under this project as of the current time (disbanded CHAT_ROOM.toLowerCase()s are excluded).

### Daily new CHAT_ROOM.toLowerCase()s

The number of newly created CHAT_ROOM.toLowerCase()s under this project today (00:00 – current time).

### Daily disbanded CHAT_ROOM.toLowerCase()s

The number of disbanded CHAT_ROOM.toLowerCase()s under this project today (00:00 – current time).

### Daily active CHAT_ROOM.toLowerCase()s

The number of CHAT_ROOM.toLowerCase()s that send uplink messages or receive downlink messages today (00:00 – current time).

### Daily CHAT_ROOM.toLowerCase() PCU

The highest number of users connected to servers at the same time in CHAT_ROOM.toLowerCase()s under this project today (00:00 - current time). Note that the displayed data has a 10-minute delay.

## Message count metrics

The following metrics apply to CHAT_ONE.toLowerCase()s, CHAT_GROUP.toLowerCase()s, and CHAT_ROOM.toLowerCase()s, as well as all message types.

### Total dispatched messages

The number of messages dispatched by the Chat server as of yesterday.

### Total uplink messages

The number of messages sent from clients to the Chat server as of yesterday.

### Total downlink messages

The number of messages sent from the Chat server to online users as of yesterday.

### Total offline messages

The number of messages sent from the Chat server to offline users as of yesterday.

## End-user API metrics

### Metric type

| Metric type | Description |
| :--------- | :----------------------------------------------- |
| Manual login | Users log in through a password or token. |
| Automatic login | Users log in automatically (TODO). |
| Message sending | Users send messages. |
| Friends management | User operations such as adding or removing friends from their contacts. |
| User management | User operations such as creating and updating a profile. |
| Group chat management | User operations such as creating and deleting CHAT_GROUP.toLowerCase()s. |
| Chat room management | User operations such as creating and deleting CHAT_ROOM.toLowerCase()s. |

### Metric

| Metric | Description |
| :------------------ | :----------------------------------------------------------- |
| Request attempts | The total number of attempts to call the client SDK APIs. |
| 1s/3s/5s request success rate | The number of successful calls of the client SDK API in 1s/3s/5s divided by the total number of effective call attempts ①. |
| Average request delay | The sum of delay of client SDK API calls divided by the total number of successful calls. |

① The total number of effective call attempts does not include invalid call attempts. A call attempt is considered as invalid if one of the following requirements is met:
- The username or password is empty or incorrect.
- The username is illegal.
- The password is invalid.
- Ths user cannot perform the operation without an admin permission.
- The user does not exist.
- The CHAT_GROUP.toLowerCase() does not exist.
- The user is not found in the CHAT_GROUP.toLowerCase().

## Server API metrics

### Metric type

| Metric type | Description |
| :----------- | :----------------------------------------------------------- |
| Token generation | Retrieving a token that has the privilege of an administrator through the RESTful API. |
| User system registration | User registration and retrieving, modifying, and deleting user information through the RESTful API. |
| File upload / download | Uploading and downloading audio, image, and other files through the RESTful API. |
| Message sending | Sending a message through the RESTful API. |
| Group chat management | Functions such as creating and deleting CHAT_GROUP.toLowerCase()s through the RESTful API. |
| Chat room management | Functions such as creating and deleting CHAT_ROOM.toLowerCase()s through the RESTful API. |
| User attributes | Functions such as setting and deleting user attributes through the RESTful API. |

### Metric

| Metric | Description |
| :------------------ | :----------------------------------------------------------- |
| Request attempts | The total number of attempts to make RESTful API requests. |
| 1s/3s/5s request success rate | The number of successful RESTful API requests in 1s/3s/5s divided by the total number of RESTful API  request attempts. |
| Average request delay | The sum of delay of all RESTful API requests divided by the total number of successful RESTful API requests. |
