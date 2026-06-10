#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const repoRoot = '/Users/yejiayi/Documents/docs-portal';
const sourceRoot = '/Users/yejiayi/Documents/Doc-Source-Private/cloud-recording';
const targetRoot = path.join(
  repoRoot,
  'content/docs/en/realtime-media/recording',
);

const consoleUrl = 'https://console.agora.io/v2';
const agoraMcpUrl = 'https://mcp.agora.io';
const statusPageUrl = 'https://status.agora.io/';
const formatConverterUrl =
  'https://download.agora.io/acrsdk/release/cloud_recording_tools.v3.8.0.69-202302061216-release-prod.tar.gz';
const transcoderUrl =
  'https://download.agora.io/acrsdk/release/rtsc-ha_transcoder.v1.1.9-202204180321-release-prod.tar.gz';
const webApiRefRoot = 'https://api-ref.agora.io/en/video-sdk/web/4.13.0';
const supportMail = 'mailto:support@agora.io';

const sectionOrder = [
  {
    source: 'overview',
    title: 'Overview',
    pages: [
      'index',
      'core-concepts',
      'pricing',
      'pricing-webpage-recording',
      'release-notes',
    ],
  },
  {
    source: 'get-started',
    title: 'Get Started',
    pages: [
      'index',
      'manage-agora-account',
      'getstarted',
      'middleware-quickstart',
      'skills',
      'mcp',
    ],
  },
  {
    source: 'develop',
    title: 'Develop',
    pages: [
      'index',
      'authentication-workflow',
      'composite-mode',
      'convert-format',
      'individual-mode',
      'individual-nontranscoding',
      'integrate-token-generation',
      'layout',
      'manage-files',
      'merge-files',
      'online-play',
      'playback',
      'receive-notifications',
      'recording-video-profile',
      'screen-capture',
      'subscription',
      'webpage-load-timeout',
      'webpage-mode',
    ],
  },
  {
    source: 'best-practices',
    title: 'Best Practices',
    pages: ['index', 'integration-best-practices', 'webpage-best-practices'],
  },
  {
    source: 'reference',
    title: 'Reference',
    pages: [
      'index',
      'restful-api',
      'restful-authentication',
      'rest-api-overview',
      'stream-mode',
      'region-vendor',
      'common-errors',
      'status-page',
      'billing-policies',
      'firewall',
      'security',
      'glossary',
    ],
  },
];

const sectionDescriptions = {
  overview:
    'Learn what Cloud Recording is, how the product model works, and how pricing and releases are organized.',
  'get-started':
    'Prepare your project, credentials, storage, and first recording flow before moving into deeper implementation choices.',
  develop:
    'Implement recording workflows, layouts, file handling, playback, screenshots, webhooks, and advanced mode-specific behavior.',
  'best-practices':
    'Use these operational recommendations to improve reliability, observability, limits handling, and web page recording behavior.',
  reference:
    'Use the API, authentication, callback, region, pricing policy, security, and support references while integrating Cloud Recording.',
};

