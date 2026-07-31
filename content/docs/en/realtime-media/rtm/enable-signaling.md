---
title: "Enable and configure Signaling"
description: "Enable Signaling for your project and configure presence, storage, and stream channels in Agora Console."
---

Before you enable Signaling, make sure you have an [Agora account](/en/introduction/account#sign-up-for-an-agora-account) and a [project](/en/introduction/account#your-first-agora-project).

## Enable Signaling for your project

:::info[Note]
Signaling is enabled by default for all new projects.
:::

To enable Signaling for an existing project, in [Agora Console](https://console.agora.io), select **RTC Services** from the sidebar, then locate the **Signaling** card and turn on its toggle.

## Configure Signaling

To configure Signaling, select the settings icon on the **Signaling** card to open its configuration panel.

![Signaling settings on the Services page](/console-tmp/signaling-config.png)

The Signaling panel provides the following configuration.

### Presence configuration

Turn on **Enable Presence** to control whether Presence is available for this project, then set:

- **Max number of instant event**: The maximum number of instant notifications sent before Signaling switches to interval mode. The value range is 8–128, with a default of 50. To request a value outside this range, contact [technical support](mailto:support@agora.io).
- **Timed event notification interval**: How often periodic notifications are sent, in seconds. The value range is 5–300, with a default of 30.
- **Event notification debounce time**: The interval within which no presence event is triggered if a user quickly leaves and rejoins, in seconds. The default is 2.

### Storage configuration

Turn on **Enable Storage** to enable storage sync and related attribute callbacks, then set:

- **User attribute callback**: Receive callbacks when user attributes change in real time.
- **Channel attribute callback**: Receive callbacks when channel attributes are updated by any member.

### History

Turn on **Enable History** to store message history for later retrieval.

### Distributed lock

Turn on **Enable Distributed Lock** to coordinate exclusive access to shared resources across clients.

### Activate stream channels

Turn on **Enable Stream Channel** to use ordered, topic-based messaging for time-sensitive event delivery. This setting may require manual review before it becomes fully available.

Select **Save changes** to apply your updates.

For more information on managing other aspects of your Agora account, see [Console setup](/en/introduction/console-setup).
