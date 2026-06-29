---
title: "Secure channel encryption"
description: "Add Agora built-in media stream encryption to your app."
---
Media stream encryption ensures that only authorized users in a channel see and hear each other. Encryption prevents potential eavesdroppers from accessing sensitive and private information shared in a channel. IoT SDK provides built-in encryption methods that you can use to guarantee data confidentiality during transmission, when required.

This page shows you how to integrate media stream encryption into your app using IoT SDK.

## Understand the tech

To ensure secure communication, your app uses an SSL [key](https://en.wikipedia.org/wiki/Key_authentication) and a [salt](https://en.wikipedia.org/wiki/Salt_(cryptography)) to encrypt and decrypt
data in the channel. You use the key and salt to create an encryption configuration. Agora SDRTN® uses the encryption configuration to encrypt a stream and sends it to remote users. When a remote user receives an encrypted media stream, the remote app decrypts it using the same salt and key.

The following figure shows the call flow for media stream encryption:

![Encrypt media stream](/images/common/media-stream-encryption.png)

All users in a channel must use the same encryption configuration. You set this up when you initiate the Agora Engine and enable encryption before joining a channel. If you don’t have the correct configuration, you cannot decrypt channel content. Best practice is to have your authentication system generate a new key and salt regularly.

IoT SDK supports the following encryption modes:

* SM4-128-ECB
* AES_128_ECB
* AES_128_XTS
* AES_256_XTS
* AES-128-GCM
* AES-256-GCM
* AES-128-GCM2 (recommended)
* AES-256-GCM2 (recommended)

Compared to other encryption modes, GCM2 encryption uses a more secure key derivation function and supports salt. If you choose another encryption mode, you only need to set the encryption mode and key.

## Prerequisites

To follow this procedure you must have:

* Implemented the [SDK quickstart](../../index.md) project for IoT SDK.

* [OpenSSL](https://www.openssl.org/) v3.0.0 or above.

## Project setup

To encrypt media streams in your app, you need to:

- Open the [SDK quickstart](../../index.md) IoT SDK project you created previously.

- Set up [OpenSSL](https://www.openssl.org/) on your development device. 

## Implement Agora media stream encryption

To implement media stream encryption, do the following:

1. **Add variables to hold the encryption key and salt**

    In `/app/java/com.example.<projectname>/MainActivity`, add the following declarations to the `MainActivity` class:

    ```java
    private String encryptionKey = "<32-byte key generated through OpenSSL>";
    private String encryptionSaltBase64 = "<Base64-encoded, salt generated through OpenSSL>";
    ```

2. **Enable encryption**

    To enable encryption, you set `enableAutEncryption` to `true` in `channelOptions`. Add the following line after `channelOptions.autoSubscribeVideo = true;` in `joinChannel`:

    ```java
    channelOptions.enableAutEncryption = true;
    ```

3. **Set encryption parameters**

    You specify the media stream encryption mode and the related parameters in JSON format by calling `setParams`. Depending on your choice of an encryption method, add **one** of the following pieces of code to `joinChannel` before `agoraEngine.joinChannel(...)`:

    * SM4-128-ECB encryption

        ```java
        // Enable SM4-128-ECB encryption
        agoraEngine.setParams("{\"rtc.encryption\": {\"enable\": true,"
                + "\"mode\":\"SM4-128-ECB\", \"master_key\": \"" + encryptionKey + "\" }}");
        ```

    * AES-128-GCM encryption

        ```java
        // Enable AES-128-GCM encryption
        agoraEngine.setParams("{\"rtc.encryption\": {\"enable\": true,"
                + "\"mode\":\"AES-128-GCM\", \"master_key\": \"" + encryptionKey + "\" }}");
        ```

    * AES-128-GCM2 encryption

        ```java
        // Enable AES-128-GCM2 encryption
        agoraEngine.setParams("{\"rtc.encryption\": {\"enable\": true,"
                + "\"mode\": \"AES-128-GCM2\", \"master_key\": \"" + encryptionKey 
                + "\", \"salt\": \"" + encryptionSaltBase64 + "\", \"salt_type\": \"BASE64\"}}");
        ```

4. **Disable encryption**

    To disable encryption, use the following code:

    ```java
    // Disable built-in encryption
    agoraEngine.setParams("{\"rtc.encryption\": {\"enable\": false}}");
    ```

## Test your implementation

To ensure that you have implemented Agora media stream encryption in your app:

1. Add the 32-byte key to your app:

    1.  Run the following command in a terminal window:

        ```bash
        openssl rand -hex 32
        ```

    2.  Paste the key string returned into the `encryptionKey` variable.

2. Add the 64-byte salt to your app:

    1.  Run the following command in your terminal window:

        ```bash
        openssl rand -base64 32
        ```

    2.  Paste the salt string returned into the `encryptionSaltBase64` variable.

3. [Generate a temporary token](../manage-agora-account.md) in Agora Console.

4. In Android Studio, in `app/java/com.example.\<projectname>/MainActivity`, update `appId`, `channelName` and `token` with the values for your temporary token.

5. Connect a physical Android device to your development machine.

6. In Android Studio, click **Run app**. You see the app running on your device.

    If this is the first time you run your app, grant microphone and camera access.

7. Copy and install the `apk` for your app on a second Android test device.

8. Press **Join** on both Android devices to join the same channel.

    You see remote videos on the two devices.

Communication between your test devices is now end-to-end encrypted. This prevents data from being read or secretly modified by anyone other than the true sender and recipient.

## Reference

This section contains content that completes the information on this page, or points you to documentation that explains other aspects to this product.

### API reference

- [setParams](https://api-ref.agora.io/en/iot-sdk/android/1.x/classio_1_1agora_1_1rtc_1_1_agora_rtc_service.html#a0fb86ff4db8c4e9ec7080503ac479cad)

- [ChannelOptions](https://api-ref.agora.io/en/iot-sdk/android/1.x/classio_1_1agora_1_1rtc_1_1_agora_rtc_service_1_1_channel_options.html)