const staticPages = new Map([
  [
    'overview/product-overview.mdx',
    {
      target: 'overview/index.md',
      content: `---
title: Cloud Recording
description: Record realtime voice, video, and interactive streaming sessions into cloud storage for replay, archive, review, and downstream processing.
---

Cloud Recording is Agora's managed recording path for teams that want to capture live sessions without operating their own recording servers. You drive the workflow from your backend through REST APIs, and Agora handles the recording workers that join the channel, capture streams, and upload output files to your cloud storage.

## What this product is good for

- Archive live sessions for replay, audit, or compliance
- Save group calls and interactive live streams into files for later distribution
- Produce per-user or mixed outputs depending on your playback and processing needs
- Trigger screenshots, web page recording, callbacks, and post-processing workflows from the same backend-controlled path

## Core strengths

- **Managed operation**: You do not need to run your own recording fleet.
- **Flexible output modes**: Use individual, composite, or web page recording depending on what you need to preserve.
- **Cloud storage integration**: Upload recording files directly to supported third-party storage providers.
- **Backend orchestration**: Start, update, query, and stop recording with REST APIs from your own service layer.

## Recommended reading path

1. Start with [REST quickstart](../get-started/getstarted).
2. Review [Core concepts](core-concepts) to choose the correct recording mode.
3. Decide between [Individual recording](../develop/individual-mode), [Composite recording](../develop/composite-mode), or [Web page recording](../develop/webpage-mode).
4. Keep [RESTful API](../reference/restful-api) and [Webhook callbacks](../reference/rest-api-overview) open while implementing.

## Related capability paths

- [Recording overview](/en/realtime-media/recording)
- [Cloud Recording REST API reference](/en/api-reference/cloud-recording/restful)
- [Media processing and distribution](/en/realtime-media/media-processing-and-distribution)
`,
    },
  ],
  [
    'get-started/manage-agora-account.mdx',
    {
      target: 'get-started/manage-agora-account.md',
      content: `---
title: Agora account management
description: Create a project, collect credentials, and prepare the Console state required for Cloud Recording.
---

Before you start Cloud Recording, prepare an Agora account, create a project, and collect the credentials your backend will use for both RTC and REST flows.

## What you need

- An Agora account
- A project in [Agora Console](${consoleUrl})
- App ID and App Certificate for the project that will be recorded
- Customer ID and Customer Secret for REST API authentication
- Temporary or server-generated token strategy if the target channel uses tokens

## Basic setup flow

1. Sign in to [Agora Console](${consoleUrl}).
2. Create a project and select **Secured mode: App ID + Token (Recommended)**.
3. Copy the **App ID** from the project list.
4. Open the project and copy the **Primary Certificate** if your recording flow uses tokens.
5. Generate the REST API **Customer ID** and **Customer Secret** from the Console RESTful API toolkit.
6. Enable **Cloud Recording** for the project before testing the REST workflow.

## Related resources

- [REST quickstart](getstarted)
- [Authenticate REST calls](../reference/restful-authentication)
- [Implement token authentication](../develop/authentication-workflow)
- [Agora account](/en/introduction/account)
`,
    },
  ],
  [
    'get-started/skills.mdx',
    {
      target: 'get-started/skills.mdx',
      content: `---
title: Agora skills
description: Use Agora Skills with AI coding assistants to speed up Cloud Recording integration work.
---

Agora Skills is a product-aware instruction pack for coding assistants. It helps the assistant route Cloud Recording tasks to the right setup, API, and troubleshooting flow instead of guessing from generic docs alone.

## Install Agora Skills

<Tabs>
<TabsList>
  <TabsTrigger value="skills-cli">Skills CLI</TabsTrigger>
  <TabsTrigger value="manual">Manual installation</TabsTrigger>
</TabsList>

<TabsContent value="skills-cli">

\`\`\`bash
npx skills add github:AgoraIO/skills
\`\`\`

</TabsContent>

<TabsContent value="manual">

\`\`\`bash
git clone https://github.com/AgoraIO/skills.git ~/agora-skills
\`\`\`

Point your coding tool at \`skills/agora/\` or load \`SKILL.md\` as the entry point.

</TabsContent>
</Tabs>

## When Skills helps

Use Agora Skills when your assistant needs help with:

- choosing the correct recording mode and API path
- setting up token and REST authentication flows
- selecting the right quickstart or middleware path
- debugging Cloud Recording integration issues with product context

Skills works especially well together with [Agora MCP](mcp), which gives the assistant live access to current docs.

## Related resources

- [Agora Skills repository](https://github.com/AgoraIO/skills)
- [Agora MCP](mcp)
- [REST quickstart](getstarted)
`,
    },
  ],
  [
    'get-started/mcp.mdx',
    {
      target: 'get-started/mcp.mdx',
      content: `---
title: Agora MCP
description: Connect your coding assistant to Agora MCP so it can read current Cloud Recording documentation while you build.
---

The Agora MCP server gives your coding assistant direct access to current Agora documentation, so it can check APIs, parameters, and platform-specific notes while you integrate Cloud Recording.

## MCP server URL

\`\`\`text
${agoraMcpUrl}
\`\`\`

## Install the MCP server

<Tabs>
<TabsList>
  <TabsTrigger value="codex">Codex</TabsTrigger>
  <TabsTrigger value="claude">Claude</TabsTrigger>
  <TabsTrigger value="gemini">Gemini CLI</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>

<TabsContent value="codex">

\`\`\`bash
codex mcp add --url ${agoraMcpUrl} agora-docs
\`\`\`

</TabsContent>

<TabsContent value="claude">

\`\`\`bash
claude mcp add --transport http agora-docs ${agoraMcpUrl}
\`\`\`

</TabsContent>

<TabsContent value="gemini">

\`\`\`bash
gemini mcp add --transport http agora-docs ${agoraMcpUrl}
\`\`\`

</TabsContent>

<TabsContent value="manual">

Add \`${agoraMcpUrl}\` to your MCP client and use \`http\` or \`Streamable HTTP\` transport if the client asks for a transport type.

</TabsContent>
</Tabs>

## Best use for Cloud Recording work

Use Agora MCP when the risky part of the task is documentation freshness, for example:

- checking current Cloud Recording REST parameters
- comparing recording modes or storage options
- verifying callback fields or error-handling guidance
- confirming the latest quickstart steps before generating backend code

## Related resources

- [Agora MCP server](${agoraMcpUrl})
- [Agora Skills](skills)
- [Cloud Recording RESTful API](../reference/restful-api)
`,
    },
  ],
  [
    'develop/authentication-workflow.mdx',
    {
      target: 'develop/authentication-workflow.md',
      content: `---
title: Deploy a token server
description: Use token authentication when your recorded channel requires secure RTC access.
---

If the channel you want to record uses token authentication, the Cloud Recording worker also needs a valid RTC token to join the channel. The safest approach is to generate that token on your own server and inject it into the Cloud Recording \`start\` request.

## What this page covers

- why Cloud Recording needs the same channel-level token model as your clients
- what information a token server must hold
- how the token flows from your backend into a Cloud Recording request

## Minimum setup

1. Keep the **App ID** and **App Certificate** on your server.
2. Generate an RTC token for the channel and recording UID.
3. Pass that token in the \`clientRequest.token\` field when you call [\`start\`](../reference/restful-api#start).
4. Refresh the token if your broader workflow keeps long-running sessions alive.

## Token server implementation paths

- Use the Agora token tools directly: see [Token generators](integrate-token-generation).
- Use the community middleware path: see [Quickstart using middleware](../get-started/middleware-quickstart).
- For general account and credential setup, see [Agora account management](../get-started/manage-agora-account).

## Practical note for Cloud Recording

The recording UID must be unique inside the channel, and the generated token must match that UID. If your clients use integer UIDs, generate the recording token with an integer recording UID as well.
`,
    },
  ],
  [
    'develop/integrate-token-generation.mdx',
    {
      target: 'develop/integrate-token-generation.md',
      content: `---
title: Token generators
description: Generate RTC tokens on your server and inject them into Cloud Recording workflows.
---

To secure user and recorder access, generate RTC tokens on your server instead of in the client or in ad hoc scripts. Cloud Recording uses the same App ID and App Certificate trust model as your client-side RTC integration.

## What a generated token includes

- App ID
- App Certificate-derived signature
- channel name
- UID
- expiration time
- role and privilege data

## Reference implementations

Agora provides token generation libraries and samples in the following languages:

- [Golang](https://github.com/AgoraIO/Tools/tree/master/DynamicKey/AgoraDynamicKey/go)
- [Node.js](https://github.com/AgoraIO/Tools/tree/master/DynamicKey/AgoraDynamicKey/nodejs)
- [PHP](https://github.com/AgoraIO/Tools/tree/master/DynamicKey/AgoraDynamicKey/php)
- [Python](https://github.com/AgoraIO/Tools/tree/master/DynamicKey/AgoraDynamicKey/python3)
- [Java](https://github.com/AgoraIO/Tools/tree/master/DynamicKey/AgoraDynamicKey/java)
- [C++](https://github.com/AgoraIO/Tools/tree/master/DynamicKey/AgoraDynamicKey/cpp)

## Recommended Cloud Recording flow

1. Generate the token on your server for the target channel and recording UID.
2. Send the token to the backend service that orchestrates Cloud Recording.
3. Include the token in the \`start\` request body under \`clientRequest.token\`.
4. Keep token expiry longer than the expected recording window, or design a renewal path around your recording lifecycle.

## Related resources

- [Deploy a token server](authentication-workflow)
- [REST quickstart](../get-started/getstarted)
- [RESTful API](../reference/restful-api)
`,
    },
  ],
  [
    'develop/receive-notifications.mdx',
    {
      target: 'develop/receive-notifications.md',
      content: `---
title: Webhooks
description: Receive Cloud Recording webhook notifications on your backend for status, file, and failure events.
---

A webhook is an HTTPS callback that lets your backend receive Cloud Recording events in real time. Agora sends POST requests to your endpoint when subscribed recording events occur, so you can monitor progress, reconcile files, and react to failures.

## Typical use cases

- track recording lifecycle state changes
- detect file upload completion and callback events
- reconcile callback data with your own job records
- alert on recording failures or abnormal stop reasons

## Recommended setup flow

1. Expose a public HTTPS webhook endpoint.
2. Enable the callback events you need in Cloud Recording.
3. Verify incoming requests and return \`200 OK\` quickly.
4. Make processing idempotent because retries can happen.

## Practical integration notes

- Do not rely on webhook delivery alone for mission-critical state. Pair it with [\`query\`](../reference/restful-api#query) when necessary.
- If your network is restricted by a firewall, review [Firewall requirements](../reference/firewall).
- For callback payloads and event semantics, keep [Cloud Recording callback overview](../reference/rest-api-overview) open during implementation.

## Related resources

- [Cloud Recording callback overview](../reference/rest-api-overview)
- [Integration best practices](../best-practices/integration-best-practices)
- [Product and service status](../reference/status-page)
`,
    },
  ],
  [
    'reference/firewall.mdx',
    {
      target: 'reference/firewall.md',
      content: `---
title: Firewall requirements
description: Allow the network paths Cloud Recording depends on when you operate in restricted environments.
---

If your backend, storage provider, or webhook endpoint operates behind a firewall, allow the network paths required for Cloud Recording REST calls, callback delivery, and third-party storage access.

## What to allow

- outbound HTTPS access from your backend to Agora REST endpoints
- inbound HTTPS access to your webhook endpoint if you use callbacks
- access between the recording service and your configured cloud storage provider

## Operational advice

- Keep firewall rules narrow and environment-specific.
- Validate webhook reachability before production rollout.
- Recheck storage-side allowlists whenever you change vendors or regions.
- If you rely on webhook callbacks in a restricted network, build a fallback path with periodic status queries.

## Related resources

- [RESTful API](restful-api)
- [Cloud Recording callback overview](rest-api-overview)
- [Support and status](/en/introduction/support)
`,
    },
  ],
  [
    'reference/glossary.mdx',
    {
      target: 'reference/glossary.md',
      content: `---
title: Glossary
description: Common Cloud Recording terms used across the integration and operations flow.
---

## Core terms

- **Cloud Recording**: Agora's managed recording service for realtime audio, video, and interactive streaming sessions.
- **App ID**: The project identifier used across Agora integrations.
- **App Certificate**: The server-side credential used in token-related flows.
- **Customer ID / Customer Secret**: Credentials used for Cloud Recording REST authentication.
- **Resource ID**: A short-lived identifier returned by \`acquire\` before a recording starts.
- **SID**: The recording session identifier returned after a successful \`start\`.
- **Recording UID**: The UID used by the recording worker when it joins the channel.
- **Individual recording**: Per-user recording outputs rather than one mixed output.
- **Composite recording**: A mixed layout recording for multiple users in one output stream.
- **Web page recording**: Recording that captures web page content and audio as a video output.
- **M3U8**: The index playlist file used to organize HLS recording slices.
- **TS / WebM / MP4**: Common Cloud Recording output file formats.

## Related resources

- [Core concepts](../overview/core-concepts)
- [Manage recorded files](../develop/manage-files)
- [RESTful API](restful-api)
`,
    },
  ],
  [
    'reference/security.mdx',
    {
      target: 'reference/security.md',
      content: `---
title: Security
description: Understand the shared security model around Cloud Recording, credentials, transport, and stored media.
---

Cloud Recording security depends on both Agora's service controls and your own handling of credentials, storage, and downstream access.

## Shared responsibility model

Agora is responsible for the managed recording infrastructure and transport layer protections that support the service. You remain responsible for:

- protecting App ID, App Certificate, Customer Secret, and storage credentials
- keeping token generation on the server side
- controlling access to recorded files in third-party storage
- validating webhook requests and securing callback endpoints

## Minimum recommendations

- Keep all signing secrets and storage secrets on the server side only.
- Use token authentication for channels that need controlled recorder access.
- Rotate REST and storage credentials according to your internal policy.
- Restrict read access to recorded files and callback logs.
- Review firewall and webhook exposure before production rollout.

## Data handling notes

- Recorded media is stored in the third-party cloud storage you configure for Cloud Recording.
- Callback payloads and monitoring logs can contain operational metadata. Treat them as production data.
- If you need stronger organizational review, include Cloud Recording in your broader platform threat model and compliance review.

## Related resources

- [Authenticate REST calls](restful-authentication)
- [Deploy a token server](../develop/authentication-workflow)
- [Firewall requirements](firewall)
`,
    },
  ],
  [
    'reference/status-page.mdx',
    {
      target: 'reference/status-page.md',
      content: `---
title: Product and service status
description: Track service status, maintenance events, and historical health signals for Cloud Recording and related Agora services.
---

Use the Agora Status Page to monitor service health, maintenance events, and recent quality signals for Cloud Recording and other Agora products.

## What the status page provides

- current service health indicators
- recent quality data windows
- historical event and incident views
- RSS subscriptions for ongoing updates

Open the status page directly at [status.agora.io](${statusPageUrl}).

## When to use it

- before or during an incident investigation
- when callbacks or recording jobs fail in a way that looks systemic
- when you want to distinguish between integration bugs and broader service events

## Related resources

- [Support](/en/introduction/support)
- [Integration best practices](../best-practices/integration-best-practices)
- [Cloud Recording callback overview](rest-api-overview)
`,
    },
  ],
  [
    'reference/billing-policies.mdx',
    {
      target: 'reference/billing-policies.md',
      content: `---
title: Billing policies and free-of-charge policy
description: Understand billing cycle, account state, and free usage policy references that affect Cloud Recording.
---

This page summarizes the account-level billing policies that matter when you operate Cloud Recording.

## Contract precedence

If you have a commercial contract with Agora, the contract terms override generic self-serve billing descriptions.

## Account policy areas to watch

- monthly billing cycle and settlement timing
- free-tier or promotional usage treatment
- account suspension risk if payment state becomes invalid
- product usage aggregation across projects in the same account

## Practical implication for Cloud Recording

Cloud Recording usage is billed at the account level together with the rest of your project activity. If your workflow depends on uninterrupted recording, make sure account payment state and quota assumptions are reviewed before production launch.

## Related resources

- [Cloud Recording pricing](../overview/pricing)
- [Web page recording pricing](../overview/pricing-webpage-recording)
- [Agora account management](../get-started/manage-agora-account)
`,
    },
  ],
  [
    'overview/release-notes.mdx',
    {
      target: 'overview/release-notes.md',
      content: `---
title: Release notes
description: Key Cloud Recording updates that affect storage, recording modes, security, and callback behavior.
---

This page highlights recent Cloud Recording changes that are likely to matter during integration and operations. Treat it as an implementation-oriented changelog, not a complete historical archive.

## 2025-06-27

- Added support for self-built S3-compatible storage by setting \`vendor\` to \`11\` and passing the storage endpoint under \`extensionParams.endpoint\`.

## 2024-08-02

- Added optional \`stsToken\` and \`stsExpiration\` fields under \`storageConfig\` for \`start\` and \`update\`, improving temporary credential support for cloud storage uploads.

## 2023-07-05

- Added more Alibaba Cloud regions.
- Updated the high-availability transcoding tooling to improve background-noise handling.

## 2022-11-20

- Improved player compatibility for MPD outputs generated by individual recording in \`standard\` mode.
- Updated the Agora Format Converter Script used for individual recording post-processing.

## 2022-10-20

- Rolled out postpone transcoding globally through \`scene = 2\` in \`acquire\`.

## 2022-01-20

- Added individual audio non-transcoding recording with the \`streamMode\` parameter.
- Added postpone audio mixing fields for delayed merged audio outputs.
- Added combined audio-video index file support for individual recording in \`standard\` mode.

## 2021 highlights

- Added more storage vendors and regions, including Google Cloud, Huawei Cloud, Baidu AI Cloud, and Azure.
- Added web page recording improvements such as pause support, page load timeout detection, screenshot callbacks, and output-resolution changes.
- Added geofencing and newer encryption-related options for selected recording flows.

## Related resources

- [RESTful API](../reference/restful-api)
- [Third-party cloud storage regions](../reference/region-vendor)
- [Manage recorded files](../develop/manage-files)
`,
    },
  ],
]);

function sanitizeFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return content;

  const lines = match[1].split('\n');
  const keep = [];
  let skipIndented = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (skipIndented) {
      if (/^\s+/.test(rawLine)) {
        continue;
      }
      skipIndented = false;
    }

    if (
      /^sidebar_position:/.test(line) ||
      /^platform_selector:/.test(line) ||
      /^hide_table_of_contents:/.test(line) ||
      /^type:/.test(line) ||
      /^last_update:/.test(line)
    ) {
      if (line.endsWith(':')) {
        skipIndented = true;
      }
      continue;
    }

    keep.push(rawLine);
  }

  return `---\n${keep.join('\n').trim()}\n---\n${content.slice(match[0].length)}`;
}

function replaceTokens(content) {
  return content
    .replaceAll(/<Vg k="COMPANY"\s*\/>/g, 'Agora')
    .replaceAll(/<Vg k="COMPANY"\s*><\/Vg>/g, 'Agora')
    .replaceAll(/<Vg k="COMPANY"\s*>/g, 'Agora')
    .replaceAll(/<Vpd k="NAME"\s*\/>/g, 'Cloud Recording')
    .replaceAll(/<Vpd k="NAME"\s*>/g, 'Cloud Recording')
    .replaceAll(/<Vg k="CREC"\s*\/>/g, 'Cloud Recording')
    .replaceAll(/<Vg k="CREC"\s*>/g, 'Cloud Recording')
    .replaceAll(/<Vg k="CONSOLE"\s*\/>/g, 'Agora Console')
    .replaceAll(/<Vg k="CONSOLE"\s*>/g, 'Agora Console')
    .replaceAll(/<Vg k="STATUS_PAGE"\s*\/>/g, 'Agora Status Page')
    .replaceAll(/<Vg k="STATUS_PAGE"\s*>/g, 'Agora Status Page')
    .replaceAll(/<Vg k="NCS_LONG"\s*\/>/g, 'Message Notification Service')
    .replaceAll(/<Vg k="NCS_LONG"\s*>/g, 'Message Notification Service')
    .replaceAll(/<Vg k="NCS"\s*\/>/g, 'NCS')
    .replaceAll(/<Vg k="NCS"\s*>/g, 'NCS')
    .replaceAll(/<Vg k="VSDK"\s*\/>/g, 'Video SDK')
    .replaceAll(/<Vg k="VSDK"\s*>/g, 'Video SDK')
    .replaceAll(/<Vg k="ILS"\s*\/>/g, 'Interactive Live Streaming')
    .replaceAll(/<Vg k="ILS"\s*>/g, 'Interactive Live Streaming')
    .replaceAll(/<Vg k="BS"\s*\/>/g, 'Broadcast Streaming')
    .replaceAll(/<Vg k="BS"\s*>/g, 'Broadcast Streaming')
    .replaceAll(/<Vg k="SIG"\s*\/>/g, 'Signaling')
    .replaceAll(/<Vg k="SIG"\s*>/g, 'Signaling')
    .replaceAll(/<Vg k="AGORA_BACKEND"\s*\/>/g, 'Agora SD-RTN')
    .replaceAll(/<Vg k="AGORA_BACKEND"\s*>/g, 'Agora SD-RTN')
    .replaceAll(/<Vg k="SDRTN"\s*\/>/g, 'SD-RTN')
    .replaceAll(/<Vg k="SDRTN"\s*>/g, 'SD-RTN')
    .replaceAll(/<Vpl k="CLIENT"\s*\/>/g, 'client app')
    .replaceAll(/<Vpl k="CLIENT"\s*>/g, 'client app')
    .replaceAll(/<Vpd k="PRODUCT"\s*\/>/g, 'Cloud Recording')
    .replaceAll(/<Vpd k="PRODUCT"\s*>/g, 'Cloud Recording')
    .replaceAll(/<Vg k="BACKEND_NAME"\s*\/>/g, 'Agora real-time network')
    .replaceAll(/<Vg k="BACKEND_NAME"\s*>/g, 'Agora real-time network');
}

