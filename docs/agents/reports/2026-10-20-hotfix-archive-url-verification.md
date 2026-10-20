# 历史 API 外链验真（2026-10-20）

依据用户批准D006：历史外链、当前本站。源固定终点 `5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1` 的版本配置与原 `ApiVersionSelector` 拼接逻辑为依据，archive build ID不等于SDK版本。以下验证由主控完成，不是实施者测试假设。

联网方式：Markdown代理及web入口不可达，已告知后改用curl跟踪最终地址和Cheerio抽取title/main元数据；随后使用Chrome154专用隔离浏览器核对实际版本选择器，关闭会话后不保留登录状态。只看HTTP200不能识别软404。

| 对应源/SDK版本 | 原官方archive landing（统一前缀 `https://doc-archive.shengwang.cn/archive/`） | 实际结果 |
| --- | --- | --- |
| #2113 Android4.6.2 | `0.0.492/api-ref/rtc/android/API/rtc_api_overview` | 原地址最终200、真实Android概览；浏览器当前选择器v4.6.2。 |
| #2113 iOS4.6.2 | `0.0.492/api-ref/rtc/ios/API/rtc_api_overview` | 原地址最终200、真实iOS概览；浏览器v4.6.2。 |
| #2113 Flutter6.6.2 | `0.0.492/api-ref/rtc/flutter/API/rtc_api_overview` | 原地址最终200、真实Flutter概览；浏览器v6.6.2。 |
| #2113 RN4.6.2 | `0.0.492/api-ref/rtc/rn/API/rtc_api_overview` | 原地址最终200、真实React Native概览；浏览器v4.6.2；并已从本站下拉实际点击到该页。 |
| #2083 RTSA C1.9.7 | `0.0.492/api-ref/rtsa/c/overview` | 原地址最终200、真实C API概览；浏览器v1.9.7。 |
| #2067 RTM Web2.2.4 | `0.0.492/api-ref/rtm2/javascript/toc-configuration/configuration` | 原地址最终200、真实RTM配置页；浏览器v2.2.4。 |
| #2094 Android4.6.4 | `0.0.519/api-ref/rtc/android/API/rtc_api_overview` | 最终跳 `https://doc.shengwang.cn/404`，HTTP200软404；不可发布，暂无已验证同版本替代。 |
| #2094 iOS4.6.4 | `0.0.519/api-ref/rtc/ios/API/rtc_api_overview` | 同上；不可拿0.0.492的4.6.2冒充4.6.4。 |
| #2094 macOS4.6.2 | `0.0.519/api-ref/rtc/macos/API/rtc_api_overview` | 原址软404；官方同路径0.0.492经浏览器确认v4.6.2，可采用同SDK版本备用并记录偏离source。 |
| #2094 C++4.6.2 | `0.0.519/api-ref/rtc/windows/API/rtc_api_overview` | 原址软404；官方同路径0.0.492经浏览器确认v4.6.2，可采用同SDK版本备用；旧platform key是windows。 |

附加排查：Android0.0.511同样跳404；`doc.shengwang.cn/archive/0.0.519` 下Android/macOS直接404，无效。未猜测未验证的其他build。

另一个当前RTSA源码链接 `https://doc.shengwang.cn/api-ref/rtsa/c/agora__rtc__api_8h_source.html#l01930` 带/不带.html均404；archive0.0.492同路径返回200却不是目标方法/行号页，因此不能当有效源码替代。当前CloudProxy指南改链到本站有限参考页，只迁移固定header的CONFIG_RTC_PROXY guard、枚举和函数声明，不编造返回值或运行行为。

结论：10个历史意图中8个有正确版本的可用外链（其中2个为明确记录的同版本备用），Android/iOS4.6.4两项待旧站恢复或提供有效官方地址。此报告不是可用性永久保证，不代表PR已合并/部署。
