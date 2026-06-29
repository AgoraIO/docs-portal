---
title: "Manual install"
description: "Links to the manual downloads for this product, and explanations on how to install them."
---

**Supported platforms:** Web, Android, iOS, macOS, Linux Java, Linux C++, Windows, Unity, and Flutter.

<Tabs defaultValue="web" groupId="platform">
<TabsList>
  <TabsTrigger value="web">Web</TabsTrigger>
  <TabsTrigger value="android">Android</TabsTrigger>
  <TabsTrigger value="ios">iOS</TabsTrigger>
  <TabsTrigger value="macos">macOS</TabsTrigger>
  <TabsTrigger value="linux-java">Linux Java</TabsTrigger>
  <TabsTrigger value="linux-cpp">Linux C++</TabsTrigger>
  <TabsTrigger value="windows">Windows</TabsTrigger>
  <TabsTrigger value="unity">Unity</TabsTrigger>
  <TabsTrigger value="flutter">Flutter</TabsTrigger>
</TabsList>

<TabsContent value="web">
To manually install the Signaling SDK for Web, do one of the following:

## Through the Agora website

1. Extract the files in Agora [Signaling SDK](/en/api-reference/sdks?product=signaling&platform=web) to a local folder. In the SDK folder, find the JS file in the `libs` folder, and save it to your project directory.

1. Open the HTML file in your project directory, and add the following code to refer to the JS file:

    ```javascript
    <script src="path to the JS file"></script>
    ```

1. To enable smart completions and type checking, take the following steps:

    1. Go to `libs/agora-rtm-sdk.d.ts` in the SDK folder, and save the TS file to your project directory.

    1. Add the following line to the beginning of the JS or TS file. Replace `path to the TS file` with the path to `agora-rtm-sdk.d.ts`.

        ```javascript
        /// <reference path="path to the TS file" />
        ```

## Through npm

1. In `package.json` for your project, add `agora-rtm-sdk` and its version number to the `dependencies` field:

    ```json
    "dependencies": {
      "agora-rtm-sdk": "^2.1.4-beta.0",
      "cors-anywhere": "^0.4.4",
      "livereload-js": "^4.0.1",
      "url": "^0.11.1"
    },
    ```

1. Install the dependencies:

    ```bash
    pnpm install
    ```

