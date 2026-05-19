---
title: 错误排查
description: 错误排查，用于补充 RTM 的排障、生命周期或合规说明。
---

## 开启本地日志

当你的应用处于开发、测试阶段时，你可能需要 SDK 输出更详细的信息来定位并修复问题。你可以在初始化 RTM 实例的时候通过设置 `RtmConfig` 中的 `RtmLogConfig` 来开启日志输出并设置日志信息等级，之后即可在 IDE 中查看日志信息。

```java showLineNumbers
RtmConfig rtmConfig = new RtmConfig();

rtmConfig.userId = "your_userid";
rtmConfig.appId = "your_appid";

RtmLogConfig logConfig = new RtmLogConfig();
logConfig.level = RtmLogLevel.INFO;
logConfig.filePath = "your_path";
logConfig.fileSizeInKB = 10*1024;

rtmConfig.logConfig = logConfig;
```

`level` 字段可以设置为 `INFO`、`WARN`、`ERROR`、`FATAL`、`NONE` 五个等级之一，其中 `INFO` 输出最详细的日志信息，`NONE` 不输出日志信息。

> **信息**
> 当你的应用上线时，请将日志信息等级设置为 `INFO`。

## <a name="errorcode"></a>错误码对照表

在调用 RTM Java API 时，如果发生错误，SDK 会执行 `onFailure` 方法并且返回一个 `ErrorInfo` 类型的 `errorInfo` 返回值：

|  属性  |  类型  | 描述                            |
| ---- | ------ | --------- |
| `errorCode` | `RtmErrorCode` | 本次操作错误码。 |
| `reason` | String | 本次操作出错原因。 |
| `operation` | String | 本次操作类型。 |

其中，`errorCode` 和 `reason` 属性分别报告错误码和错误描述，你可以在下面的表格中寻找解决方法：

## 联系我们

如果以上措施都为未能解决你的故障，或者你需要解决方案的支持，请将你的需求整理出来并通过邮箱发送到：rtm-support@agora.io。我们会在收到邮件的第一时间与你取得联系。
