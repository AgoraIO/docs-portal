# Single Document Content Fidelity Audit

Generated: 2026-07-05T10:50:34.064Z
Old source: `/Users/yangyixuan/Documents/GitHub/shengwang-doc-source/docs/rtc/get-started/quick-start.rn.mdx`
New source: `/private/tmp/docs-portal-migration-control-spec/content/docs/zh-CN/realtime-media/rtc/get-started/quick-start.rn.mdx`
Old URL: (not provided)
New URL: (not provided)
Projection: product=`rtc`, platform=`rn`

## Summary

- Source records: 146
- Target records: 152
- Exact matches: 144
- Missing: 0
- Extra: 0
- Changed: 2
- Moved: 1
- Unsupported: 0
- Legacy residue: none
- Unresolved differences: 3

## Missing (0)

- None

## Extra (0)

- None

## Changed (2)

- `old:code:typescript`  > 创建用户界面 @ 151 "// 导入 React Hooks\nimport React, {useRef, useState, useEffect} from 'react';\n// 导入用户界面元素\nimport {\nSafeAreaView,\nScrollView,\nStyleSheet,\nText,\nView,\nSwitch,\n} from 'react-native';\n\nc"
  - target: `new:code:typescript`  > 创建用户界面 @ 160 "// 导入 React Hooks\nimport React, {useRef, useState, useEffect} from 'react';\n// 导入用户界面元素\nimport {\nSafeAreaView,\nScrollView,\nStyleSheet,\nText,\nView,\nSwitch,\n} from 'react-native';\n\nc"
  - similarity: 1.00
- `old:code:typescript`  > 实现步骤 @ 265 "// 导入 React Hooks\nimport React, { useRef, useState, useEffect } from 'react';\n// 导入用户界面元素\nimport {\nSafeAreaView,\nScrollView,\nStyleSheet,\nText,\nView,\nSwitch,\n} from 'react-native';\n"
  - target: `new:code:typescript`  > 实现步骤 @ 274 "// 导入 React Hooks\nimport React, { useRef, useState, useEffect } from 'react';\n// 导入用户界面元素\nimport {\nSafeAreaView,\nScrollView,\nStyleSheet,\nText,\nView,\nSwitch,\n} from 'react-native';\n"
  - similarity: 1.00

## Moved (1)

- `old:paragraph` (root) @ 21 "所有用户调用 joinChannel 方法加入频道，并根据需要设置用户角色：互动直播：如果用户需要在频道中发流，则设为主播；如果用户只需要收流，则设为观众。视频通话：将所有用户的角色都设为主播。加入频道后，不同角色的用户具备不同的行为：所有用户默认都可以接收频道中的音视频流。主播可以在频道内发布音视频流。观众如果需要发流，可在频道内调用 setClientR"
  - target: `new:list-item` (root) @ 16 "所有用户调用 joinChannel 方法加入频道，并根据需要设置用户角色："


## Unsupported (0)

- None
