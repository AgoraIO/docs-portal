---
title: 客户端鉴权
description: 客户端鉴权，用于介绍 RTM 在对应平台上的具体能力配置、使用方法和行为约束。
---

鉴权是指在用户访问你的系统前，对其进行身份校验。用户在使用声网服务，如加入音视频通话或登录信令系统时，声网使用 Token 对其鉴权。

RTM 提供 Message Channel 和 Stream Channel 两种频道类型，使用不同类型的频道，对应的 Token 类型也不同：

- 使用 Message Channel：只需在调用 `login` 方法登录 RTM 系统时，传入开通了 RTM 服务的 Token（以下简称 RTM Token）。
- 使用 Stream Channel：在使用 RTM Token 鉴权的基础上，还需要在调用 `join` 方法加入 Stream Channel 时传入开通了 RTC 服务的 Token（以下简称 RTC Token）。

本文展示如何搭建一个使用 RTM Token 鉴权的客户端。使用 RTC Token 请参考<a href=>使用 RTC Token 鉴权</a>。

## 鉴权流程

下图展示了 RTM Token 鉴权的基本流程：

![Token 流程](/img/rtm2/token-authentication-javascript.svg)

RTM Token 在 App 服务器上生成，其最长有效期为 24 小时。当用户从你的 App 客户端登录到 RTM 系统时，声网平台会读取该 Token 中包含的信息，并进行校验。Token 包含以下信息：

- 你在声网控制台创建项目时生成的 App ID
- RTM 用户 ID
- RTM Token 过期的 Unix 时间戳

## 前提条件

开始前，请确保你的项目或使用的声网产品满足如下条件：

- 已开启 App 证书的声网项目以及项目的 App ID，可参考[开通服务](../../get-started/enable-service.md)获取。
- 已在你的项目中集成实时消息 SDK 并实现基本的收发消息功能，详见[实现收发消息](../../get-started/quick-start.md)。

## 实现用户鉴权

本节展示如何使用 Token 对客户端的用户进行鉴权。

> **信息**
> - 此示例服务器仅用于演示，请勿用于生产环境中。
> - 生成 RTM Token 时填入的用户 ID 和 App ID，需要和初始化实例时填入的用户 ID 和 App ID 一致。

1. 创建一个项目文件夹，其中包含如下文件：
   - `index.html`：用户界面
   - `client.js`：使用 RTM SDK 的 App 逻辑
   ```text
   |-- SDK/libs/agora-rtm-version.min.js
   |-- index.html
   |-- client.js
   ```

2. 将官网下载的 SDK 中的 `libs` 文件夹中的 JS 文件保存到你的项目下。

3. 在 `index.html` 中加入以下代码，创建用户界面。
    - 你需要将 `<path to the JS file>` 替换为你上一步保存的 JS 文件的路径。

   ```html
   <html>
   <head>
      <title>RTM Token demo</title>
   </head>
   <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
   <body>
      <h1>Token demo</h1>
      <script src="<path to the JS file>"></script>
    <script src="./client.js"></script>

   </body>
   </html>
   ```

