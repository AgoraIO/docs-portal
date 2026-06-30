---
title: Configure device network
description: Connect the R1 device to Wi-Fi through the companion Android app.
---
The R1 kit includes an Android app in the `app` folder for configuring device network access through Bluetooth Low Energy (BLE). The app provides a simple interface for connecting your R1 device to Wi-Fi.

This app is built using Agora's Bluetooth configuration library.

:::info[Info]
Before configuring network access, ensure the following:

- Bluetooth and location services are enabled on your Android device.
- The R1 device is in discoverable mode.
- Your Android device is within 5 meters of the R1 device.
- Your Android device is connected to a 2.4 GHz Wi-Fi network with internet access. Network configuration fails without internet connectivity.
- For Android 12 and later, you have granted `BLUETOOTH_SCAN` and `BLUETOOTH_CONNECT` permissions to the app.
:::

## Connect your device to Wi-Fi

1. Grant the required permissions when prompted by the app.
2. Verify your current Wi-Fi network information.
3. Enter your Wi-Fi password.
4. Scan for and select your target Bluetooth device.
5. Click **Connect** to establish a connection with the device.
6. After the connection succeeds, click **Configure Network** to send the Wi-Fi credentials to the device.
7. After the network configuration completes, click **Disconnect** to end the Bluetooth connection.

![Android app](https://assets-docs.agora.io/images/convo-ai-device-kit/convo-ai-device-app.jpg)

## Set up network access

1. **Request permissions**. When you first open the app, grant the required permissions:
   1. Tap **Request Permissions**. The app requests Bluetooth and location permissions needed for scanning and connecting to Bluetooth devices.
   2. Tap **Allow** in the system permission dialog.

2. **Verify Wi-Fi permissions**. Tap **Check Wi-Fi Permissions**. The app checks whether it has the necessary Wi-Fi permissions and displays the result.

3. **Get Wi-Fi information**. Tap **Get Current Wi-Fi Information**. The app retrieves and displays your current Wi-Fi network name (SSID) in a card below the button.

4. **Enter Wi-Fi password**. Enter your Wi-Fi network password in the password field. The device uses this password to connect to your Wi-Fi network.

5. **Scan for Bluetooth devices**:
   1. Tap **Start Scan**. The app scans for nearby Bluetooth devices. The button text changes to **Stop Scanning** during the scan.
   2. Scanned devices appear in the list below.
   3. Tap **Stop Scanning** to end the scan.

6. **Connect to your device**. Each device card in the list displays:
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