1. In your code, import `RTM` from `agora-rtm-sdk`:

    ```javascript
    // Import the SDK
    import AgoraRTM from 'agora-rtm-sdk';

    // Create a client instance
    const signalingEngine = new AgoraRTM.RTM('app-id', 'user-id', { token: 'temporary-token' });

    // Listen for events
    signalingEngine.addEventListener('message', (eventArgs) => {
      console.log(`${eventArgs.publisher}: ${eventArgs.message}`);
    });

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
</TabsContent>

<TabsContent value="android">
To manually install the Signaling SDK for Android, do one of the following:

## Automatically integrate the SDK with JitPack

1. Add the JitPack repository in the `build.gradle` file under the root directory of your project:

    ```text
    allprojects {
        repositories {
            ...
            maven { url 'https://www.jitpack.io' }
        }
    }
    ```

1. Add the `com.github.agorabuilder:rtm-sdk` dependency in the `/app/build.gradle` file under your project. For `X.Y.Z`, use the current SDK version number. You can visit JitPack.io to see the latest version number.

    ```text
    dependencies {
        implementation 'com.github.agorabuilder:rtm-sdk:X.Y.Z'
    }
    ```

## Manually copy the SDK files

To manually install the Signaling SDK for Android from a downloaded package:

1. Extract [Signaling SDK](/en/api-reference/sdks?product=signaling&platform=android) to a local directory, such as `<unzipped_package>`.

1. Copy the following files or folders from the `libs` folder to your Android project.

| File or folder | Path in your project |
| --- | --- |
| `agora-rtm_sdk.jar` | `/app/libs/` |
| `/arm64-v8a/libagora-rtm-sdk-jni.so` | `~/app/src/main/jniLibs/arm64-v8a/` |
| `/armeabi-v7a/libagora-rtm-sdk-jni.so` | `~/app/src/main/jniLibs/armeabi-v7a/` |
| `/x86/libagora-rtm-jni.so` | `~/app/src/main/jniLibs/x86/` |
| `/x86_64/libagora-rtm-sdk-jni.so` | `~/app/src/main/jniLibs/x86_64/` |
</TabsContent>

<TabsContent value="ios">
To manually install the Signaling SDK for iOS, do one of the following:

## Automatically integrate the SDK with CocoaPods

1. [Ensure that you have installed CocoaPods](https://guides.cocoapods.org/using/getting-started.html#getting-started).

1. In Terminal, navigate to the project path, and run the `pod init` command to create a `Podfile` in the project folder.

1. Open the `Podfile`, delete all contents, and input the following code:

    ```bash
    target 'Your App' do
        use_frameworks!
        pod 'AgoraRtm_iOS'
    end
    ```

1. Replace `Your App` with the target name of your project.

1. Go back to Terminal, and run the `pod update` command to update the local libraries.

1. Run the `pod install` command to install the Signaling SDK. Once you successfully install the SDK, it shows `Pod installation complete!` in Terminal, and you can see an `xcworkspace` file in the project folder.

1. Open the generated `xcworkspace` file.

## Manually add the SDK files

### v1.4.4 or later

iOS apps integrated with Signaling SDK v1.4.4 cannot be published on the App Store due to review issues. If you want to publish your app on the App Store, you must use other versions of the SDK.

1. Extract the files in [Signaling SDK](/en/api-reference/sdks?product=signaling&platform=ios) to a local folder.

1. Copy `AgoraRtmKit.xcframework` from the SDK to your project.

1. Open Xcode, and navigate to **TARGETS > Project Name > General > Frameworks, Libraries, and Embedded Content**.

1. Click **+ > Add Other... > Add Files** to add the corresponding library. Ensure that the Embed attribute of the dynamic library is **Embed & Sign**.

Once the dynamic library is added, the project automatically links to other system libraries.

The SDK uses the XCFramework. **If you are using a build tool that does not support XCFramework integration**, Agora provides the following scripts to help you integrate:

- Use the `change_to_all_arch.sh` script to convert the XCFramework to the universal framework.
- If you need to publish an iOS app on the App Store, use the `remove_simulator_arch.sh` script to remove the simulator before packaging the app.

The steps to execute these scripts are as follows:

1. Copy the above script files to your project, and execute the following code to generate `AgoraRtmKit.framework`:

    ```bash
    sh change_to_all_arch.sh "<AgoraRtmKit.xcframework path>"
    sh remove_simulator_arch.sh "<AgoraRtmKit.framework path>"
    ```

1. In Xcode, go to the **TARGETS > Project Name > Build Phases > Link Binary with Libraries** menu, and click **+** to add `AgoraRtmKit.xcframework`. Ensure that the **Embed** attribute of the dynamic library is **Embed & Sign**.

### Earlier than v1.4.4

1. Copy the `AgoraRtmKit.framework` file in the `libs` folder to the project folder.

1. In Xcode, go to the **TARGETS > Project Name > Build Phases > Link Binary with Libraries** menu, and click **+** to add the following frameworks and libraries. To add the `AgoraRtmKit.framework` file, remember to click **Add Other...** after clicking **+**.

    - `AgoraRtmKit.framework`
    - `libc++.tbd`
    - `libresolv.tbd`
    - `SystemConfiguration.framework`
    - `CoreTelephony.framework`
</TabsContent>

<TabsContent value="macos">
To manually install the Signaling SDK for macOS, do one of the following:

## Automatically integrate the SDK with CocoaPods

1. [Ensure that you have installed CocoaPods](https://guides.cocoapods.org/using/getting-started.html#getting-started).

1. In Terminal, navigate to the project path, and run the `pod init` command to create a `Podfile` in the project folder.

1. Open the `Podfile`, delete all contents, and input the following code:

    ```bash
    target 'Your App' do
        use_frameworks!
        pod 'AgoraRtm_macOS'
    end
    ```

1. Replace `Your App` with the target name of your project.

1. Go back to Terminal, and run the `pod update` command to update the local libraries.

1. Run the `pod install` command to install the Signaling SDK. Once you successfully install the SDK, it shows `Pod installation complete!` in Terminal, and you can see an `xcworkspace` file in the project folder.

1. Open the generated `xcworkspace` file.

## Manually add the SDK files

### v1.4.4 or later

Apps integrated with Signaling SDK v1.4.4 cannot be published on the App Store due to review issues. If you want to publish your app on the App Store, you must use other versions of the SDK.

1. Extract the files in [Signaling SDK](/en/api-reference/sdks?product=signaling&platform=macos) to a local folder.

1. Copy `AgoraRtmKit.xcframework` from the SDK to your project.

1. Open Xcode, and navigate to **TARGETS > Project Name > General > Frameworks, Libraries, and Embedded Content**.

1. Click **+ > Add Other... > Add Files** to add the corresponding library. Ensure that the Embed attribute of the dynamic library is **Embed & Sign**.

Once the dynamic library is added, the project automatically links to other system libraries.

The SDK uses the XCFramework. **If you are using a build tool that does not support XCFramework integration**, Agora provides the following scripts to help you integrate:

- Use the `change_to_all_arch.sh` script to convert the XCFramework to the universal framework.
- If you need to publish an app on the App Store, use the `remove_simulator_arch.sh` script to remove the simulator before packaging the app.

The steps to execute these scripts are as follows:

1. Copy the above script files to your project, and execute the following code to generate `AgoraRtmKit.framework`:

    ```bash
    sh change_to_all_arch.sh "<AgoraRtmKit.xcframework path>"
    sh remove_simulator_arch.sh "<AgoraRtmKit.framework path>"
    ```

1. In Xcode, go to the **TARGETS > Project Name > Build Phases > Link Binary with Libraries** menu, and click **+** to add `AgoraRtmKit.xcframework`. Ensure that the **Embed** attribute of the dynamic library is **Embed & Sign**.

### Earlier than v1.4.4

1. Copy the `AgoraRtmKit.framework` file in the `libs` folder to the project folder.

1. In Xcode, go to the **TARGETS > Project Name > Build Phases > Link Binary with Libraries** menu, and click **+** to add the following frameworks and libraries. To add the `AgoraRtmKit.framework` file, remember to click **Add Other...** after clicking **+**.

    - `AgoraRtmKit.framework`
    - `libc++.tbd`
    - `libresolv.tbd`
    - `SystemConfiguration.framework`
    - `CoreTelephony.framework`
</TabsContent>

<TabsContent value="linux-java">
To manually install the Signaling SDK for Linux Java:

1. Extract the files in Agora [Signaling SDK](/en/api-reference/sdks?product=signaling&platform=linux) to a local folder.

1. Copy the `*.so` file and the `*.jar` file to the `lib` folder.

1. Create a file named `pom.xml` in `RTM_quickstart` with the following content:

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <project xmlns="http://maven.apache.org/POM/4.0.0"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <modelVersion>4.0.0</modelVersion>

        <groupId>io.agora</groupId>
        <artifactId>Signaling-Client-Demo</artifactId>
        <version>1.0-SNAPSHOT</version>

        <properties>
            <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
            <maven.compiler.source>1.6</maven.compiler.source>
            <maven.compiler.target>1.6</maven.compiler.target>
        </properties>

        <dependencies>
            <dependency>
                <groupId>io.agora.rtm</groupId>
                <artifactId>agora-rtm-sdk</artifactId>
                <version>1.0</version>
            </dependency>
        </dependencies>

        <build>
            <plugins>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-shade-plugin</artifactId>
                    <version>3.2.0</version>
                    <executions>
                        <!-- Attach the shade into the package phase -->
                        <execution>
                            <phase>package</phase>
                            <goals>
                                <goal>shade</goal>
                            </goals>
                            <configuration>
                                <transformers>
                                    <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                                        <mainClass>io.agora.mainClass.RtmJavaDemo</mainClass>
                                    </transformer>
                                </transformers>
                            </configuration>
                        </execution>
                    </executions>
                </plugin>
            </plugins>
        </build>
    </project>
    ```
