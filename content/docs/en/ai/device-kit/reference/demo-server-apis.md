---
title: Demo server RESTFUL APIs
description: Reference for the server-side APIs used by the Convo AI Device Kit development workflow.
---
The demo server provides three RESTful APIs for device operations. This example project does not implement authentication. You can add authentication as needed.

**Base URL**: `https://your-domain.com/`

**Authentication**: None

## Get device RTC token

Retrieves RTC credentials for the device to join a channel.

- **Method**: POST
- **Endpoint**: `/device`
- **Request body**:

  ```json
  {
    "channel_name": "DEVICE_ID",
    "uid": DEVICE_USER_ID
  }
  ```

## Start conversational AI agent

Starts the Conversational AI Engine for the specified channel.

- **Method**: POST
- **Endpoint**: `/agent/start`
- **Request body**:

  ```json
  {
    "channel_name": "DEVICE_ID",
    "uid": DEVICE_USER_ID,
    "agent_uid": AGENT_USER_ID
  }
  ```

## Stop conversational AI agent

Stops the Conversational AI Engine.

- **Method**: POST
- **Endpoint**: `/agent/stop`
- **Request body**:

  ```json
  {
    "agent_id": "AGENT_ID"
  }
  ```
