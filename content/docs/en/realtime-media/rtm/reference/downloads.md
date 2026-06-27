---
title: "Manual install"
description: "Links to the manual downloads for this product, and explanations on how to install them."
---

To manually install Signaling SDK, do one of the following:

## Through the Agora website

1. Extract the files in Agora [Signaling SDK](/en/api-reference/sdks) to a local folder. In the SDK folder, find the JS file in the libs folder, and save it to your project directory.

1. Open the HTML file in your project directory, and add the following code to refer to the JS file:

    ```javascript
    <script src="path to the JS file"></script>
    ```
1. To enable smart completions and type checking, take the following steps:

    1. Go to `libs/agora-rtm-sdk.d.ts` in the SDK folder, and save the TS file to your project directory.

    1. Add the following line to the beginning of the JS or TS file (you should replace path to the TS file with the path to agora-rtm-sdk.d.ts).

        ```javascript
        /// <reference path="path to the TS file" />
        ```

## Through npm

1. In `package.json` for your project, add `agora-rtm-sdk` and its version number to the dependencies field:
    ```json
    "dependencies": {
        "agora-rtm-sdk": "^2.1.4-beta.0",
        "cors-anywhere": "^0.4.4",
        "livereload-js": "^4.0.1",
        "url": "^0.11.1"
      },
    ```

1. Install the dependencies
    ```bash
    pnpm install
    ```

1. In your code, import `RTM` from `agora-rtm-sdk`.
    ```javascript
      // Import the SDK
      import AgoraRTM from 'agora-rtm-sdk';

      // Create a client instance
      const signalingEngine = new AgoraRTM.RTM('app-id', 'user-id', { token: 'temporary-token' });

      // Listen for events
      signalingEngine.addEventListener('message', (eventArgs) => {
        console.log(`${eventArgs.publisher}: ${eventArgs.message}`);
      })

      // Login
      try {
        await signalingEngine.login();
      } catch (err) {
        console.log({ err }, 'error occurs at login.');
      }

      // Send channel message
      try {
        await signalingEngine.publish('channel', 'hello world');
      } catch (err) {
        console.log({ err }, 'error occurs at publish message');
      }
    ```