function replaceGlobalVars(content) {
  return content
    .replaceAll(/\{\{Global\.AGORA_CONSOLE_URL\}\}/g, consoleUrl)
    .replaceAll(/\{\{Global\.CREC_FCS\}\}/g, formatConverterUrl)
    .replaceAll(/\{\{Global\.CREC_TRANS_SCRIPT\}\}/g, transcoderUrl)
    .replaceAll(/\{\{Global\.API_REF_WEB_ROOT\}\}/g, webApiRefRoot)
    .replaceAll(/\{\{global\.API_REF_WEB_ROOT\}\}/g, webApiRefRoot);
}

function convertLegacyLinks(content) {
  let next = content;

  next = next.replace(
    /<Link\s+target="_blank"\s+to="([^"]+)">([\s\S]*?)<\/Link>/g,
    '[$2]($1)',
  );
  next = next.replace(/<Link\s+to="([^"]+)">([\s\S]*?)<\/Link>/g, '[$2]($1)');

  return next;
}

function convertAdmonitions(content) {
  return content.replace(
    /<Admonition\s+type\s*=\s*"([^"]+)"(?:\s+title="([^"]+)")?\s*>([\s\S]*?)<\/Admonition>/g,
    (_, type, title, body) => {
      const mappedType =
        {
          caution: 'warning',
          warning: 'warning',
          danger: 'danger',
          info: 'info',
          tip: 'tip',
        }[type] ?? 'info';
      const heading = title ? `[${title}]` : '';
      const inner = body.trim().replace(/\n{3,}/g, '\n\n');
      return `:::${mappedType}${heading}\n${inner}\n:::`;
    },
  );
}

