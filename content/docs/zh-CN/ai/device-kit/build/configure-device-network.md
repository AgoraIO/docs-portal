---
title: 配置设备网络
description: 通过配套 Android App，把 R1 设备接入 Wi-Fi。
---

R1 Kit 在 `app` 目录中提供了一个 Android App，用于通过 BLE 帮设备完成联网。这个 App 基于声网的蓝牙配网库构建。

## 配网前请确认

- 手机已开启蓝牙和定位
- R1 设备处于可发现状态
- 手机与设备距离在 5 米内
- 手机当前连接的是可上网的 2.4 GHz Wi-Fi
- Android 12 及以上系统已授予 `BLUETOOTH_SCAN` 和 `BLUETOOTH_CONNECT`

## 连接到 Wi-Fi

1. 在 App 弹出权限请求时授权所需权限。
2. 确认当前 Wi-Fi 信息。
3. 输入 Wi-Fi 密码。
4. 扫描并选择目标蓝牙设备。
5. 点击 **Connect** 建立连接。
6. 连接成功后点击 **Configure Network**，把 Wi-Fi 凭据下发给设备。
7. 配网完成后点击 **Disconnect** 断开蓝牙连接。

## 故障排查

- **扫描不到设备**：确认蓝牙和定位已开启
- **连接失败**：重新扫描或重启设备
- **配网失败**：确认 Wi-Fi 密码正确且网络可用

## 相关页面

- [设备控制](device-controls.md)
- [构建并烧录固件](build-and-flash-firmware.md)
