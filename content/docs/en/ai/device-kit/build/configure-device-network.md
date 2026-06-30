---
title: Optional BLE network provisioning
description: Use the optional Android BLE app to change R1 Wi-Fi settings during development or troubleshooting.
---
The workshop quickstart does not require a mobile app. For the fastest first run, use the hotspot setup described in [Quickstart](../start-here/quickstart).

Use this page only when you need to change R1 network settings over Bluetooth Low Energy (BLE) during development, testing, or network troubleshooting. The R1 kit includes an optional Android app in the `app` folder for BLE provisioning.

If your firmware already contains the correct Wi-Fi credentials and backend URL, skip this page.

## Get the Android app

Use one of the following options:

- **Install the prebuilt APK**: Download `app/app-release.apk` from the [`Conversational-AI-IOT-Sample` repository](https://github.com/AgoraIO-Community/Conversational-AI-IOT-Sample/tree/bk7258/v2.0.1/app).
- **Build from source**: Open `app/iot_dn_android` from the same repository in Android Studio, then build and install the sample app on your Android device.

If you install the APK directly, Android may ask you to allow installation from your browser or file manager. Enable that permission only for the install, then turn it off again if your device policy requires it.

:::warning
Only install APKs from the official Agora GitHub repository or a build produced by your team. Do not install APKs from untrusted mirrors.
:::

:::info[Info]
Before configuring network access, ensure the following:

- Bluetooth and location services are enabled on your Android device.
- The R1 device is in discoverable mode.
- Your Android device is within 5 meters of the R1 device.
- Your Android device is connected to a 2.4 GHz Wi-Fi network with internet access. Network configuration fails without internet connectivity.
- For Android 12 and later, you have granted `BLUETOOTH_SCAN` and `BLUETOOTH_CONNECT` permissions to the app.
:::

## Provision Wi-Fi with the Android app

1. Install and open the Android app.
2. Grant the required permissions when prompted by the app.
3. Verify your current Wi-Fi network information.
4. Enter your Wi-Fi password.
5. Enter the token and server URL required by your device provisioning flow.
6. Scan for and select your target Bluetooth device.
7. Click **Connect** to establish a connection with the device.
8. After the connection succeeds, click **Configure Network** to send the Wi-Fi credentials to the device.
9. After the network configuration completes, click **Disconnect** to end the Bluetooth connection.

![Android app](/images/convo-ai-device-kit/convo-ai-device-app.jpg)

## Set up network access

1. **Request permissions**. When you first open the app, grant the required permissions:
   1. Tap **Request Permissions**. The app requests Bluetooth and location permissions needed for scanning and connecting to Bluetooth devices.
   2. Tap **Allow** in the system permission dialog.

2. **Verify Wi-Fi permissions**. Tap **Check Wi-Fi Permissions**. The app checks whether it has the necessary Wi-Fi permissions and displays the result.

3. **Get Wi-Fi information**. Tap **Get Current Wi-Fi Information**. The app retrieves and displays your current Wi-Fi network name (SSID) in a card below the button.

4. **Enter Wi-Fi password**. Enter your Wi-Fi network password in the password field. The device uses this password to connect to your Wi-Fi network.

5. **Enter provisioning values**. Enter the token and server URL used by your device workflow. For local workshop testing, this is the backend URL exposed to the device, not the browser frontend URL.

6. **Scan for Bluetooth devices**:
   1. Tap **Start Scan**. The app scans for nearby Bluetooth devices. The button text changes to **Stop Scanning** during the scan.
   2. Scanned devices appear in the list below.
   3. Tap **Stop Scanning** to end the scan.

7. **Connect to your device**. Each device card in the list displays:
   - Device name
   - MAC address
   - Signal strength (RSSI)
   - **Connect**: Establishes a Bluetooth connection with the device
   - **Configure Network**: Sends Wi-Fi credentials to the device
   - **Disconnect**: Ends the Bluetooth connection

   If network configuration fails, reconnect the device or restart the app.

## Troubleshooting

If you encounter issues during network configuration, try the following solutions:

- **Cannot scan for devices**: Verify that Bluetooth and location services are enabled on your Android device.
- **Connection fails**: Rescan for the device or restart the R1 device.
- **Network configuration fails**: Verify that you entered the correct Wi-Fi password.

## Related pages

- [Device controls](device-controls)
- [Build and flash firmware](build-and-flash-firmware)