function convertAnchors(content) {
  let next = content;
  next = next.replace(
    /<a name="([^"]+)"><\/a>\n(#{2,6})\s+([^\n]+)\n/g,
    (_, id, hashes, title) => `${hashes} ${title} {#${id}}\n`,
  );
  next = next.replace(
    /###\s*<a name="([^"]+)"><\/a>\s*([^\n]+)\n/g,
    (_, id, title) => `### ${title} {#${id}}\n`,
  );
  next = next.replace(/<a name="([^"]+)"><\/a>\n?/g, '<a id="$1"></a>\n');
  return next;
}

function cleanupImportsAndExports(content) {
  return content
    .replace(/^import .*$/gm, '')
    .replace(/^export const toc = \[\{\}\];?$/gm, '')
    .replace(/^export const toc = \[\];?$/gm, '')
    .replace(/^export const toc = \[\{\}\]$/gm, '')
    .replace(/^export const toc = .*$/gm, '')
    .replace(/\n{3,}/g, '\n\n');
}

function removeWrappers(content) {
  return content
    .replace(/<\/?ProductWrapper[^>]*>/g, '')
    .replace(/<\/?details[^>]*>/g, '')
    .replace(/<\/?summary>/g, '')
    .replace(/<\/?CodeBlock[^>]*>/g, '')
    .replace(/\{`/g, '')
    .replace(/`\}/g, '')
    .replace(/<\/?Authorization[^>]*>/g, '`Authorization`')
    .replace(/<\/?YourChannelName[^>]*>/g, 'YourChannelName')
    .replace(/<\/?YourRecordingUID[^>]*>/g, 'YourRecordingUID')
    .replace(/<\/?YourBucketName[^>]*>/g, 'YourBucketName')
    .replace(/<\/?YourToken[^>]*>/g, 'YourToken')
    .replace(/<\/?YourSecretKey[^>]*>/g, 'YourSecretKey')
    .replace(/<\/?YourAccessKey[^>]*>/g, 'YourAccessKey')
    .replace(/<\/?YourinputPath[^>]*>/g, 'YourInputPath');
}

