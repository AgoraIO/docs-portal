# RTC #2098 完整指南补齐计划

来源 `7c18a97504d2ffdd2d5eb00bca979735ec87c5f7`，终点 `5d03551cf64cd057ccfe8d5b256d9c4778e8fbb1`；15个源文件到终点无后续覆盖。目标基线 `7c6c60ead44406e69906c5c3808cd489784aa89e`。独立工作树 `fix-hotfix-pr2098`、分支 `codex/fix-hotfix-pr2098`，最终PR进指定迁移分支，不自动合并。

## 批准的生产写集（8 文件）

1. `content/docs/zh-CN/realtime-media/rtc/build/video/advanced-beauty.mdx`：四平台三处旧版本范围共12处，恢复 v4.7.0 或 v4.5.x 中 >=4.5.2.9（不扩大为任意>=4.7）；Android/iOS人脸检测用途，四平台Detail置信度介绍。
2. `content/docs/zh-CN/realtime-media/rtc/build/video/advanced-beauty-460.mdx`：共享片段四平台恢复v4.6.x范围/免费措辞，2.1/2.0/Legacy三路选择及前提，不重写已有美颜API或美妆条件。
3. `content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.mdx`
4. `content/docs/zh-CN/realtime-media/rtc/build/audio/audio-quick-start.mdx`

两快速开始只改Android防混淆：不开R8无需配置、快速keep、JNI精细规则、AAR自动/JAR手动、完整Gradle。Java keep仍io.agora.**，不是Maven包名cn.shengwang。

5. `content/docs/zh-CN/realtime-media/rtc/build/optimize-and-operate/reduce-app-size.mdx`：仅Android/iOS新增FFmpeg条件教程及依赖/原生播放fallback，Android音频库条目改名，iOS音频subspec在iOS/macOS两共享副本同步；不将iOS教程宣布为macOS新功能，不全局替视频库名。平台链接需命中正确iOS片段。
6. `content/docs/zh-CN/realtime-media/rtc/reference/release-notes.mdx`：仅Android全局caution补升级>=4.6.0须迁Maven io.agora.rtc→cn.shengwang.rtc；4.7.0四平台主体已完整，不重抄。
7. `content/docs/zh-CN/reference/faq/product/audio_format.mdx`：仅Android基础单音轨移除ASF/AVI/WMA、扩展表ARM/FALC→AMR/FLAC、Lite原生能力与WMA条件合并；Windows WMA、扩展表、iOS Lite、3GP、MP4第二轨限制保留。
8. `src/components/docs-overview/sdk-downloads-data.zh-cn.ts`：RTC首页实际共享目录Native Android/iOS/macOS/Windows旧latest应与专用目录已有正确4.7.0八包镜像；源有8URLs/6MD5/15体积/2026-09-22。不改其它产品平台、不猜新Central URL/不存在MD5体积，旧4.6.3包管理链接不能挂新版本。

已有历史下载条目保留；可新增4.7对象并将旧latest标签/标记降为历史，避免删可用历史下载。不要新API归档选择器或UI。专用 `rtc-sdk-downloads-data.zh-cn.ts` 与下载正文均已正确，不改；source homepage旧组件不恢复。

## 实施与验收

- 完整15source文件及所有有效hunk→target承接/补齐映射写入 `docs/agents/reports/2026-10-19-hotfix-pr2098-fix.md`，不能仅记录最初审计样本。
- 新增真实章节/平台块/表格/数据消费者回归 `src/lib/rtc-pr2098-sync.test.ts`，先RED，再最小GREEN；四平台逐项检测，不能全文同名即过。
- 与#2108/#1224同release及reduce文件不同小节，保留CDN日期/提醒/正确下载锚点；两quickstart现有双仓库+mavenCentral配置不变。组合树无论是否文本冲突都核验双方。
- frozen install、定向、types、所有修改MDX实际编译与语法、links/fragment、Biome、允许区间外一致性/历史数据保护/diffcheck；不改锁文件/英文/runtime/meta/归档策略。
- full/build/preview主控独占调度，未经放行不得自启。轻量提交READY_WITHOUT_FULL后独立spec→quality，root复跑并做组合验收；由root推送与建PR，未合入不称生效。
