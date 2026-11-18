# zh-CN FAQ Migration Mapping

Generated: 2026-07-08T04:06:48.746Z

## Summary

- Source root: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source`
- Source files: 110
- Migrated: 107
- Needs manual review: 3
- Rows with conversion notes: 31
- No English counterpart: 23
- Copied local assets: 28
- Online integration checklist: 72 entries
- Online entries missing in source: 0
- Online entries missing in target: 0

## Online Integration Checklist

Source: https://doc.shengwang.cn/faq/list?category=integration-issues&platform=all&product=all

All online integration entries are represented in the migration.

## Mapping

| Source FAQ | Online integration | Target zh-CN path | English canonical path | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| `docs-faq/adjust-music-volume.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/adjust_music_volume.mdx` | `content/docs/en/api-reference/faq/quality/adjust_music_volume.mdx` | migrated |  |
| `docs-faq/allow-haptics.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/allow_haptics.mdx` | none | migrated |  |
| `docs-faq/android-background.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/android_background.mdx` | `content/docs/en/api-reference/faq/quality/android_background.mdx` | migrated |  |
| `docs-faq/android-noaudio.mdx` | no | `content/docs/zh-CN/api-reference/faq/other/android_noaudio.mdx` | `content/docs/en/api-reference/faq/other/android_noaudio.mdx` | migrated |  |
| `docs-faq/app-exit.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/abnormal_exit.mdx` | `content/docs/en/api-reference/faq/integration/abnormal_exit.mdx` | migrated |  |
| `docs-faq/appid-to-token.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/appid_to_token.mdx` | none | migrated |  |
| `docs-faq/arch-error.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/ios_app_unity_reports_error.mdx` | `content/docs/en/api-reference/faq/integration/ios_app_unity_reports_error.mdx` | migrated |  |
| `docs-faq/audience-event.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/audience_event.mdx` | `content/docs/en/api-reference/faq/integration/audience_event.mdx` | migrated | normalized-table-slot |
| `docs-faq/audio-format.mdx` | no | `content/docs/zh-CN/api-reference/faq/product/audio_format.mdx` | `content/docs/en/api-reference/faq/product/audio_format.mdx` | migrated |  |
| `docs-faq/audio-freeze.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/audio_freeze.mdx` | `content/docs/en/api-reference/faq/quality/audio_freeze.mdx` | migrated | normalized-html-table<br />normalized-table-header:tableHeaderMergeCell |
| `docs-faq/audio-low.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/audio_low.mdx` | `content/docs/en/api-reference/faq/quality/audio_low.mdx` | migrated |  |
| `docs-faq/audio-noise.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/audio_noise.mdx` | `content/docs/en/api-reference/faq/quality/audio_noise.mdx` | migrated | normalized-html-table<br />normalized-table-header:tableHeaderMergeCell |
| `docs-faq/audio-role.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/audio_role.mdx` | `content/docs/en/api-reference/faq/quality/audio_role.mdx` | migrated |  |
| `docs-faq/audio_change.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/android_audio_routing_change.mdx` | `content/docs/en/api-reference/faq/integration/android_audio_routing_change.mdx` | migrated |  |
| `docs-faq/billing-account.mdx` | no | `content/docs/zh-CN/api-reference/faq/account/billing_account.mdx` | `content/docs/en/api-reference/faq/account/billing_account.mdx` | migrated | copied-assets:1 |
| `docs-faq/billing-basis.mdx` | no | `content/docs/zh-CN/api-reference/faq/account/billing_basis.mdx` | `content/docs/en/api-reference/faq/account/billing_basis.mdx` | migrated |  |
| `docs-faq/billing-free.mdx` | no | `content/docs/zh-CN/api-reference/faq/account/billing_free.mdx` | `content/docs/en/api-reference/faq/account/billing_free.mdx` | migrated |  |
| `docs-faq/billing-package.mdx` | no | `content/docs/zh-CN/api-reference/faq/account/billing_package.mdx` | none | needs_review | missing-category-frontmatter; mapped to account-and-billing |
| `docs-faq/bucket-region.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/bucket_region.mdx` | `content/docs/en/api-reference/faq/integration/bucket_region.mdx` | migrated |  |
| `docs-faq/business-billing.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/call_duration.mdx` | `content/docs/en/api-reference/faq/integration/call_duration.mdx` | migrated |  |
| `docs-faq/call-browser.mdx` | yes | `content/docs/zh-CN/api-reference/faq/product/call_api_in_browser.mdx` | `content/docs/en/api-reference/faq/product/call_api_in_browser.mdx` | migrated |  |
| `docs-faq/camera-exposure-focus.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/camera_exposure_focus.mdx` | `content/docs/en/api-reference/faq/integration/camera_exposure_focus.mdx` | migrated |  |
| `docs-faq/capacity.mdx` | no | `content/docs/zh-CN/api-reference/faq/product/capacity.mdx` | `content/docs/en/api-reference/faq/product/capacity.mdx` | migrated |  |
| `docs-faq/channel-issues.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/channel.mdx` | `content/docs/en/api-reference/faq/integration/channel.mdx` | migrated |  |
| `docs-faq/chatroom.mdx` | no | `content/docs/zh-CN/api-reference/faq/other/chatroom.mdx` | none | needs_review | missing-frontmatter; mapped to other-issues |
| `docs-faq/class-audio-video.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/audio_video_issues_in_classroom.mdx` | `content/docs/en/api-reference/faq/quality/audio_video_issues_in_classroom.mdx` | migrated | normalized-code-language:js->javascript<br />needs-image-width-review:/img/flexible-classroom/browser-setting.png:80%<br />needs-image-width-review:/img/flexible-classroom/browser-camera.png:80%<br />needs-image-width-review:/img/flexible-classroom/browser-camera-grant.png:80%<br />needs-image-width-review:/img/flexible-classroom/audio-video-disable-1.png:70%<br />needs-image-width-review:/img/flexible-classroom/audio-video-disable-2.png:70%<br />needs-image-width-review:https://web-cdn.agora.io/docs-files/1679998107736:60%<br />needs-image-width-review:https://web-cdn.agora.io/docs-files/1679998119366:60%<br />needs-image-width-review:https://web-cdn.agora.io/docs-files/1679998128665:60%<br />needs-image-width-review:/img/flexible-classroom/screensharewithaudio001.png:70%<br />needs-image-width-review:/img/flexible-classroom/screensharewithaudio002.png:70%<br />copied-assets:7 |
| `docs-faq/class-courseware.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/cant_upload_courseware.mdx` | `content/docs/en/api-reference/faq/integration/cant_upload_courseware.mdx` | migrated | needs-image-width-review:https://web-cdn.agora.io/docs-files/1680084185700:70% |
| `docs-faq/class-custom-ui.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/class_custom_ui.mdx` | none | migrated |  |
| `docs-faq/class-dynamic.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/dynamic_storage_path.mdx` | `content/docs/en/api-reference/faq/integration/dynamic_storage_path.mdx` | migrated |  |
| `docs-faq/class-errors.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/common_mistakes_flexible_classroom.mdx` | `content/docs/en/api-reference/faq/integration/common_mistakes_flexible_classroom.mdx` | migrated |  |
| `docs-faq/class-im.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/chat_issues.mdx` | `content/docs/en/api-reference/faq/integration/chat_issues.mdx` | migrated |  |
| `docs-faq/class-language.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/multi_language_support.mdx` | `content/docs/en/api-reference/faq/integration/multi_language_support.mdx` | migrated |  |
| `docs-faq/class-packaging.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/class_packaging.mdx` | `content/docs/en/api-reference/faq/integration/class_packaging.mdx` | migrated | copied-assets:2 |
| `docs-faq/class-properties.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/agora_class_custom_properties.mdx` | `content/docs/en/api-reference/faq/integration/agora_class_custom_properties.mdx` | migrated |  |
| `docs-faq/class-record.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/class_recording_fails.mdx` | `content/docs/en/api-reference/faq/integration/class_recording_fails.mdx` | migrated | copied-assets:1 |
| `docs-faq/class-restapi.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/obtain_restful_api_id.mdx` | `content/docs/en/api-reference/faq/integration/obtain_restful_api_id.mdx` | migrated |  |
| `docs-faq/class-states.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/classroom_statuses.mdx` | `content/docs/en/api-reference/faq/integration/classroom_statuses.mdx` | migrated | normalized-table-slot |
| `docs-faq/class-stop.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/stop_class.mdx` | `content/docs/en/api-reference/faq/integration/stop_class.mdx` | migrated |  |
| `docs-faq/class-threea.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/turn_off_3a_config.mdx` | `content/docs/en/api-reference/faq/integration/turn_off_3a_config.mdx` | migrated |  |
| `docs-faq/cmd-control-record.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/cmd_control_record.mdx` | `content/docs/en/api-reference/faq/integration/cmd_control_record.mdx` | migrated |  |
| `docs-faq/cocoapods-problems.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/cocoapods_problems.mdx` | none | migrated |  |
| `docs-faq/console-account-faq.mdx` | no | `content/docs/zh-CN/api-reference/faq/account/console_account_faq.mdx` | `content/docs/en/api-reference/faq/account/console_account_faq.mdx` | migrated |  |
| `docs-faq/console-error.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/console_error_web.mdx` | `content/docs/en/api-reference/faq/integration/console_error_web.mdx` | migrated |  |
| `docs-faq/convoai-cloud-recording.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/convoai_cloud_recording.mdx` | none | migrated | normalized-html-table<br />normalized-table-header:TableHeaderehy2i07jgo |
| `docs-faq/coupon-code.mdx` | no | `content/docs/zh-CN/api-reference/faq/account/coupon_code.mdx` | none | migrated |  |
| `docs-faq/device-occupied.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/device_occupied.mdx` | `content/docs/en/api-reference/faq/quality/device_occupied.mdx` | migrated |  |
| `docs-faq/diff-setenabled-setmuted.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/set_enabled_set_muted.mdx` | `content/docs/en/api-reference/faq/integration/set_enabled_set_muted.mdx` | migrated | normalized-html-table<br />normalized-table-header:TableHeadermqday52dqe<br />normalized-table-slot |
| `docs-faq/differ-agora-cdn.mdx` | no | `content/docs/zh-CN/api-reference/faq/product/differ_agora_cdn.mdx` | `content/docs/en/api-reference/faq/product/differ_agora_cdn.mdx` | migrated |  |
| `docs-faq/dynamic-or-static-library.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/dynamic_or_static_library.mdx` | `content/docs/en/api-reference/faq/integration/dynamic_or_static_library.mdx` | migrated |  |
| `docs-faq/electron-faq.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/electron_faq.mdx` | `content/docs/en/api-reference/faq/integration/electron_faq.mdx` | migrated | normalized-html-table<br />normalized-table-header:TableHeader1c97zs4uwk<br />copied-assets:3 |
| `docs-faq/fail-to-upload.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/fail_to_upload.mdx` | `content/docs/en/api-reference/faq/integration/fail_to_upload.mdx` | migrated |  |
| `docs-faq/flutter-debug.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/flutter_debug.mdx` | `content/docs/en/api-reference/faq/quality/flutter_debug.mdx` | migrated |  |
| `docs-faq/flutter-ios-build.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/flutter_ios_build.mdx` | none | migrated | copied-assets:2 |
| `docs-faq/flutter-pod.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/flutter_pod.mdx` | `content/docs/en/api-reference/faq/integration/flutter_pod.mdx` | migrated |  |
| `docs-faq/framework-cannot-be-opened.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/framework_cannot_be_opened.mdx` | `content/docs/en/api-reference/faq/integration/framework_cannot_be_opened.mdx` | migrated |  |
| `docs-faq/generate-token.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/rtc_rtm_token.mdx` | `content/docs/en/api-reference/faq/integration/rtc_rtm_token.mdx` | migrated |  |
| `docs-faq/get-channel-info.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/get_channel_info.mdx` | `content/docs/en/api-reference/faq/integration/get_channel_info.mdx` | migrated |  |
| `docs-faq/get-m3u8-file.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/acquire_file_directory.mdx` | `content/docs/en/api-reference/faq/integration/acquire_file_directory.mdx` | migrated |  |
| `docs-faq/harmonyos-background.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/harmonyos_background.mdx` | none | migrated |  |
| `docs-faq/high-availability.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/high_availability.mdx` | none | migrated |  |
| `docs-faq/ios-background.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/ios_background.mdx` | `content/docs/en/api-reference/faq/quality/ios_background.mdx` | migrated | needs-image-width-review:/img/rtc/ios-backgroundmodes.png:70%<br />copied-assets:1 |
| `docs-faq/ios-bluetooth.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/ios_bluetooth.mdx` | `content/docs/en/api-reference/faq/quality/ios_bluetooth.mdx` | migrated |  |
| `docs-faq/ios-sign.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/ios_sign.mdx` | `content/docs/en/api-reference/faq/integration/ios_sign.mdx` | migrated |  |
| `docs-faq/java-call-cpp.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/java_call_cpp.mdx` | none | migrated |  |
| `docs-faq/judge-voice-video-call.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/judge_voice_video_call.mdx` | `content/docs/en/api-reference/faq/integration/judge_voice_video_call.mdx` | migrated |  |
| `docs-faq/kick-user.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/kick_user.mdx` | `content/docs/en/api-reference/faq/integration/kick_user.mdx` | migrated |  |
| `docs-faq/macos15-beta-issue.mdx` | no | `content/docs/zh-CN/api-reference/faq/other/macos_15_beta.mdx` | `content/docs/en/api-reference/faq/other/macos_15_beta.mdx` | migrated | needs-image-width-review:/img/rtc/mac15beta-addlanguage.png:85%<br />needs-image-width-review:/img/rtc/mac15beta-choosetemplate.png:85%<br />needs-image-width-review:/img/rtc/mac15beta-addkey.png:85%<br />needs-image-width-review:/img/rtc/mac15beta-setdisplayname.png:85%<br />copied-assets:4 |
| `docs-faq/mini-program.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/mini_program.mdx` | none | migrated | normalized-code-language:js->javascript |
| `docs-faq/mirror-mode.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/mirror_mode.mdx` | `content/docs/en/api-reference/faq/integration/mirror_mode.mdx` | migrated |  |
| `docs-faq/mobile-video-profile.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/mobile_video_profile.mdx` | `content/docs/en/api-reference/faq/integration/mobile_video_profile.mdx` | migrated |  |
| `docs-faq/mp4-cannot-play.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/mp4_cannot_play.mdx` | none | migrated |  |
| `docs-faq/multitasking.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/multitasking.mdx` | `content/docs/en/api-reference/faq/integration/multitasking.mdx` | migrated | copied-assets:1 |
| `docs-faq/music-pause.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/music_pause.mdx` | `content/docs/en/api-reference/faq/integration/music_pause.mdx` | migrated |  |
| `docs-faq/ncs-query.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/ncs_vs_query.mdx` | `content/docs/en/api-reference/faq/integration/ncs_vs_query.mdx` | migrated |  |
| `docs-faq/no-audio.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/audio_noaudio.mdx` | `content/docs/en/api-reference/faq/quality/audio_noaudio.mdx` | migrated |  |
| `docs-faq/no-music-unity-objects.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/no_music_unity_objects.mdx` | none | migrated |  |
| `docs-faq/playout-permission.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/android_startaudiomixing_permission.mdx` | `content/docs/en/api-reference/faq/integration/android_startaudiomixing_permission.mdx` | migrated |  |
| `docs-faq/pod-error.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/pod_error.mdx` | none | migrated |  |
| `docs-faq/privacyinfo.mdx` | no | `content/docs/zh-CN/api-reference/faq/other/ios_privacy_manifest.mdx` | `content/docs/en/api-reference/faq/other/ios_privacy_manifest.mdx` | migrated | needs-image-width-review:/img/rtc/privacyinfofile.png:85%<br />needs-image-width-review:/img/rtc/addprivacylist.png:85%<br />copied-assets:2 |
| `docs-faq/privacyinfortm.mdx` | no | `content/docs/zh-CN/api-reference/faq/other/privacyinfortm.mdx` | none | migrated | needs-image-width-review:/img/rtc/privacyinfofile.png:85%<br />needs-image-width-review:/img/rtc/addprivacylist.png:85%<br />copied-assets:2 |
| `docs-faq/record-file-issues.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/record_file_issue.mdx` | `content/docs/en/api-reference/faq/quality/record_file_issue.mdx` | migrated |  |
| `docs-faq/record-status-error.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/record_status_error.mdx` | `content/docs/en/api-reference/faq/quality/record_status_error.mdx` | migrated |  |
| `docs-faq/recording-concurrence.mdx` | no | `content/docs/zh-CN/api-reference/faq/product/recording_concurrence.mdx` | `content/docs/en/api-reference/faq/product/recording_concurrence.mdx` | migrated | normalized-html-table<br />normalized-table-span |
| `docs-faq/recording-mode.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/recording_mode.mdx` | `content/docs/en/api-reference/faq/integration/recording_mode.mdx` | migrated |  |
| `docs-faq/recording-player.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/recording_player.mdx` | `content/docs/en/api-reference/faq/integration/recording_player.mdx` | needs_review | needs-platform-filter-review |
| `docs-faq/recording-split.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/record_split.mdx` | `content/docs/en/api-reference/faq/quality/record_split.mdx` | migrated |  |
| `docs-faq/restful-api-call-frequency.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/restful_api_call_frequency.mdx` | `content/docs/en/api-reference/faq/integration/restful_api_call_frequency.mdx` | migrated |  |
| `docs-faq/return-404.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/return_404.mdx` | `content/docs/en/api-reference/faq/integration/return_404.mdx` | migrated |  |
| `docs-faq/rtm2-integration-issue.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/rtm2_integration_issue.mdx` | none | migrated |  |
| `docs-faq/rtm2-rtc-integration-issue.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/rtm2_rtc_integration_issue.mdx` | `content/docs/en/api-reference/faq/integration/rtm2_rtc_integration_issue.mdx` | migrated |  |
| `docs-faq/sei.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/sei.mdx` | `content/docs/en/api-reference/faq/quality/sei.mdx` | migrated | normalized-table-slot |
| `docs-faq/set-log-file.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/set_log_file.mdx` | `content/docs/en/api-reference/faq/integration/set_log_file.mdx` | migrated |  |
| `docs-faq/streaming-difference.mdx` | no | `content/docs/zh-CN/api-reference/faq/product/streaming_difference.mdx` | `content/docs/en/api-reference/faq/product/streaming_difference.mdx` | migrated | normalized-html-table<br />normalized-table-header:TableHeaderqltsq8u08y |
| `docs-faq/string-uid.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/string_uid.mdx` | `content/docs/en/api-reference/faq/integration/string_uid.mdx` | migrated | normalized-code-language:objectivec->objc<br />needs-image-width-review:/img/rtc/string-uid.svg:50%<br />copied-assets:1 |
| `docs-faq/system-crash-info.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/system_crash_info.mdx` | none | migrated |  |
| `docs-faq/system-volume.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/system_volume.mdx` | `content/docs/en/api-reference/faq/integration/system_volume.mdx` | migrated | normalized-html-table<br />normalized-table-header:TableHeadervo91bspiz7 |
| `docs-faq/token-cohost.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/token_cohost.mdx` | `content/docs/en/api-reference/faq/integration/token_cohost.mdx` | migrated | normalized-html-table<br />normalized-table-header:TableHeaderqcel7a8lwb<br />normalized-table-slot<br />copied-assets:1 |
| `docs-faq/token-error.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/token_related_issues.mdx` | `content/docs/en/api-reference/faq/integration/token_related_issues.mdx` | migrated |  |
| `docs-faq/unreal-permissions.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/unreal_permissions.mdx` | `content/docs/en/api-reference/faq/integration/unreal_permissions.mdx` | migrated | needs-image-width-review:/img/rtc/ue-showcontentpackages.png:60%<br />copied-assets:2 |
| `docs-faq/video-bighead.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/video_bighead.mdx` | `content/docs/en/api-reference/faq/quality/video_bighead.mdx` | migrated |  |
| `docs-faq/video-blank.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/video_blank.mdx` | `content/docs/en/api-reference/faq/quality/video_blank.mdx` | migrated |  |
| `docs-faq/video-blur.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/video_blur.mdx` | `content/docs/en/api-reference/faq/quality/video_blur.mdx` | migrated |  |
| `docs-faq/video-camera.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/video_camera.mdx` | `content/docs/en/api-reference/faq/quality/video_camera.mdx` | migrated |  |
| `docs-faq/video-enhancement.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/video_enhancement.mdx` | `content/docs/en/api-reference/faq/integration/video_enhancement.mdx` | migrated | normalized-table-slot |
| `docs-faq/video-frame-rendering.mdx` | yes | `content/docs/zh-CN/api-reference/faq/quality/optimize_video_rendering.mdx` | `content/docs/en/api-reference/faq/quality/optimize_video_rendering.mdx` | migrated | normalized-table-slot |
| `docs-faq/video-freeze.mdx` | no | `content/docs/zh-CN/api-reference/faq/quality/video_freeze.mdx` | `content/docs/en/api-reference/faq/quality/video_freeze.mdx` | migrated |  |
| `docs-faq/webgl-context.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/webgl_context.mdx` | none | migrated |  |
| `docs-faq/whiteboard-cors.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/whiteboard_cors.mdx` | none | migrated |  |
| `docs-faq/whiteboard-export-pdf.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/whiteboard_export_pdf.mdx` | none | migrated |  |
| `docs-faq/window-sharing-win7.mdx` | yes | `content/docs/zh-CN/api-reference/faq/integration/window_sharing_win7.mdx` | none | migrated |  |
