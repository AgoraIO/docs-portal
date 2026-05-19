---
title: 错误排查
description: 错误排查，用于补充 RTM 的排障、生命周期或合规说明。
---

## 开启本地日志

当你的应用处于开发、测试阶段时，你可能需要 SDK 输出更详细的信息来定位并修复问题。你可以在初始化 RTM 实例的时候通过设置 `RtmConfig` 中的 `RtmLogConfig` 来开启日志输出并设置日志信息等级，之后即可在 IDE 中查看日志信息。

```csharp showLineNumbers
using Agora.Rtm;
private IRtmClient rtmClient;
LogConfig logConfig = new LogConfig()
// set log file path.
logConfig.filePath = "./logfile/";
// set log file size.
logConfig.fileSizeInKB = 512;
// set log report level.
logConfig.level = LOG_LEVEL.INFO;
RtmConfig config = new RtmConfig();
// initialize logconfig.
config.logConfig = logConfig;
config.appId = "your_appId";
config.userId = "your_userId";
try
{
    rtmClient = RtmClient.CreateAgoraRtmClient(config);
    Debug.Log("RTM Client Initialize Sucessfull");
}
catch (RTMException e)
{
    Debug.Log(string.Format(" is failed.", e.Status.Operation ));
    Debug.Log(string.Format("Error code: , due to: ", e.Status.ErrorCode, e.Status.Reason));
}
```

`level` 字段可以设置为 `debug`、`info`、`warn`、`error`、`none` 五个等级之一，其中 `debug` 输出最详细的日志信息，`none` 不输出日志信息。

> **信息**
> 当你的应用上线时，请将日志信息等级设置为 `INFO`。

## <a name="errorcode"></a>错误码对照表

## 联系我们

如果以上措施都为未能解决你的故障，或者你需要解决方案的支持，请将你的需求整理出来并通过邮箱发送到：rtm-support@agora.io。我们会在收到邮件的第一时间与你取得联系。