4. 将如下代码贴入 `client.js` 文件中，实现客户端鉴权逻辑。
    - 将 `` 替换为你的 App ID。该 App ID 必须与 Token 生成代码中的 App ID 一致。
    - 将 `` 替换为你部署好的本地 Golang 服务器的主机 URL 和端口，如 `10.53.3.234:8082` 。

    ```js
    // 是否开启 Token 更新循环
    let started = true;

    function sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    function fetchToken(uid) {
        return new Promise(function (resolve) {
            axios
                .post(
                    "http:///fetch_rtm_token",
                    {
                        uid: uid,
                    },
                    {
                        headers: {
                            "Content-Type": "application/json; charset=UTF-8",
                        },
                    },
                )
                .then(function (response) {
                    const token = response.data.token;
                    resolve(token);
                })
                .catch(function (error) {
                    console.log(error);
                });
        });
    }

    async function loginRTM() {
        // 你的 App ID
        const appID = "";

        // 设置 RTM 用户 ID
        const uid = "1234";

        // 获取 Token
        const rtmToken = await fetchToken(uid);

        // 初始化客户端
        const client = new AgoraRTM.RTM(appID, uid, );

        // 显示连接状态变化
        client.addEventlistener("status", function (state, reason) {
            console.log("State changed To: " + state + " Reason: " + reason);
        });

        // 登录 RTM 系统
        await client.login();

        while (started) {
            // 每 30 秒更新一次 Token。此更新频率是为了功能展示，生产环境建议每小时更新一次
            await sleep(30 * 1000);
            const newToken = await fetchToken(uid);
            await client.renewToken(newToken);

            let currentDate = new Date();
            let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
            console.log("Renew RTM token at " + time);
        }
    }

        async function loginRTM() {
            // 你的 App ID
            const appID = "";

            // 设置 RTM 用户 ID
            const uid = "1234";

            // 获取 Token
            const token = await fetchToken(uid);

            // 初始化客户端
            const client = new AgoraRTM.RTM(appID, uid);

            // 显示连接状态变化
            client.on('status', function (state, reason) {
                console.log("State changed To: " + state + " Reason: " + reason)
            });

            // 登录 RTM 系统
            await client.login();

            while (started) {
                // 每 30 秒更新一次 Token。此更新频率是为了功能展示，生产环境建议每小时更新一次
                await sleep(30 * 1000);
                const newToken = await fetchToken(uid);
                await client.renewToken(newToken);

                let currentDate = new Date();
                let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
                console.log("Renew RTM token at " + time);
            }
        }

        loginRTM();
    ```

   在上述代码示例中，你可以看到 Token 与客户端的以下代码逻辑有关：
   - 使用 App ID、用户 ID 和 Token 初始化 RTM 实例。App ID 和用户 ID 必须和生成 Token 时使用的 App ID 和用户 ID 一致。
   - 调用 `login` 方法登录 RTM 系统。
   - 定时从服务端获取新的 Token 并调用 `renewToken` 方法更新 SDK 的 Token。声网建议你定时（例如每小时）从服务端生成 Token 并调用 `renewToken` 方法更新 SDK 的 Token，保证 SDK 的 Token 一直处于有效状态。

5. 用支持的浏览器打开 `index.html` 文件，进入开发者模式。在控制台可以看到客户端执行以下操作：
   - 成功登录 RTM 系统。
   - 每隔 30 秒调用 `renewToken` 方法更新 Token。

## 开发注意事项

### App 证书与 RTM Token

生成 RTM Token 需要先在控制台启用对应项目的 App 证书。项目一旦开启了 App 证书，就必须使用 RTM Token 鉴权。

### RTM Token 过期<a name="expiration"></a>

你可以根据业务需求指定 RTM Token 的有效期 (最长为 24 小时)。当 RTM Token 将在 30 秒后过期时，会触发 `tokenPrivilegeWillExpire` 回调，提醒用户 Token 即将过期。收到该回调时，你可以在服务端重新生成 RTM Token，然后调用 `renewToken` 方法，将新生成的 RTM Token 传给 SDK。

如果 Token 已过期，则 SDK 会触发 `linkState` 回调，报告如下内容：

- 当前状态（`currentState`）：`FAILED`
- 触发本次状态迁移的操作（`operation`）：`SERVER_REJECT`
- 状态迁移的原因（`reason`）：`TOKEN_EXPIRED`

此时，用户需要先在端侧更新 Token，排除故障后再调用 `login` 方法重新登录。

> **信息**
> 你可以通过 `tokenPrivilegeWillExpire` 回调和 `linkState` 回调进行 Token 过期处理，但声网推荐你通过定时（例如每小时）更新 Token 来解决 Token 过期问题。
