---
title: "Optimize transcription quality and cost"
description: "Optimize real-time STT transcription quality and cost"
---

To optimize transcription quality and reduce costs, specify only one source language per STT agent or task. This approach avoids additional language identification fees and provides the most accurate results.

* **Single-language channel**

  If all users in a channel speak the same language, start one STT agent or task that subscribes to all relevant UIDs.

* **Multi-language channel**

  If users in a channel speak different languages, start a separate STT agent or task for each source language.

* **Multilingual speaker**

  If a user speaks multiple languages, creating one STT agent or task per language will not capture their speech effectively. Instead, start a dedicated STT agent or task for that UID to handle language-specific transcription and translation.