function convertCodeBlockComponent(content) {
  return content.replace(
    /<CodeBlock language="([^"]+)"[^>]*>\s*([\s\S]*?)\s*<\/CodeBlock>/g,
    (_, lang, body) => `\`\`\`${lang}\n${body.trim()}\n\`\`\``,
  );
}

function convertTabs(content) {
  if (!content.includes('<Tabs>') || !content.includes('<TabItem')) {
    return content;
  }

  const tabsMatch = content.match(/<Tabs>([\s\S]*?)<\/Tabs>/);
  if (!tabsMatch) return content;

  const inner = tabsMatch[1];
  const tabItems = [...inner.matchAll(/<TabItem[^>]*label="([^"]+)"[^>]*>([\s\S]*?)<\/TabItem>/g)];
  if (tabItems.length === 0) return content;

  const blocks = tabItems
    .map((match) => {
      const label = match[1];
      const body = match[2].trim();
      return `### ${label}\n\n${body}`;
    })
    .join('\n\n');

  return content.replace(tabsMatch[0], blocks);
}

function rewriteOldPaths(content) {
  return content
    .replaceAll('/cloud-recording/', '/en/realtime-media/recording/')
    .replaceAll('../../video-calling/advanced/screenshot-upload', '/en/realtime-media/rtc')
    .replaceAll('/video-calling/overview/product-overview', '/en/realtime-media/rtc')
    .replaceAll('../../interactive-whiteboard/overview/product-overview', '/en/realtime-media/whiteboard')
    .replaceAll('../../signaling/overview/product-overview', '/en/realtime-media/rtm')
    .replaceAll('/video-calling/token-authentication/authentication-workflow', '/en/realtime-media/recording/develop/authentication-workflow')
    .replaceAll('/video-calling/get-started/get-started-sdk', '/en/realtime-media/rtc')
    .replaceAll('../reference/rest-api/rest', '/en/api-reference/cloud-recording/restful')
    .replaceAll('../reference/rest-api/restful', '/en/api-reference/cloud-recording/restful')
    .replaceAll('../overview/product-overview', '../overview')
    .replaceAll('../../overview/product-overview', '../overview')
    .replaceAll('..overview/core-concepts', '../overview/core-concepts')
    .replaceAll('../../../on-premise-recording/reference/error-code', '/en/api-reference/local-server-recording/restful')
    .replaceAll('../../develop/webpage-load-timeout', '../develop/webpage-load-timeout')
    .replaceAll('/en/en/realtime-media/recording/', '/en/realtime-media/recording/')
    .replaceAll('develop/composite-mode-layout', '../develop/layout');
}

