---
title: Limitations
description: Review Media Gateway RESTful API call limits and concurrent stream quotas.
---

This page describes the limitations applied to the Media Gateway service.

## API call limits

Agora servers limit the call rate of Media Gateway APIs and return `429 Too Many Requests` when the limit is exceeded. If you need higher call rates, contact [Agora technical support](mailto:support@agora.io).

| API | Calling rate limit per project |
| :--- | :----------------------------- |
| `Create` | 50 per second. |
| `Delete` | 50 per second. |
| `Query` | 100 per second. |
| `Update` | 50 per second. |

## Maximum number of concurrent tasks

The concurrent stream limits are:

| Stream type | Limit |
| :---------- | :---- |
| Streams with video transcoding | 10 |
| Streams without transcoding | 50 |

For higher quotas, contact [Agora technical support](mailto:support@agora.io).
