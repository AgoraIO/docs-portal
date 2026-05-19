---
title: 错误排查
description: 错误排查，用于补充 RTM 的排障、生命周期或合规说明。
---

## 开启本地日志

当你的应用处于开发、测试阶段时，你可能需要 SDK 输出更详细的信息来定位并修复问题。你可以在初始化 RTM 实例的时候通过设置 `RTMConfig` 中的 `LogConfig` 来开启日志输出并设置日志信息等级，之后即可在浏览器的控制台中查看日志信息。

```javascript showLineNumbers
const  = AgoraRTM;
const rtmConfig = ;
const rtm = new RTM("yourAppId", "Tony", rtmConfig);
```

`logLevel` 字段可以设置为 `debug`、`info`、`warn`、`error`、`none` 五个等级之一，其中 `debug` 输出最详细的日志信息，`none` 不输出日志信息。

> **信息**
> 当你的应用上线时，请将日志信息等级设置为 `info`。

## 开启日志上传

当你遇到在本地调试无法解决的错误时，可以联系声网技术支持协助你排查问题。此时，你需要开启日志上传功能，声网技术支持会根据你的日志信息来定位错误原因。你需要在初始化 RTM 实例的时候通过设置 `rtmConfig` 参数中的 `logUpload` 参数开启日志上传功能。

```javascript showLineNumbers
const  = AgoraRTM;
const rtmConfig = {
    logLevel : "debug",
    logUpload : true
    };
const rtm = new RTM("yourAppId", "Tony", rtmConfig);
```

> **信息**
> 为避免产生不必要的存储计费，你需要在故障解决后及时关闭日志上传功能。

## <a name="errorcode"></a>错误码对照表

RTM JavaScript SDK 支持并推荐你使用 Async/Await 编程模式，以便在业务中处理 JavaScript 异步操作。在调用 RTM JavaScript API 时，如果发生错误，SDK 会抛出一个 `ErrorInfo` 类型的错误对象，你需要使用 `try...catch` 捕获该对象。`ErrorInfo` 包含以下属性：

```javascript showLineNumbers
type ErrorInfo = {
    error: boolean;                     // 本次操作是否出错
    operation: string;                  // 本次操作的 API 名称
    errorCode: number;                  // 错误码
    reason: string;                     // 错误描述
}
```

如果 API 调用失败，则 SDK 会通过 `ErrorInfo` 的 `errorCode` 和 `reason` 属性分别报告错误码和错误描述，你可以在下面的表格中寻找解决方法：

## 联系我们

如果以上措施都为未能解决你的故障，或者你需要解决方案的支持，请将你的需求整理出来并通过邮箱发送到：rtm-support@agora.io。我们会在收到邮件的第一时间与你取得联系。
