---
title: "SDK quickstart"
description: "Rapidly develop and easily enhance IoT solutions with audio communication and face-to-face interaction."
---
The Internet of things (IoT) connects physical objects with sensors, processors, and software to enable data exchange with other devices. In related applications, such as apps for smart door bells and remote monitoring, IoT devices send or receive audio and video streams to perform their function. Agora IoT SDK gives you the ability to enable live voice and video streams on IoT devices on a variety of platforms and for many use cases, while also offering a compact SDK size, low memory usage, and low power consumption. Some typical application use-cases for IoT SDK include:

* **Real-time monitoring**:  Integration into smart cameras and smart doorbells enables mobile device users to receive video feed from one or more cameras.

* **Two-way audio communication between mobile devices**: With IoT SDK integrated into smart watches, users perform two-way audio communication between mobile devices.

This page shows the minimum code you need to integrate audio and video communication features into your IoT devices using IoT SDK.

## Understand the tech

The lightweight IoT SDK is ideal for IoT applications due to its low power consumption. The SDK provides the following performance benefits:

* **Small SDK size**: The increase in app size is less than 400 KB after integration.
* **Low memory usage**: When the SDK is simultaneously sending and receiving 320x240 `H.264` video data, memory usage is less than 2 MB.
* **High connectivity**: Under normal conditions, connectivity is greater than 99%.
* **Data transfer speed**: A maximum of 50 Mbps for a user in a channel.
* **Network adaptability**:	Non-aware recovery from up to 50% packet loss.

The following figure shows the workflow you need to integrate IoT SDK into your app:

![IoT](/images/iot/iot-get-started.svg)

## Prerequisites

In order to follow this procedure you must have:

To test the code used in this page you need to have:
* An Agora [account](build/manage-agora-account.md) and [project](build/manage-agora-account.md).
* A computer with Internet access.
    Ensure that no firewall is blocking your network communication.

* Implemented the [SDK quickstart](index.md).

* IoT SDK for Android supports the following ABIs:

    * armeabi-v7a
    * arm64-v8a
    * x86
    * x86-64

## Project setup

To integrate IoT SDK into your app, do the following:

