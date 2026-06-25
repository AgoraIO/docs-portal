---
title: Channel Management REST API
description: Use channel management REST APIs to manage users in the channel and query channel statistics at the app server.
---

In addition to the SDK that you integrate into the app client, Agora provides server-side RESTful APIs to manage real-time channels.

The IoT Channel Management REST API uses the shared RTC REST API reference. Use these APIs to query channel information, manage user privileges, and query Agora Notifications service IP addresses.

## REST API reference

- [RTC REST API overview](/en/api-reference/api-ref/rtc)
- [How to call RESTful APIs](/en/api-reference/api-ref/rtc/how-to-call-api)
- [RESTful authentication](/en/api-reference/api-ref/rtc/authentication)
- [Response status codes](/en/api-reference/api-ref/rtc/response-status-codes)

## Endpoints

**Channel information**

- [Query the channel list](/en/api-reference/api-ref/rtc/query-channel-list)
- [Query the user list](/en/api-reference/api-ref/rtc/query-user-list)
- [Query the host list](/en/api-reference/api-ref/rtc/query-host-list)
- [Query the user status](/en/api-reference/api-ref/rtc/query-user-status)

**User privilege banning**

- [Create a banning rule](/en/api-reference/api-ref/rtc/create-ban-rule)
- [Delete a banning rule](/en/api-reference/api-ref/rtc/delete-ban-rule)
- [Get the banning rule list](/en/api-reference/api-ref/rtc/get-ban-rule-list)
- [Update the banning rule expiration](/en/api-reference/api-ref/rtc/update-ban-expiration)

**Message notification service**

- [Query the IP address](/en/api-reference/api-ref/rtc/query-ip-address)

## Supporting topics

- [Ban user privileges best practices](/en/api-reference/api-ref/rtc/ban-user-privileges-best-practices)
- [Ensure service reliability](/en/api-reference/api-ref/rtc/ensure-service-reliability)
- [Channel event types](/en/api-reference/api-ref/rtc/channel-event-types)