</TabsContent>

<TabsContent value="linux-cpp">
To manually install the Signaling SDK for Linux C++:

1. Extract the files in Agora [Signaling SDK](/en/api-reference/sdks?product=signaling&platform=linux) to a local folder.

1. Copy the `*.so` file in the SDK folder into your `lib` folder, and copy the `*.h` file in the SDK folder into your `include` folder.

1. Create a file named `CMakeLists.txt` under the `RTM_quickstart` directory to use CMake to build the project. The text file should contain the following content:

    ```text
    cmake_minimum_required(VERSION 2.8)
    project(rtmQuickstart)

    set(TARGET_NAME rtmQuickstart)
    set(SOURCES rtmQuickstart.cpp)
    set(HEADERS)

    set(TARGET_BUILD_TYPE "Debug")
    set(CMAKE_CXX_FLAGS "-fPIC -O2 -g -std=c++11 -msse2")

    include_directories(${CMAKE_SOURCE_DIR}/include)
    link_directories(${CMAKE_SOURCE_DIR}/lib)

    add_executable(${TARGET_NAME} ${SOURCES} ${HEADERS})
    target_link_libraries(${TARGET_NAME} agora_rtm_sdk pthread)
    ```
</TabsContent>

<TabsContent value="windows">
To manually install the Signaling SDK for Windows:

