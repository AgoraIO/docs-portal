---
title: 错误排查
description: 错误排查，用于补充 RTM 的排障、生命周期或合规说明。
---

## 开启本地日志

当你的应用处于开发、测试阶段时，你可能需要 SDK 输出更详细的信息来定位并修复问题。你可以在初始化 RTM 实例的时候通过设置 `RtmConfig` 中的 `RtmLogConfig` 来开启日志输出并设置日志信息等级，之后即可在 IDE 中查看日志信息。

```cpp
RtmConfig config;
config.appId = "your_appid"
config.userId = "your_name";
config.eventHandler = new RtmEventHandler();
config.logConfig.level = RTM_LOG_LEVEL_INFO;
config.logConfig.filePath = "your_path";
config.logConfig.fileSizeInKB = 10 * 1024;

int errorCode = 0;
rtmClient_ = createAgoraRtmClient(config, errorCode);
if (!rtmClient_ || errorCode != 0) {
    std::cout << RED <<"error creating rtm service!" << std::endl;
    exit(0);
}
```

`level` 字段可以设置为 `debug`、`info`、`warn`、`error`、`none` 五个等级之一，其中 `debug` 输出最详细的日志信息，`none` 不输出日志信息。

> **信息**
> 当你的应用上线时，请将日志信息等级设置为 `RTM_LOG_LEVEL_INFO`。

## 错误码对照表 [#errorcode]
## 联系我们

如果以上措施都为未能解决你的故障，或者你需要解决方案的支持，请将你的需求整理出来并通过邮箱发送到：rtm-support@agora.io。我们会在收到邮件的第一时间与你取得联系。
