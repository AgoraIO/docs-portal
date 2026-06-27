---
title: "Quickstart - create an extension"
description: "The Agora Extensions Marketplace has a complete workflow for vendors to develop and distribute extensions. This page walks through each step in the workflow."
---

Extensions are add-ons designed to rapidly extend the functionality of your app. [Extensions Marketplace](https://www.agora.io/en/agora-extensions-marketplace/) is home to extensions that make your app more fun. Extensions provide features such as Audio effects and voice changing, Face filters and background removal, and Live transcription and captioning.

In the Agora Extensions Marketplace:

- Vendors create and publish extensions to provide functionality such as audio and video processing.
- App developers use extensions to quickly implement fun and interactive functionality.

This page shows vendors how extensions work and the steps you take to develop and publish your extension to Extensions Marketplace.

## Understand the tech

An extension accesses voice and video data when it is captured from the user's local device, modifies it, then plays the updated data to local and remote video channels.

![img](/images/video-sdk/extension-callflow.svg)

A typical transmission pipeline consists of a chain of procedures, including capture, pre-processing, encoding, transmitting, decoding, post-processing, and play. Audio or video extensions are inserted into either the pre-processing or post-processing procedure, in order to modify the voice or video data in the transmission pipeline.

You can currently implement the following extension types:

- **Audio**: for voice effects and noise cancellation.
- **Video**: features such as face filters and background removal.

## Vendor workflow

The steps to develop, test and publish an extension to Extensions Marketplace:

1. **Become a vendor**

    Fill in the [vendor application form](https://www.agora.io/en/extensions-marketplace/vendor-application/), then click **APPLY NOW** .

    Agora reviews your application in 7 working days and sends you the result through an email.

2. **Develop your extension**

    Once your application to become a partner is approved, develop your functionality as an audio or video extension using the following documentation:

    - [Develop an audio extension](build/build-your-own-extension/audio-filter.mdx)
    - [Develop a video extension](build/build-your-own-extension/video-filter.mdx)

    When you have developed and tested your extension, You also need to validate the user interface of your extension in a test environment. To test your extension, submit an application for testing. Agora processes your application in 7 working days and informs you through an email when it's done.

3. **Help developers easily integrate your extension into their app**.

    Write the [Implementation guide](build/publish-and-document/implementation-guide.md) for your extension

4. **Share provisioning, usage, and billing information with Agora**

    - [Provisioning API](build/connect-to-agora-services/provisioning.md)
    - [Usage and billing API](build/connect-to-agora-services/usage.md)

5. **Publish your extension**

    When your extension is thoroughly developed and tested, you need to submit it for Agora review and provide the finalized version of your extension listing assets. For details, see [Publish your extension](build/publish-and-document/publish-extension.md).

    Agora reviews your extension in 7 working days. If your extension passes the review, Agora updates the listing of your extension and informs you through an email. If your extension fails the review, Agora sends an email to report the issues you need to address.

Once you are ready to go, Agora publishes your extension in the [Extensions Marketplace](https://www.agora.io/en/agora-extensions-marketplace/), everyone can use it and you start earning.