1. Extract the files in Agora [Signaling SDK](/en/api-reference/sdks?product=signaling&platform=windows) to a local folder.

1. Copy all subfolders of the SDK folder to the solution directory of your Visual Studio project.

    Ensure that the subfolders are in the same location as your `*.sln` file.

1. Configure the project properties.

    1. In Visual Studio, right-click the project name in the Solution Explorer window, click **Properties**, then click **OK**.

    1. Select **C/C++ > General > Additional Include Directories**, then click **Edit**.

    1. In the window, input `$(SolutionDir)include`.

    1. Select **Linker > General > Additional Library Directories**, then click **Edit**.

    1. In the window, input `$(SolutionDir)lib`.

    1. Select **Linker > Input > Additional Dependencies**, then click **Edit**.

    1. In the window, input `agora_rtm_sdk.lib`.
</TabsContent>

<TabsContent value="unity">
To manually install the Signaling SDK for Unity, do one of the following:

## Import the asset package

1. Extract the latest version of Agora [Signaling SDK for Unity](https://github.com/AgoraIO-Community/Agora-Unity-RTM-SDK/releases) to a local folder.

1. In the Unity Editor, select **Assets** > **Import Package** > **Custom Package**.

1. Select the Agora Signaling Unity asset package and click **Open**.

1. All packages of the SDK are chosen by default. Uncheck the packages you do not need and click **Import**.

## Manually add the SDK files

1. Extract the files in Agora [Signaling SDK](/en/api-reference/sdks?product=signaling&platform=unity) to a local folder.

1. Copy the `Rtm-Scripts` folder under the `libs` folder in the SDK package to the `Assets` folder of the project path.

1. Copy the following files under the `libs/Plugins` path in the SDK package to the corresponding path of the project:

| Development platform | File or folder | Project directory |
| --- | --- | --- |
| Android | `Plugins/Android` | `/Assets/Plugins/Android/` |
| iOS | `Plugins/iOS` | `/Assets/Plugins/iOS` |
| macOS | `Plugins/macOS` | `/Assets/Plugins/macOS` |
| Windows | `Plugins/x86` | `/Assets/Plugins/x86` |
| Windows | `Plugins/x86_64` | `/Assets/Plugins/x86_64` |
</TabsContent>

<TabsContent value="flutter">
To manually install the Signaling SDK for Flutter:

1. Open a terminal and execute the following command to create a new Flutter project:

    ```bash
    flutter create project_name
    ```

1. Open the project in your IDE. Add the Signaling SDK dependency to `pubspec.yaml` under `dependencies`:

    ```yaml
    dependencies:
      # Add the Signaling SDK dependency, use the latest version number
      agora_rtm: ^2.2.1
    ```

:::info
To integrate Signaling SDK version 2.2.1 or above and Video SDK version 4.3.0 or above at the same time, refer to [Handle integration issues](/en/api-reference/faq/integration/rtm2_rtc_integration_issue).
:::

1. To install the dependencies, open the terminal and execute the following command in the project path:

    ```bash
    flutter pub get
    ```
</TabsContent>
</Tabs>
