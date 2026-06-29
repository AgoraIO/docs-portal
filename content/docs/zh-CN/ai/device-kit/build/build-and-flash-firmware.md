---
title: 构建并烧录固件
description: 构建 R1 固件、指向你的服务端，并烧录到设备上。
---

按照以下步骤完成 R1 设备固件的准备、构建和烧录。

## 下载并配置固件工程

1. 克隆 `bk_aidk` 项目：

   ```shell
   git clone --recurse-submodules https://github.com/bekencorp/bk_aidk.git -b ai_release/v2.0.1
   cd bk_aidk
   git checkout ai_release/v2.0.1.8
   git submodule update --recursive
   ```

2. 用示例目录替换 `projects`：

   ```shell
   rm -rf <bk_aidk_path>/projects/
   cp -r ./projects <bk_aidk_path>/projects
   ```

3. 修改 `projects/common_components/network_transfer/agora_rtc/agora_config.h` 中的服务端地址：

   ```c
   #define CONFIG_AGENT_SERVER_URL "http://192.168.1.100:5001"
   ```

把它替换成你部署的服务端地址。

## 构建固件

```shell
cd <bk_aidk_path>
make bk7258 PROJECT=beken_genie
```

## 烧录固件

固件构建成功后，把它烧录到 R1 设备。具体步骤请参考 BK 官方文档。

## 相关页面

- [运行 Demo Server](run-the-demo-server.md)
- [运行 R1 Demo](run-the-r1-demo.mdx)