1.  In Android Studio, create a new **Phone and Tablet**, **Java** [Android project](https://developer.android.com/studio/projects/create-project) with an **Empty Activity**.

    After creating the project, Android Studio automatically starts gradle sync. Ensure that the sync succeeds before you continue.

2.  Add the IoT SDK to your Android project. To do this:

    1. [Download](/en/api-reference/sdks?product=iot&platform=android) the IoT SDK and extract the archive to a temporary folder `<unzipped_package>`.

    2.  Copy the following files and folders from `<unzipped_package>/agora_rtc_example_android/app/libs` to your project:

        | File or folder           | Path in your project     |
        |--------------------------|--------------------------|
        | Files:                    |                          |
        | `agora-rtc-sdk.jar`      | `/app/libs/`             |
        | Folders:                  |                          |
        | `arm64-v8a`                | `/app/src/main/jniLibs/` |
        | `armeabi-v7a`            | `/app/src/main/jniLibs/` |
        | `x86`                    | `/app/src/main/jniLibs/` |
        | `x86_64`                 | `/app/src/main/jniLibs/` |

    3.  In Android Studio, right-click the `/app/libs/agora-rtc-sdk.jar` file on the navigation bar and then select **Add as a library**.

3.  Add permissions for network and device access.

        In `/app/Manifests/AndroidManifest.xml`, add the following permissions after `</application>`:

        ```java
        <uses-permission android:name="android.permission.READ_PHONE_STATE"/>
        <uses-permission android:name="android.permission.INTERNET" />
        <uses-permission android:name="android.permission.RECORD_AUDIO" />
        <uses-permission android:name="android.permission.CAMERA" />
        <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
        <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
        <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
        ```
4. Add sample audio and video files to the project resources folder:

    1. In Android Studio, right-click the `res` folder and choose **New > Android Resource Directory**. 
    1. Under **Resource Type** select **raw** and click **OK**.
    1. In the `/app/src/main/res/raw` folder, copy the files `send_audio_16k_1ch.pcm` and `send_video.h264` from the `<unzipped_package>/agora_rtc_example_android/app/src/main/res/raw` folder.

You are ready to add audio and video communication features to your IoT app.

## Implement audio and video communication 

This section shows how to use the IoT SDK to implement audio and video communication into your IoT app, step-by-step.

At startup, you initialize the engine. When a user taps a button, the app joins a channel and sends audio and video data to remote users. 

### Implement the user interface

In this simple interface, you create two buttons to join and leave a channel. In `/app/res/layout/activity_main.xml`, replace the contents of the file with the following:

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <ScrollView xmlns:android="http://schemas.android.com/apk/res/android"
        xmlns:tools="http://schemas.android.com/tools"
        android:id="@+id/activity_main"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        tools:context=".MainActivity">

        <RelativeLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content">

            <Button
                android:id="@+id/JoinButton"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_margin="10dp"
                android:onClick="joinChannel"
                android:text="Join" />

            <Button
                android:id="@+id/LeaveButton"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_alignTop="@id/JoinButton"
                android:layout_toEndOf="@id/JoinButton"
                android:onClick="leaveChannel"
                android:text="Leave" />
        </RelativeLayout>
    </ScrollView>
    ```

You see errors in your IDE. This is because the layout refers to methods that you create later.

### Handle the system logic

Import the necessary Android classes and handle Android permissions.

1.  **Import the Android classes**

    In `/app/java/com.example.<projectname>/MainActivity`, add the following lines after `package com.example.<project name>`:

        ```java
        import androidx.core.app.ActivityCompat;
        import androidx.core.content.ContextCompat;
        import android.Manifest;
        import android.content.pm.PackageManager;
        import android.view.View;
        import android.widget.Toast;
        ```

2.  **Handle Android permissions**

    Ensure that the permissions necessary to use audio and video features are granted. If the permissions are not granted, use the built-in Android feature to request them; if they are granted, return `true`.

    In `/app/java/com.example.<projectname>/MainActivity`, add the following lines before the `onCreate` method:

    ```java
    private static final int PERMISSION_REQ_ID = 22;
    private static final String[] REQUESTED_PERMISSIONS =
        {
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.CAMERA
        };

    private boolean checkSelfPermission()
    {
        if (ContextCompat.checkSelfPermission(this, REQUESTED_PERMISSIONS[0]) !=  PackageManager.PERMISSION_GRANTED ||
                ContextCompat.checkSelfPermission(this, REQUESTED_PERMISSIONS[1]) !=  PackageManager.PERMISSION_GRANTED)
        {
            return false;
        }
        return true;
    }
    ```

3.  **Show status updates to your users**

    In `/app/java/com.example.<projectname>/MainActivity`, add the following lines before the `onCreate` method:

    ```javascript
    void showMessage(String message) {
        runOnUiThread(() ->
            Toast.makeText(getApplicationContext(), message, Toast.LENGTH_SHORT).show());
    }
    ```

### Implement the channel logic

To start Agora engine and join a channel, take the following steps:

1.  **Import the IoT SDK classes**

    In `/app/java/com.example.<projectname>/MainActivity`, add the following lines after the last `import` statement:

        ```java
        import io.agora.rtc.AgoraRtcService;
        import io.agora.rtc.AgoraRtcEvents;
        ```

2.  **Declare the variables that you use to join a channel and stream Audio/Video**

    In `/app/java/com.example.<projectname>/MainActivity`, add the following lines to the `MainActivity` class:

        ```java
        private final String appId = "<Your appId>"; // The App ID of your project generated on Agora Console.
        private String channelName = "<Your channel name>";
        private String token = "<Your authentication token>"; // A temp token generated on Agora Console.
        private final int uid = 0; // An integer that identifies the local user.
        private AgoraRtcService agoraEngine;
        private final String deviceId = "MyDev01";
        private boolean isJoined = false;
        private final String rtcLicense = "";
        private int connectionId;
        private AudioSendThread audioThread = null;
        private VideoSendThread videoThread = null;
        ```

3.  **Setup Agora engine**

    To use IoT features, you use the IoT SDK to create an `AgoraRtcService` instance. You then use this instance to open a connection. In `/app/java/com.example.<projectname>/MainActivity`, add the following code before the `onCreate` method:

    ```java
    private void setupAgoraEngine(){
        agoraEngine = new AgoraRtcService();
        showMessage("RTC SDK version " + agoraEngine.getVersion());

        // Initialize the engine
        AgoraRtcService.RtcServiceOptions options = new AgoraRtcService.RtcServiceOptions();
        options.areaCode = AgoraRtcService.AreaCode.AREA_CODE_GLOB;
        options.productId = deviceId;
        options.licenseValue = rtcLicense;
        int ret = agoraEngine.init(appId, agoraRtcEvents, options);
        if (ret != AgoraRtcService.ErrorCode.ERR_OKAY) {
            showMessage("Fail to initialize the SDK " + ret);
            agoraEngine = null;
            return;
        } else {
            showMessage("Engine initialized");
        }

        // Create a connection
        connectionId = agoraEngine.createConnection();
        if (connectionId == AgoraRtcService.ConnectionIdSpecial.CONNECTION_ID_INVALID) {
            showMessage("Failed to createConnection");
        } else {
            showMessage("Connected");
        }
    }
    ```

4.  **At startup, ensure necessary permissions and initialize the engine**
    
    In order to send video and audio streams, you need to ensure that the local user gives permission to access the camera and microphone at startup. After the permissions are granted, you setup the IoT SDK engine.

    In `/app/java/com.example.<projectname>/MainActivity`, replace `onCreate` with the following code:

        ```java
        @Override
        protected void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            setContentView(R.layout.activity_main);

            // If all the permissions are granted, setup the engine
            if (!checkSelfPermission()) {
                ActivityCompat.requestPermissions(this, REQUESTED_PERMISSIONS, PERMISSION_REQ_ID);
            }
            setupAgoraEngine();
        }
        ```

5.  **Receive and handle engine events**

    The `AgoraRtcService` provides a number of callbacks that enable you to respond to important events. To add an event handler to your app, in `/app/java/com.example.<projectname>/MainActivity`, add the following lines before `setupAgoraEngine`:

        ```java
        private final AgoraRtcEvents agoraRtcEvents = new AgoraRtcEvents() {
            @Override
            public void onJoinChannelSuccess(int connId, int uid, int elapsed_ms) {
                // Successfully joined a channel
                isJoined = true;
                showMessage("Successfully joined the channel: " + channelName);

                // Create a thread to send video frames
                videoThread = new VideoSendThread(getApplicationContext(), agoraEngine, 
                    channelName, connectionId);
                // Create a thread to send audio frames
                audioThread = new AudioSendThread(getApplicationContext(), agoraEngine, 
                    channelName, connectionId, 16000, 1, 2);

                // Start audio and video threads
                videoThread.sendStart();
                audioThread.sendStart();
                showMessage("Audio and video threads started");
            }

            @Override
            public void onConnectionLost(int connId) {
                // Connection was lost.
            }

            @Override
            public void onRejoinChannelSuccess(int connId, int uid, int elapsed_ms) {
                // The channel was successfully rejoined
            }

            @Override
            public void onLicenseValidationFailure(int connId, int error) {
                // When joining a channel, Agora will verify the License you passed in init(). 
                // If verification fails, the SDK will trigger this callback
            }

            @Override
            public void onError(int connId, int code, String msg) {
                // A warning callback that reports a network or media related error.
                // Normally, the app can ignore the warning message and the SDK will automatically recover.
            }

            @Override
            public void onUserJoined(int connId, int uid, int elapsed_ms) {
                // A remote user joined the channel.
            }

            @Override
            public void onUserOffline(int connId, int uid, int reason) {
                // A remote user went offline
            }

            @Override
            public void onUserMuteAudio(int connId, int uid, boolean muted) {
                // A remote user paused or resumed sending the audio stream
            }

            @Override
            public void onUserMuteVideo(int connId, int uid, boolean muted) {
                // A remote user paused or resumed sending the video stream
            }

            @Override
            public void onKeyFrameGenReq(int connId, int requestedUid, int streamType) {
                // Callback for key frame requests from remote users in the channel
            }

            @Override
            public void onAudioData(int connId, int uid, int sent_ts, byte[] data, AgoraRtcService.AudioFrameInfo info) {
                // Receive the audio frame callback of the remote user in the channel.
                // Add code here to render audio.
            }

            @Override
            public void onMixedAudioData(int connId, byte[] data, AgoraRtcService.AudioFrameInfo info) {
                // Callback for receiving audio mixing data from local and remote users in the channel.
                // This callback fires every 20 ms.
            }

            @Override
            public void onVideoData(int connId, int uid, int sent_ts, byte[] data, AgoraRtcService.VideoFrameInfo info) {
                // Receive video frame data from a remote user in the channel.
                // Add code here to render video.
            }

            @Override
            public void onTargetBitrateChanged(int connId, int targetBps) {
                // Encoder code rate update notification callback.
                // Use this callback to update the encoder bit rate.
            }

            @Override
            public void onTokenPrivilegeWillExpire(int connId, String token) {
                // The current authentication token will expire in 30 seconds
                // Get a new token and call the renewToken method
            }

            @Override
            public void onMediaCtrlReceive(int connId, int uid, byte[] payload) {

            }

        };
        ```

6.  **Join a channel**

    When a local user initiates a connection, call `joinChannel`. This method securely connects the local user to a channel using the authentication token. In `/app/java/com.example.<projectname>/MainActivity`, add the following code after `setupAgoraEngine`:

        ```java
        public void joinChannel(View view) {
            // Set channel options
            AgoraRtcService.ChannelOptions channelOptions = new AgoraRtcService.ChannelOptions();
            channelOptions.autoSubscribeAudio = true;
            channelOptions.autoSubscribeVideo = true;
            channelOptions.audioCodecOpt.audioCodecType
                    = AgoraRtcService.AudioCodecType.AUDIO_CODEC_TYPE_OPUS;
            channelOptions.audioCodecOpt.pcmSampleRate = 16000;
            channelOptions.audioCodecOpt.pcmChannelNum = 1;

            // Join a channel
            int ret = agoraEngine.joinChannel(connectionId, channelName,
                    uid, token, channelOptions);
            if (ret != AgoraRtcService.ErrorCode.ERR_OKAY) {
                showMessage("Failed to join a channel");
                isJoined = false;
            } else {
                isJoined = true;
            }
        }
        ```

    After joining an RTC channel, you can:

        * Listen to the `onAudioData` callback to receive audio from users in the channel.
        * Listen to the `onVideoData` callback to receive video from users in the channel. 
        * Call the `sendAudioData` method to send audio data.
        * Call the `sendVideoData` method to send video data.

### Send audio and video data

You send audio and video data in separate threads. The sending interval should be consistent with the video frame rate and audio frame length.

To stream audio and video data:

1. **Add a `StreamFile` class for managing media files**

    You use `StreamFile` to open, read, and close audio and video files. In Android Studio, select **File > New > Java Class**. Name the class `StreamFile` and replace the contents of the file with the following code:

        ```java
        package <com.example.your app name>; // Should be same as your MainActivity package

        import android.content.Context;
        import android.content.res.Resources;
        import android.util.Log;
        import java.io.IOException;
        import java.io.InputStream;

        public class StreamFile {
            private final String TAG = "RTSADEMO/StreamFile";
            private InputStream mInStream = null;

            // Public Methods
            public boolean open(Context ctx, int resId) {
                try {
                    Resources resources = ctx.getResources();
                    mInStream = resources.openRawResource(resId);
                    
                } catch (Resources.NotFoundException notFoundExp)          {
                    notFoundExp.printStackTrace();
                    Log.e(TAG, "<StreamFile.open> file not found");
                    return false;

                } catch (SecurityException fileSecExp) {
                    fileSecExp.printStackTrace();
                    Log.e(TAG, "<StreamFile.open> security exception");
                    return false;
                }
                return true;
            }

            public void close() {
                if (mInStream != null) {
                    try {
                        mInStream.close();
                    } catch (IOException fileCloseExp)  {
                        fileCloseExp.printStackTrace();
                    }
                    mInStream = null;
                }
            }

            public boolean isOpened() {
                return (mInStream != null);
            }

            public int readData(byte[] readBuffer) {
                if (mInStream == null) {
                    return -2;
                }

                try {
                    int readSize = mInStream.read(readBuffer);
                    return readSize;

                } catch (IOException ioExp) {
                    return -3;
                }
            }

            public int reset() {
                if (mInStream == null) {
                    return -2;
                }

                try {
                    mInStream.reset();
                    return 0;
                } catch (IOException ioExp) {
                    return -3;
                }
            }
        }
        ```
    
2. **Add a thread class to send audio**

    In Android Studio, select **File > New > Java Class**. Name the class `AudioSendThread` and replace the contents of the file with the following code:

        ```java
        package <com.example.your app name>; // Should be same as your MainActivity package

        import android.content.Context;
        import android.util.Log;

        import io.agora.rtc.AgoraRtcService;
        import io.agora.rtc.AgoraRtcService.AudioFrameInfo;
        import io.agora.rtc.AgoraRtcService.AudioDataType;

        public class AudioSendThread  extends Thread {
            private final String TAG = "AudioSendThread";
            private final Object mExitEvent = new Object();
            private AgoraRtcService mRtcService;
            private String mChannelName;
            private int mConnectionId;
            private volatile boolean mRunning = false;
            private Context mContext;
            private final int mSampleRate, mChannelNumber, mSampleBytes;

            // Public Methods
            public AudioSendThread(Context ctx, AgoraRtcService rtcService, String chnlName, 
                int connectionId, int sampleRate, int channelNumber, int sampleBytes) {
                mContext = ctx;
                mRtcService = rtcService;
                mChannelName = chnlName;
                mConnectionId = connectionId;
                mSampleRate = sampleRate;
                mChannelNumber = channelNumber;
                mSampleBytes = sampleBytes;
            }

            public boolean sendStart() {
                try {
                    mRunning = true;
                    this.start();
                } catch (IllegalThreadStateException exp) {
                    exp.printStackTrace();
                    mRunning = false;
                    return false;
                }
                return true;
            }

            public void sendStop() {
                mRunning = false;
                synchronized (mExitEvent) {
                    try {
                        mExitEvent.wait(200);
                    } catch (InterruptedException interruptExp) {
                        interruptExp.printStackTrace();
                    }
                }
            }

            @Override
            public void run() {
                Log.d(TAG, "<AudioSendThread.run> ==>Enter");
                StreamFile  audioStream = new StreamFile();
                audioStream.open(mContext, R.raw.send_audio_16k_1ch);

                int bytesPerSec = mSampleRate*mChannelNumber*mSampleBytes;
                int bufferSize = bytesPerSec / 50;      // 20ms buffer
                byte[] readBuffer = new byte[bufferSize];
                byte[] sendBuffer = new byte[bufferSize];

                while (mRunning && (audioStream.isOpened())) {
                    // Read an audio frame
                    int readSize = audioStream.readData(readBuffer);
                    if (readSize <= 0) {
                        Log.d(TAG, "<AudioSendThread.run> read audio frame EOF, reset to start");
                        audioStream.reset();
                        continue;
                    }
                    // Copy data to send buffer
                    if (readSize != sendBuffer.length) {
                        sendBuffer = new byte[readSize];
                    }
                    System.arraycopy(readBuffer, 0, sendBuffer, 0, readSize);

                    // Send audio frame, data size is 20ms
                    AudioFrameInfo audioFrameInfo = new AudioFrameInfo();
                    audioFrameInfo.dataType = AudioDataType.AUDIO_DATA_TYPE_PCM;
                    int ret = mRtcService.sendAudioData(mConnectionId, sendBuffer, audioFrameInfo);
                    if (ret < 0) {
                        Log.e(TAG, "<run> sendAudioData() failure, ret=" + ret);
                    }

                    sleepCurrThread(20); // sleep 20ms
                }
                audioStream.close();
                Log.d(TAG, "<run> <==Exit");

                // Notify: exit audio thread
                synchronized(mExitEvent) {
                    mExitEvent.notify();
                }
            }

            boolean sleepCurrThread(long milliseconds) {
                try {
                    Thread.sleep(milliseconds);
                } catch (InterruptedException inerruptExp) {
                    inerruptExp.printStackTrace();
                    return false;
                }
                return true;
            }
        }
        ```
    
3. **Add a thread class to send video**

    In Android Studio, select **File > New > Java Class**. Name the class `VideoSendThread` and replace the contents of the file with the following code:

        ```java
        package <com.example.your app name>; // Should be same as your MainActivity package
        
        import android.content.Context;
        import android.util.Log;

        import io.agora.rtc.AgoraRtcService;
        import io.agora.rtc.AgoraRtcService.VideoFrameInfo;
        import io.agora.rtc.AgoraRtcService.VideoDataType;
        import io.agora.rtc.AgoraRtcService.VideoFrameType;
        import io.agora.rtc.AgoraRtcService.VideoFrameRate;

        public class VideoSendThread  extends Thread {
            private final String TAG = "VideoSendThread";
            private final static int[] FRAME_SIZE_ARR = {
                9654, 1617, 1884, 2003, 2362, 1887, 1773, 1943, 2081, 2000, 1975, 2093, 2247, 2469, 2578,
                2554, 2548, 2116, 2327, 2254, 2270, 1565, 2498, 2409, 2783, 2394, 2248, 1337, 1318, 1186,
                12217, 1366, 1570, 1970, 2066, 2091, 1856, 2477, 1941, 1956, 1329, 1944, 2054, 1706, 1714,
                1607, 1757, 2381, 2240, 2555, 2224, 1929, 1622, 1785, 2320, 2511, 1961, 2051, 2340, 1958,
                12223, 1605, 1690, 1950, 1848, 2130, 2177, 2539, 1868, 2043, 1942, 2188, 1974, 2272, 1716,
                2150, 1837, 2386, 2720, 2282, 2561, 2237, 1848, 1895, 2511, 2366, 2228, 1966, 1829, 2097,
                11302, 2034, 2552, 2679, 3223, 2408, 1921, 1721, 1899, 1630, 1689, 1602, 1798, 1456, 1914,
                1625, 1586, 1002, 1538, 1637, 1582, 1386, 1752, 1527, 1739, 1448, 1641, 1279, 1501, 1523,
                11903, 1057, 1504, 1495, 1917, 2051, 2237, 2169, 2437, 2315, 2162, 1870, 1962, 2034, 2141,
                1676, 1874, 2068, 2468, 2429, 2458, 2583, 2626, 1967, 2558, 2301, 2473, 2138, 2152, 1712,
                10497, 1528, 2165, 2941, 3253, 2867, 3679, 3621, 3564, 1723, 2013, 1921, 1757, 1517, 1899,
                1407, 1480, 1403, 1604, 1836, 2442, 2680, 3154, 3329, 3219, 2612, 2759, 2783, 2622, 2855,
                10619, 2145, 2259, 2513, 2779, 2757, 3199, 3081, 2684, 2977, 2884, 3170, 3346, 3164, 3102,
                3486, 3190, 2414, 2614, 2425, 2705, 3173, 3114, 2769, 2650, 2604, 2355, 2283, 2251, 2288,
                11091, 2930, 3032, 2907, 2853, 3308, 2904, 3742, 3324, 4308, 4067, 2709, 2927, 1909, 2109,
                2210, 2875, 2119, 2772, 4059, 4111, 2840, 2528, 1920, 3217, 1615, 2640, 2209, 3503, 2085,
                19570, 1705, 2747, 2420, 2553, 2435, 3508, 2084, 2188, 1994, 5324, 1771, 1397, 2608, 3201,
                2728, 2675, 3498, 1783, 1308, 2611, 2799, 3630, 2243, 1898, 2052, 3272, 2271, 2976, 3679,
                22520, 712, 1650, 1846, 2142, 1464, 1903, 1828, 2564, 1365, 1359, 1262, 3015, 2596, 2472,
                2639, 3447, 2879, 2546, 2643, 3240, 1759, 2123, 1277, 2336, 1664, 2104, 1881, 1267, 516,
            };

            private final static int FRAME_COUNT = 300;
            private final Object mExitEvent = new Object();
            private Context mContext;
            private AgoraRtcService mRtcService;
            private String mChannelName;
            private int mConnectionId;
            private volatile boolean mRunning = false;

            public VideoSendThread(Context ctx, AgoraRtcService rtcService, String chnlName, int connectionId) {
                mContext = ctx;
                mRtcService = rtcService;
                mChannelName = chnlName;
                mConnectionId = connectionId;
            }

            public boolean sendStart() {
                try {
                    mRunning = true;
                    this.start();
                } catch (IllegalThreadStateException exp) {
                    exp.printStackTrace();
                    mRunning = false;
                    return false;
                }
                return true;
            }

            public void sendStop() {
                mRunning = false;
                synchronized (mExitEvent) {
                    try {
                        mExitEvent.wait(200);
                    } catch (InterruptedException interruptExp) {
                        interruptExp.printStackTrace();
                    }
                }
            }

            @Override
            public void run() {
                Log.d(TAG, "<run> ==>Enter");
                StreamFile  videoStream = new StreamFile();
                videoStream.open(mContext, R.raw.send_video);

                int frameIndex = 0;
                while (mRunning && (videoStream.isOpened())) {
                    // Read a video frame
                    if (frameIndex >= FRAME_COUNT) {
                        Log.d(TAG, "<run> read video frame EOF, reset to start");
                        frameIndex = 0;
                        videoStream.reset();
                    }
                    int frameSize = FRAME_SIZE_ARR[frameIndex];
                    byte[] videoBuffer = new byte[frameSize];
                    int readSize = videoStream.readData(videoBuffer);
                    if (readSize <= 0) {
                        Log.e(TAG, "<run> read video frame error, readSize=" + readSize);
                    }

                    // Send a video frame
                    int streamId = 0;
                    VideoFrameInfo videoFrameInfo = new VideoFrameInfo();
                    videoFrameInfo.dataType = VideoDataType.VIDEO_DATA_TYPE_H264;
                    videoFrameInfo.frameType = VideoFrameType.VIDEO_FRAME_KEY;
                    videoFrameInfo.frameRate = VideoFrameRate.VIDEO_FRAME_RATE_FPS_15;
                    int ret = mRtcService.sendVideoData(mConnectionId, videoBuffer, videoFrameInfo);
                    if (ret < 0) {
                        Log.e(TAG, "<VideoSendThread.run> sendVideoData() failure, ret=" + ret
                                + ", dataSize=" + videoBuffer.length);
                    }

                    frameIndex++;
                    videoBuffer = null;

                    sleepCurrThread(66);
                }

                videoStream.close();
                Log.d(TAG, "<run> <==Exit");

                // Notify: exit video thread
                synchronized(mExitEvent) {
                    mExitEvent.notify();
                }
            }

            boolean sleepCurrThread(long milliseconds) {
                try {
                    Thread.sleep(milliseconds);
                } catch (InterruptedException inerruptExp) {
                    inerruptExp.printStackTrace();
                    return false;
                }
                return true;
            }

        }        
        ```

### Stop your app

In this implementation, you initiate and destroy the engine when the app opens and closes. The local user joins and leaves a channel using the same engine instance. To elegantly exit your app:

1.  **Leave the channel when a user ends the call**

    When a user presses the **Leave** button, use `leaveChannel` to exit the channel. In `/app/java/com.example.<projectname>/MainActivity`, add `leaveChannel` after `joinChannel`:

        ```java
        public void leaveChannel(View view) {
            if (!isJoined) {
                showMessage("Join a channel first");

            } else {
                // Stop audio and threads
                if (videoThread != null) {
                    videoThread.sendStop();
                    videoThread = null;
                }
                if (audioThread != null) {
                    audioThread.sendStop();
                    audioThread = null;
                }
                showMessage("Audio and video threads stopped");

                // Leave the channel
                int ret = agoraEngine.leaveChannel(connectionId);
                if (ret != AgoraRtcService.ErrorCode.ERR_OKAY) {
                    showMessage("Failed to leave the channel");
                } else {
                    isJoined = false;
                    showMessage("Left the channel " + channelName);
                }
            }
        }
        ```

2.  **Release the resources used by your app**

    When a user closes the app, use `onDestroy` to release all the resources in use. In `/app/java/com.example.<projectname>/MainActivity`, add `onDestroy` after `onCreate`:

    ```java
    protected void onDestroy() {
        super.onDestroy();
        
        // Destroy the connection
        agoraEngine.destroyConnection(connectionId);
        // Release all resources allocated to the SDK by the init() method
        agoraEngine.fini();
        // Invalidate the connection ID
        connectionId = AgoraRtcService.ConnectionIdSpecial.CONNECTION_ID_INVALID;
    }
    ```

## Test your implementation

To test your implementation, take the following steps:

1. [Generate a temporary token](build/manage-agora-account.md) in Agora Console.

2. In your browser, navigate to the [Agora web demo](https://webdemo.agora.io/basicVideoCall/index.html) and update _App ID_, _Channel_, and _Token_ with the values for your temporary token, then click **Join**.

    3.  In Android Studio, in `app/java/com.example.<projectname>/MainActivity`, update `appId`, `channelName`, and `token` with the values for your temporary token.

    1.  Connect a physical Android device to your development device.

    2.  In Android Studio, click **Run app**. A moment later you see the project installed on your device.

        If this is the first time you run the project, you need to grant microphone and camera access to your app.

    3. Click **Join** to join a channel.
        
        You hear audio and see a video playing in the web demo app, pushed from the IoT SDK demo project.

    4. Click **Leave**.

        Audio and video streaming stops and you exit the channel.

## Reference

This section contains content that completes the information on this page, or points you to documentation that explains other aspects to this product.

### API reference

- [AgoraRtcService](https://api-ref.agora.io/en/iot-sdk/android/1.x/classio_1_1agora_1_1rtc_1_1_agora_rtc_service.html)

- [AgoraRtcEvents](https://api-ref.agora.io/en/iot-sdk/android/1.x/interfaceio_1_1agora_1_1rtc_1_1_agora_rtc_events.html)