function normalizeRelativeLinks(content, section) {
  return content
    .replaceAll('(../develop/', '(../develop/')
    .replaceAll('(../reference/', '(../reference/')
    .replaceAll('(../overview/', '(../overview/')
    .replaceAll('(../get-started/', '(../get-started/')
    .replaceAll('(../best-practices/', '(../best-practices/')
    .replaceAll('(./develop/', '(../develop/');
}

function postprocess(content, section) {
  let next = content;
  next = sanitizeFrontmatter(next);
  next = cleanupImportsAndExports(next);
  next = replaceGlobalVars(next);
  next = replaceTokens(next);
  next = convertLegacyLinks(next);
  next = convertAdmonitions(next);
  next = convertAnchors(next);
  next = convertCodeBlockComponent(next);
  next = removeWrappers(next);
  next = convertTabs(next);
  next = rewriteOldPaths(next);
  next = normalizeRelativeLinks(next, section);
  next = next.replace(/<(?!\/?(?:Tabs|TabsList|TabsTrigger|TabsContent)\b)(?![A-Za-z0-9_]+>)/g, '<');
  next = next.replace(/<\/(?!Tabs|TabsList|TabsTrigger|TabsContent)[^>\n]+>/g, '');
  next = next.replace(/<(?!(?:Tabs|TabsList|TabsTrigger|TabsContent)\b)([A-Z][A-Za-z0-9_]*)(?:\s[^>]*)?>/g, '');
  next = next.replace(/\n{3,}/g, '\n\n').trimEnd();
  return `${next}\n`;
}

