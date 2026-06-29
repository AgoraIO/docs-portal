---
title: "Integrate the SDK"
description: "Shows how to integrate the Cloud Gateway SDK and run the sample project."
---

This article shows how to integrate the Server Gateway C++ SDK and run the sample project.

## Set up the development environment

Make sure your server meets the following requirements.

### Hardware environment

**Operating system**

- Ubuntu 14.04 or higher
- CentOS: 7.0 or higher

**CPU architecture**

- arm64
- x86-64

If you need to run the SDK on other architectures, [submit a ticket](https://agora-ticket.agora.io/) to contact technical support.

**Performance**

- CPU：8-core, 1.8 GHz or higher.
- 2 GB of RAM or higher. 4 GB or higher is recommended.

**Network**

- The server is connected to the internet and has an internet IP.
- The server can access `*.agora.io` and `*.agoralab.co`.

### Software environment

- glibc 2.18 or later
- gcc 4.8 or later

If you are using Ubuntu, taking Ubuntu 20.04.3 LTS as an example, install the following dependencies in your server:

```shell
# Install aptitude
sudo apt install aptitude
# Install build-essential libx11-dev libxcomposite-dev libxext-dev libxfixes-dev libxdamage-dev cmake
sudo aptitude install libx11-dev libxcomposite-dev libxext-dev libxfixes-dev libxdamage-dev cmake
```

If you are using CentOS, taking CentOS 7.9.2009 as an example, install the following dependencies in your server:

```shell
sudo yum groupinstall "Development Tools"
sudo yum install wget
sudo yum groupinstall X11
```

## Get an Agora App ID and a Video SDK temporary token

See [Manage your Agora account](build/manage-agora-account.md) to learn how to get an **Agora App ID** and a **Video SDK temporary token**.

## Get the SDK

[Download](/en/api-reference/sdks?product=server-gateway&platform=linux) the latest x86-64 SDK package and decompress the file. If you need the SDK build for other architectures, [submit a ticket](https://agora-ticket.agora.io/) to technical support.
