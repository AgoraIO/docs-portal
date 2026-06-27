---
title: "Manual install"
description: "Links to the manual downloads for this product, and explanations on how to install them."
---

To manually install Signaling SDK, do one of the following:

<PlatformStructured platform="web">

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

</PlatformStructured>

<PlatformStructured platform="android">

## Automatically integrate the SDK with JitPack

1. Add the address of JitPack in the `build.gradle` file under the root directory of your project.

   ```
   allprojects {
           repositories {
               ...
               maven { url 'https://www.jitpack.io' }
           }
       }
   ```

2. Add the `com.github.agorabuilder:rtm-sdk` dependency in the `/app/build.gradle` file under your project. For `X.Y.Z`, fill in the current SDK version number.

   ```
   dependencies: {
       ...
       implementation 'com.github.agorabuilder:rtm-sdk:X.Y.Z'
   }
   ```

## Manually copy the SDK files

To manually install Signaling SDK from a download:

1. Extract the files in [Signaling SDK](https://docs.agora.io/en/sdks) to a local directory, `<unzipped_package>`.

2. Copy the following files from the `libs` folder of the downloaded SDK to the corresponding directory of your project:

| File or folder | Path in your project |
| -------------- | -------------------- |
| `agora-rtm_sdk.jar` | `/app/libs/` |
| `arm64-v8a/libagora-rtm-sdk-jni.so` | `/app/src/main/jniLibs/arm64-v8a/` |
| `armeabi-v7a/libagora-rtm-sdk-jni.so` | `/app/src/main/jniLibs/armeabi-v7a/` |
| `x86/libagora-rtm-jni.so` | `/app/src/main/jniLibs/x86/` |
| `x86_64/libagora-rtm-sdk-jni.so` | `/app/src/main/jniLibs/x86_64/` |

</PlatformStructured>

<PlatformStructured platform="ios">

## Automatically integrate the SDK with CocoaPods

1. [Ensure that you have installed **CocoaPods**](https://guides.cocoapods.org/using/getting-started.html#getting-started).

2. In Terminal, navigate to the project path, and run `pod init` to create a `Podfile` in the project folder.

3. Open the `Podfile`, delete all contents, and enter the following:

   ```bash
   target 'Your App' do
       use_frameworks!
       pod 'AgoraRtm_iOS'
   end
   ```

4. Replace `Your App` with the target name of your project.

5. Go back to Terminal, and run `pod update` to update the local libraries.

6. Run `pod install` to install Signaling SDK. After a successful installation, Terminal shows `Pod installation complete!`, and you can see an `xcworkspace` file in the project folder.

7. Open the generated `xcworkspace` file.

## Manually add the SDK files

For v1.4.4 or later:

The iOS apps integrated with Signaling SDK v1.4.4 cannot be published on the App Store due to review issues. If you want to publish your app on the App Store, use another SDK version.

1. Extract the files in [Signaling SDK](https://docs.agora.io/en/sdks) to a local folder.
2. Copy `AgoraRtmKit.xcframework` from the SDK to your project.
3. Open Xcode, and navigate to **TARGETS > Project Name > General > Frameworks, Libraries, and Embedded Content**.
4. Click **+ > Add Other… > Add Files** to add the corresponding library. Ensure that the **Embed** attribute of the dynamic library is **Embed & Sign**.

Once the dynamic library is added, the project automatically links to other system libraries.

The SDK uses XCFramework. If you are using a build tool that does not support XCFramework integration, Agora provides the following scripts to help you integrate:

- Use `change_to_all_arch.sh` to convert the XCFramework to the universal framework.
- If you need to publish an iOS app on the App Store, use `remove_simulator_arch.sh` to remove the simulator before packaging the app.

Run the scripts as follows:

1. Copy the script files to your project, and execute the following code to generate `AgoraRtmKit.framework`:

   ```bash
   sh change_to_all_arch.sh "<AgoraRtmKit.xcframework path>"
   sh remove_simulator_arch.sh "<AgoraRtmKit.framework path>"
   ```

2. In Xcode, go to **TARGETS > Project Name > Build Phases > Link Binary with Libraries**, click **+**, and add `AgoraRtmKit.xcframework`. Ensure that the **Embed** attribute of the dynamic library is **Embed & Sign**.

For versions earlier than v1.4.4:

1. Copy `AgoraRtmKit.framework` from the `libs` folder to the project folder.

2. In Xcode, go to **TARGETS > Project Name > Build Phases > Link Binary with Libraries**, click **+**, and add the following frameworks and libraries. To add `AgoraRtmKit.framework`, click **Add Other...** after clicking **+**.

- `AgoraRtmKit.framework`
- `libc++.tbd`
- `libresolv.tbd`
- `SystemConfiguration.framework`
- `CoreTelephony.framework`

</PlatformStructured>

<PlatformStructured platform="macos">

## Automatically integrate the SDK with CocoaPods

1. [Ensure that you have installed **CocoaPods**](https://guides.cocoapods.org/using/getting-started.html#getting-started).

2. In Terminal, navigate to the project path, and run `pod init` to create a `Podfile` in the project folder.

3. Open the `Podfile`, delete all contents, and enter the following:

   ```bash
   target 'Your App' do
       use_frameworks!
       pod 'AgoraRtm_macOS'
   end
   ```

4. Replace `Your App` with the target name of your project.

5. Go back to Terminal, and run `pod update` to update the local libraries.

6. Run `pod install` to install Signaling SDK. After a successful installation, Terminal shows `Pod installation complete!`, and you can see an `xcworkspace` file in the project folder.

7. Open the generated `xcworkspace` file.

## Manually add the SDK files

For v1.4.4 or later:

1. Extract the files in [Signaling SDK](https://docs.agora.io/en/sdks) to a local folder.
2. Copy `AgoraRtmKit.xcframework` from the SDK to your project.
3. Open Xcode, and navigate to **TARGETS > Project Name > General > Frameworks, Libraries, and Embedded Content**.
4. Click **+ > Add Other… > Add Files** to add the corresponding library. Ensure that the **Embed** attribute of the dynamic library is **Embed & Sign**.

Once the dynamic library is added, the project automatically links to other system libraries.

If you are using a build tool that does not support XCFramework integration, use `change_to_all_arch.sh` and `remove_simulator_arch.sh` as described in the iOS section to generate and package a universal framework.

For versions earlier than v1.4.4:

1. Copy `AgoraRtmKit.framework` from the `libs` folder to the project folder.

2. In Xcode, go to **TARGETS > Project Name > Build Phases > Link Binary with Libraries**, click **+**, and add the required frameworks and libraries, including `AgoraRtmKit.framework`.

</PlatformStructured>