function extensionToTarget(fileName) {
  return fileName.replace(/\.mdx?$/, '.md');
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeFile(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content);
}

function makeIndexPage(section) {
  return `---
title: ${section.title}
description: ${sectionDescriptions[section.source]}
---

${sectionDescriptions[section.source]}

## Included pages

${section.pages
  .filter((page) => page !== 'index')
  .map((page) => `- [${page.replaceAll('-', ' ')}](${page})`)
  .join('\n')}
`;
}

async function buildMetaFiles() {
  const rootMeta = {
    title: 'Recording',
    pages: ['index', ...sectionOrder.map((section) => section.source)],
  };

  await writeFile(
    path.join(targetRoot, 'meta.json'),
    `${JSON.stringify(rootMeta, null, 2)}\n`,
  );

  for (const section of sectionOrder) {
    const sectionDir = path.join(targetRoot, section.source);
    await ensureDir(sectionDir);
    await writeFile(
      path.join(sectionDir, 'meta.json'),
      `${JSON.stringify(
        {
          title: section.title,
          pages: section.pages.map((page) => page.replace(/\.md$/, '')),
        },
        null,
        2,
      )}\n`,
    );

    if (!section.pages.includes('index')) continue;
    await writeFile(path.join(sectionDir, 'index.md'), makeIndexPage(section));
  }
}

async function migrateStaticPages() {
  for (const [sourceRel, spec] of staticPages.entries()) {
    await writeFile(path.join(targetRoot, spec.target), spec.content);
  }
}

async function migrateRegularPages() {
  for (const section of sectionOrder) {
    const sourceDir = path.join(sourceRoot, section.source);
    for (const entry of await fs.readdir(sourceDir)) {
      if (entry === '_category_.json') continue;

      const sourcePath = path.join(sourceDir, entry);
      const rel = path.posix.join(section.source, entry);
      if (staticPages.has(rel)) continue;

      const stat = await fs.stat(sourcePath);
      if (!stat.isFile()) continue;
      if (!/\.(md|mdx)$/.test(entry)) continue;

      const raw = await fs.readFile(sourcePath, 'utf8');
      const transformed = postprocess(raw, section.source);
      const targetEntry =
        entry === 'getstarted.md'
          ? 'getstarted.md'
          : entry === 'restful-api.mdx'
            ? 'restful-api.md'
            : extensionToTarget(entry);
      await writeFile(
        path.join(targetRoot, section.source, targetEntry),
        transformed,
      );
    }
  }
}

async function rewriteRootIndex() {
  const index = `---
title: Recording
description: Choose the Agora recording path for archive, replay, review, compliance, and downstream media workflows.
---

Recording turns live session content into assets you can replay, review, analyze, and preserve. In Agora's media workflow layer, the primary managed path is Cloud Recording.

## Available path in this subtree

- [Cloud Recording](overview): Managed recording with REST APIs, cloud storage integration, callbacks, and multiple output modes.

## What to read first

1. Start with [Cloud Recording](overview).
2. Go to [REST quickstart](get-started/getstarted) if you want the shortest implementation path.
3. Use [Develop](develop) when you already know the mode you need and are working through layouts, files, screenshots, or callbacks.
4. Keep [Reference](reference) open during backend integration.

## Related capability docs

- [Realtime & Media overview](/en/realtime-media)
- [Media processing and distribution](/en/realtime-media/media-processing-and-distribution)
- [Cloud Recording API reference](/en/api-reference/cloud-recording/restful)
`;

  await writeFile(path.join(targetRoot, 'index.md'), index);
}

async function main() {
  await buildMetaFiles();
  await rewriteRootIndex();
  await migrateStaticPages();
  await migrateRegularPages();
  console.log('Cloud Recording migration files written.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
