---
title: 使用 Go SDK 实现对话式 AI 引擎
description: 本文向新手介绍如何使用声网 Go SDK 实现对话式 AI 引擎。
---

# 使用 Go SDK 实现对话式 AI 引擎

本文向新手介绍如何使用声网 Go SDK 实现对话式 AI 引擎。

Go SDK 旨在帮助开发者更轻松集成声网 RESTful API。该 SDK 具有如下特性：

- 简化通信流畅：通过封装 RESTful API 的请求和响应处理，让你与 RESTful API 的通信更加简单。
- 保障可用性：遇到 DNS 解析失败、网络错误、请求超时等网络问题时，会自动切换到最佳域名，确保 REST 服务的可用性。
- API 易用性：提供简洁易懂的 API，让你能轻松实现创建对话式智能体、停止对话式智能体等常用功能。
- 其他优势：基于 Go 语言编写，具有高效性、并发性、可扩展性。

## 前提条件

开始前请确保：

- 已集成 [Go](https://go.dev/dl/) 1.18 或以上版本。
- 已参考[开通服务](./enable-service.md)在声网控制台完成以下步骤：
    - 为你的项目开通声网对话式 AI 引擎。
    - 获取 App ID：声网随机生成的字符串，用于识别你的项目和调用对话式智能体 RESTful API。
    - 获取客户 ID 和客户密钥：用于在调用对话式 AI 引擎 RESTful API 时进行 HTTP 安全认证。
    - 生成临时 Token：Token 也称为动态密钥，用于在加入 RTC 频道时对用户鉴权。临时 Token 的有效期为 24 小时。在生产环境中，你需要参考[使用 Token 鉴权](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication)在你的 App 服务端生成 Token。
- 已参考[实现音视频互动](https://doc.shengwang.cn/doc/rtc/android/get-started/quick-start)集成 v4.5.1 及以上版本的实时互动 SDK，并在你的 App 中实现基本的实时音视频功能。
- 已获取大语言模型 (LLM) 供应商的 API key 和回调 URL。
- 已参考文本转语音 (TTS) 供应商的官方文档获取身份认证信息（token、appid 等）并了解相关参数配置方式。

## 创建项目并安装 SDK

#### 创建项目

参考如下步骤创建并配置新项目。

1. 创建一个名为 `test-convoai` 的空项目文件夹。

2. 进入 `test-convoai` 路径，执行如下命令初始化 Go 模块。

    ```shell
    go mod init test-convoai
    ```

3. 在项目路径下，新建一个空的 `main.go` 文件，我们会在这个文件中实现一个极简的对话式 AI 引擎任务。

#### 安装 SDK

在项目路径下，执行如下命令，安装 Go SDK。

    ```shell
    # 安装 Go SDK
    go get -u github.com/AgoraIO-Community/agora-rest-client-go
    # 更新依赖
    go mod tidy
    ```

## 实现对话式 AI 引擎

本节介绍实现对话式 AI 引擎的核心 Go 代码。你可以根据你的需求选择一种方式阅读本节内容：

- **快速跑通**：如果只想快速跑通示例代码，不关心实现细节。你可以复制下面的完整示例代码到 `main.go` 文件中，并参考[定义变量](#定义变量)配置相关参数，之后跳到[与智能体对话](#与智能体对话)章节继续跑通。

#### main.go 完整示例代码

```go
    package main

    import (
        "context"
        "log"
        "time"

        "github.com/AgoraIO-Community/agora-rest-client-go/agora/auth"
        "github.com/AgoraIO-Community/agora-rest-client-go/agora/domain"
        agoraLogger "github.com/AgoraIO-Community/agora-rest-client-go/agora/log"
        agoraUtils "github.com/AgoraIO-Community/agora-rest-client-go/agora/utils"
        "github.com/AgoraIO-Community/agora-rest-client-go/services/convoai"
        "github.com/AgoraIO-Community/agora-rest-client-go/services/convoai/req"
    )

    const (
        appId                 = "<your appId>"
        cname                 = "<your cname>"
        agentRtcUid           = "<your agent rtc uid>"
        username              = "<the username of basic auth credential>"
        password              = "<the password of basic auth credential>"
        agentRtcToken         = "<your agent rtc token>"
        llmURL                = "<your LLM URL>"
        llmAPIKey             = "<your LLM API Key>"
        llmModel              = "<your LLM model>"
        ttsBytedanceToken     = "<your bytedance tts token>"
        ttsBytedanceAppId     = "<your bytedance tts app id>"
        ttsBytedanceCluster   = "<your bytedance tts cluster>"
        ttsBytedanceVoiceType = "<your bytedance tts voice type>"
    )

    func main() {
        log.SetFlags(log.LstdFlags | log.Lshortfile)

        // 初始化对话式 AI 引擎 REST Client 配置
        config := &convoai.Config{
            AppID:      appId,
            Credential: auth.NewBasicAuthCredential(username, password),
            // 指定服务器所在区域，可选 CN、EU、AP、US
            // REST Client 会根据配置的区域自动切换使用最佳域名
            DomainArea: domain.CN,
            // 指定日志输出级别。可选 DebugLevel、InfoLevel、WarningLevel、ErrLevel
            // 要禁用日志输出，设置 logger 为 DiscardLogger
            Logger: agoraLogger.NewDefaultLogger(agoraLogger.DebugLevel),
            // 指定服务区域。可选 ChineseMainlandServiceRegion、GlobalServiceRegion
            // ChineseMainlandServiceRegion 和 GlobalServiceRegion 是两个不同的服务
            ServiceRegion: convoai.ChineseMainlandServiceRegion,
        }

        // 初始化对话式 AI 引擎 REST Client
        convoaiClient, err := convoai.NewClient(config)
        if err != nil {
            log.Fatalln(err)
        }
        ctx := context.Background()

        name := appId + ":" + cname

        // 创建对话式智能体
        joinResp, err := convoaiClient.Join(ctx, name, &req.JoinPropertiesReqBody{
            Token:           agentRtcToken,
            Channel:         cname,
            AgentRtcUId:     agentRtcUid,
            RemoteRtcUIds:   []string{"*"},
            EnableStringUId: agoraUtils.Ptr(false),
            IdleTimeout:     agoraUtils.Ptr(120),
            LLM: &req.JoinPropertiesCustomLLMBody{
                Url:    llmURL,
                APIKey: llmAPIKey,
                SystemMessages: []map[string]any{
                    {
                        "role":    "system",
                        "content": "You are a helpful chatbot。",
                    },
                },
                Params: map[string]any{
                    "model":      llmModel,
                    "max_tokens": 1024,
                },
                MaxHistory:      agoraUtils.Ptr(30),
                GreetingMessage: "Hello,how can I help you?",
            },
            TTS: &req.JoinPropertiesTTSBody{
                Vendor: req.BytedanceTTSVendor,
                Params: &req.TTSBytedanceVendorParams{
                    Token:       ttsBytedanceToken,
                    AppId:       ttsBytedanceAppId,
                    Cluster:     ttsBytedanceCluster,
                    VoiceType:   ttsBytedanceVoiceType,
                    SpeedRatio:  1.0,
                    VolumeRatio: 1.0,
                    PitchRatio:  1.0,
                    Emotion:     "happy",
                },
            },
        })
        if err != nil {
            log.Fatalln(err)
        }

        if joinResp.IsSuccess() {
            log.Printf("Join success:%+v", joinResp)
        } else {
            log.Printf("Join failed:%+v", joinResp)
            return
        }

        agentId := joinResp.SuccessResp.AgentId

        log.Printf("agentId:%s", agentId)

        defer func() {
            // 停止对话式智能体
            leaveResp, err := convoaiClient.Leave(ctx, agentId)
            if err != nil {
                log.Fatalln(err)
            }

            if leaveResp.IsSuccess() {
                log.Printf("Leave success:%+v", leaveResp)
            } else {
                log.Printf("Leave failed:%+v", leaveResp)
                return
            }
        }()

        // 列出对话式智能体
        listResp, err := convoaiClient.List(ctx,
            req.WithState(2),
            req.WithLimit(10),
        )
        if err != nil {
            log.Fatalln(err)
        }

        if listResp.IsSuccess() {
            log.Printf("List success:%+v", listResp)
        } else {
            log.Printf("List failed:%+v", listResp)
            return
        }

        if listResp.SuccessRes.Data.Count > 0 {
            for _, agent := range listResp.SuccessRes.Data.List {
                log.Printf("Agent:%+v\n", agent)
            }
        } else {
            log.Printf("No agent found\n")
        }

        // 保持智能体运行状态 60 秒
        time.Sleep(time.Second * 60)
    }
    ```

- **了解实现细节**：如果你想了解实现对话式 AI 引擎的各个核心步骤，或需要根据你的需求修改示例代码（例如使用 string 型 UID，或使用其他 TTS 供应商），可以继续阅读本节内容。

### 引入 SDK

在你的 `main.go` 文件中添加如下代码，以引入 Go SDK 中跑通快速开始需要用到的依赖项。

```go
package main

import (
	"context"
	"log"
	"time"

	"github.com/AgoraIO-Community/agora-rest-client-go/agora/auth"
	"github.com/AgoraIO-Community/agora-rest-client-go/agora/domain"
	agoraLogger "github.com/AgoraIO-Community/agora-rest-client-go/agora/log"
	agoraUtils "github.com/AgoraIO-Community/agora-rest-client-go/agora/utils"
	"github.com/AgoraIO-Community/agora-rest-client-go/services/convoai"
	"github.com/AgoraIO-Community/agora-rest-client-go/services/convoai/req"
)
```

### 定义变量

在 `main.go` 文件中，添加如下代码，定义或配置创建一个对话式智能体所需的关键参数。

```go
const (
    // 声网参数配置
	appId                 = "<your appId>"
	cname                 = "<your cname>"
	agentRtcUid           = "<your agent rtc uid>"
	username              = "<the username of basic auth credential>"
	password              = "<the password of basic auth credential>"
	agentRtcToken         = "<your agent rtc token>"

    // LLM 参数配置
	llmURL                = "<your LLM URL>"
	llmAPIKey             = "<your LLM API Key>"
	llmModel              = "<your LLM model>"

    // TTS 参数配置（以火山 TTS 为例）
	ttsBytedanceToken     = "<your bytedance tts token>"
	ttsBytedanceAppId     = "<your bytedance tts app id>"
	ttsBytedanceCluster   = "<your bytedance tts cluster>"
	ttsBytedanceVoiceType = "<your bytedance tts voice type>"
)
```
其中，需要配置的参数可以分为三类：

- 声网参数配置：
  - `appId`：你的声网 App ID。
  - `cname`：对话式智能体加入的 RTC 频道名。你需要填入创建临时 Token 时使用的频道名。
  - `agentRtcUid`：对话式智能体在 RTC 频道内的用户 ID。默认使用 Int 型 UID，例如 `123`，如需使用 String 型 UID，例如 `"123"`，请将后续步骤代码中的 `EnableStringUId` 设置为 `true`。
  - `username` 和 `password`：你的声网客户 ID 和客户密钥。
  - `agentRtcToken`：对话式智能体加入 RTC 频道使用的 Token。填入临时 Token 即可。
- LLM 参数配置：
  - `llmURL`：LLM API 回调地址。
  - `llmAPIKey`：LLM API Key。
  - `llmModel`：大语言模型名。
- TTS 参数配置：示例代码中以火山 TTS 为例，你可以根据实际情况选择其他 TTS 供应商，并参考 [`JoinPropertiesTTSBody`](https://doc.shengwang.cn/api-ref/convoai/go/go-api/struct#joinpropertiesttsbody) 了解具体配置方式。

### 创建并初始化 Client

在 `main` 函数中初始化声网配置，调用 [`NewClient`](https://doc.shengwang.cn/api-ref/convoai/go/go-api/client#newclient) 创建对话式 AI 引擎 REST Client，并设置日志输出格式：

```go
func main() {
    log.SetFlags(log.LstdFlags | log.Lshortfile)

    // 初始化对话式 AI 引擎 REST Client 配置
    config := &convoai.Config{
        AppID:      appId,
        Credential: auth.NewBasicAuthCredential(username, password),
        // 指定服务器所在区域，可选 CN、EU、AP、US
        // REST Client 会根据配置的区域自动切换使用最佳域名
        DomainArea: domain.CN,
        // 指定日志输出级别
        // 要禁用日志输出
        Logger: agoraLogger.NewDefaultLogger(agoraLogger.DebugLevel),
        // 指定服务区域，可选 ChineseMainlandServiceRegion、GlobalServiceRegion
        // ChineseMainlandServiceRegion 和 GlobalServiceRegion 是两个不同的服务
        ServiceRegion: convoai.ChineseMainlandServiceRegion,
    }

    // 初始化对话式 AI 引擎 REST Client
    convoaiClient, err := convoai.NewClient(config)
    if err != nil {
        log.Fatalln(err)
    }
    ctx := context.Background()

    // ... 后续代码
}
```

### 创建对话式智能体

使用 [`Join`](https://doc.shengwang.cn/api-ref/convoai/go/go-api/client#join) 方法创建对话式智能体，并传入 LLM 和 TTS 的配置参数（[`JoinPropertiesCustomLLMBody`](https://doc.shengwang.cn/api-ref/convoai/go/go-api/struct#joinpropertiescustomllmbody) 和 [`JoinPropertiesTTSBody`](https://doc.shengwang.cn/api-ref/convoai/go/go-api/struct#joinpropertiesttsbody)）：

```go
// ... 前面的配置代码

// 为智能体设置名称，通常使用 appId:频道名 的格式
name := appId + ":" + cname

// 创建对话式智能体
joinResp, err := convoaiClient.Join(ctx, name, &req.JoinPropertiesReqBody{
    Token:           agentRtcToken,
    Channel:         cname,
    AgentRtcUId:     agentRtcUid,
    RemoteRtcUIds:   []string{"*"},
    EnableStringUId: agoraUtils.Ptr(false),
    IdleTimeout:     agoraUtils.Ptr(120),
    LLM: &req.JoinPropertiesCustomLLMBody{
        Url:    llmURL,
        APIKey: llmAPIKey,
        SystemMessages: []map[string]any{
            {
                "role":    "system",
                "content": "You are a helpful chatbot。",
            },
        },
        Params: map[string]any{
            "model":      llmModel,
            "max_tokens": 1024,
        },
        MaxHistory:      agoraUtils.Ptr(30),
        GreetingMessage: "Hello,how can I help you?",
    },
    TTS: &req.JoinPropertiesTTSBody{
        Vendor: req.BytedanceTTSVendor,
        Params: &req.TTSBytedanceVendorParams{
            Token:       ttsBytedanceToken,
            AppId:       ttsBytedanceAppId,
            Cluster:     ttsBytedanceCluster,
            VoiceType:   ttsBytedanceVoiceType,
            SpeedRatio:  1.0,
            VolumeRatio: 1.0,
            PitchRatio:  1.0,
            Emotion:     "happy",
        },
    },
})
if err != nil {
    log.Fatalln(err)
}

if joinResp.IsSuccess() {
    log.Printf("Join success:%+v", joinResp)
} else {
    log.Printf("Join failed:%+v", joinResp)
    return
}

// 获取对话式智能体 ID，用于后续操作
agentId := joinResp.SuccessResp.AgentId
log.Printf("agentId:%s", agentId)
```

### 停止对话式智能体

为了确保程序结束时能够正确停止对话式智能体，添加延迟执行的 `Leave` 操作：

```go
// ... 前面的代码

// 设置延迟执行，确保程序结束时停止对话式智能体
defer func() {
    // 停止对话式智能体
    leaveResp, err := convoaiClient.Leave(ctx, agentId)
    if err != nil {
        log.Fatalln(err)
    }

    if leaveResp.IsSuccess() {
        log.Printf("Leave success:%+v", leaveResp)
    } else {
        log.Printf("Leave failed:%+v", leaveResp)
        return
    }
}()

// ... 后续代码
```

### 列出当前对话式智能体

使用 [`List`](https://doc.shengwang.cn/api-ref/convoai/go/go-api/client#list) 方法获取当前运行的对话式智能体列表：

```go
// ... 前面的代码

// 列出对话式智能体
listResp, err := convoaiClient.List(ctx,
    req.WithState(2),
    req.WithLimit(10),
)
if err != nil {
    log.Fatalln(err)
}

if listResp.IsSuccess() {
    log.Printf("List success:%+v", listResp)
} else {
    log.Printf("List failed:%+v", listResp)
    return
}

if listResp.SuccessRes.Data.Count > 0 {
    for _, agent := range listResp.SuccessRes.Data.List {
        log.Printf("Agent:%+v\n", agent)
    }
} else {
    log.Printf("No agent found\n")
}

// 保持智能体运行状态 60 秒
time.Sleep(time.Second * 60)
```

## 与智能体对话

本节介绍如何让智能体和用户加入同一个 RTC 频道，并实现对话互动。

### 用户加入频道

在你的 App 中使用和智能体不同的用户 ID 和相同的 Token 和频道名加入 RTC 频道。

> 信息
> 你也可以使用[实时互动 Web Demo](https://webdemo.agora.io/index.html) 加入 RTC 频道。完成**初始化设置**后，在左侧菜单选择**快速开始-音视频通话**，填入和智能体不同的用户 ID 和相同的 Token 和频道名加入 RTC 频道。

### 智能体加入频道

在项目路径下，执行如下命令，启动智能体。

```shell
go run main.go
```

运行成功后，你会看到如下日志：

```shell
DEBUG agora-rest-client-go 2025/03/20 07:20:34 client.go:148: http response:{"agent_id":"1NT29X0XEAxxxxxxPHSDRNZYF","create_ts":1742455234,"status":"RUNNING"}
2025/03/20 15:20:34 main.go:103: Join success:&{Response:{BaseResponse:0xc0002169c0 ErrResponse:{Detail: Reason:}} SuccessResp:{AgentId:1NT29X0XEAxxxxxxPHSDRNZYF CreateTs:1742455234 Status:RUNNING}}
2025/03/20 15:20:34 main.go:111: agentId:1NT29X0XEAxxxxxxPHSDRNZYF
```

之后，智能体会加入 RTC 频道，并向用户发送问候语。

> 注意
> 智能体加入频道后，如果频道内没有其他用户，一段时间后（示例代码中设置为 120 秒）智能体会自动离开频道。

### 用户与智能体对话

双方加入频道后，用户可以直接和智能体对话，智能体会使用语音回答。

## 参考信息

### 示例项目

声网提供了开源的示例项目供你参考，你可以前往下载或查看其中的源代码。

- [agora-rest-client-go](https://gitee.com/agoraio-community/agora-rest-client-go/tree/main/examples/convoai)

- [agora-rest-client-go](https://github.com/AgoraIO-Community/agora-rest-client-go/tree/main/examples/convoai)

### API 参考

- [对话式 AI 引擎 Go SDK API 参考](https://doc.shengwang.cn/api-ref/convoai/go/go-api/overview)
