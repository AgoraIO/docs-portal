---
title: "Troubleshooting"
description: "Troubleshooting"
---

To troubleshoot issues you encounter during development, take the following steps:

## Enable local logging

In the development or testing phase, you may need the SDK to output more detailed information to help locate and fix issues. Enable log output and set the log level by setting `RtmConfig` to `RtmLogConfig` when initializing the Signaling client instance. The SDK outputs the log information in the browser console.

```java 
RtmConfig rtmConfig = new RtmConfig();

rtmConfig.userId = "your_userid";
rtmConfig.appId = "your_appid";

RtmLogConfig logConfig = new RtmLogConfig();
logConfig.level = RtmLogLevel.INFO;
logConfig.filePath = "your_path";
logConfig.fileSizeInKB = 10*1024;

rtmConfig.logConfig = logConfig;
```

You can set the `logLevel` to `INFO`, `WARN`, `ERROR`, `FATAL`, or `NONE`. The `INFO` level outputs the most detailed log information, while `NONE` does not output any log information.

:::info
When your application goes live, set the log information level to `INFO`.

:::

## Error codes reference table

When calling the RTM Java API, if an error occurs, the SDK will execute the `onFailure` method and return an `errorInfo` of type `ErrorInfo`:

|  Property  |  Type  | Description                       |
| :---------: | :-----: | --------------------------------- |
| `errorCode` | `RtmErrorCode` | The error code for this operation. |
| `reason`    | String | The reason for the error. |
| `operation` | String | The type of operation. |

The `errorCode` and `reason` properties report the error code and description, respectively. Refer to the [error codes table](https://docs.agora.io/en/signaling/reference/error-codes) to get more information about the error.

## Contact Us

If the above measures do not resolve your issue or if you need support with solutions, please contact support@agora.io.
