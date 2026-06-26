---
title: "Security"
description: "Learn the security practices Agora implements for Interactive Whiteboard."
---

Data security and user privacy are the top priorities for Agora. To provide safe and reliable services, Agora adopts industry-recognized security standards and security best practices at every layer for each product.

Interactive Whiteboard is a newly launched product that provides online whiteboard rooms where users can present ideas, share multimedia content, and collaborate on projects from multiple devices simultaneously. Starting in the product-design phase, Agora has assessed and prepared for the potential security threats associated with these functions and has implemented a variety of measures to secure the high availability of Interactive Whiteboard as well as the confidentiality and integrity of your data.

This page describes the security practices that Agora has implemented for Interactive Whiteboard.

## Identity and access management

Securing access to your services and resources starts with identity and access controls. Interactive Whiteboard uses tokens for user authentication. Interactive Whiteboard offers three types of tokens: SDK Token, Room Token, and Task Token, in descending order of granted permissions. These tokens must be generated with access keys and secret keys by role and include a validity period; they must also be issued from your app server to your app client. The Interactive Whiteboard server verifies the information stored in the token when your app client requests to access the whiteboard services.

Refer to the following guides for detailed information on Interactive Whiteboard tokens:

- [Interactive Whiteboard Token Overview](../build/authenticate-users/authentication-workflow.md): Describes the different types of whiteboard tokens and their uses, the various methods of generating a token, and token safety precautions.
- [Generate Token Using an App Server](../build/authenticate-users/generate-token-app-server.md): Introduces how to generate tokens at your app server using code samples.
- [Generate Token Using REST API](../build/authenticate-users/generate-token-rest.md): Describes the RESTful APIs for generating whiteboard tokens.

## Data encryption and storage

Interactive Whiteboard does not store any of your business data or user data except for caching it for transmission purposes. The cached data is immediately released after the completion of the business-dependent logic. To guarantee data confidentiality during transmission, Agora uses the Secure Sockets Layer (SSL) encryption protocol.

Data centers hosting Interactive Whiteboard are maintained by certified and industry-leading cloud service providers, offering state-of-the-art physical protection for the servers and infrastructure that comprise the Agora environment.

Interactive Whiteboard also offers server-side file conversion and screenshotting. Agora does not store any files or screenshots when users use these features. The transcoded files and the captured screenshots are stored in the third-party cloud storage designated by you. In addition, these features are disabled by default. Only after you enable the features and specify the storage space. the users authorized by you can access the services and the stored resources.

Refer to the following articles for more information on file conversion and taking screenshots:

- [Enable Interactive Whiteboard](../build/set-up-and-build-your-first-app/enable-whiteboard.md): The **Enable whiteboard server-side features** section describes how to configure the third-party storage space.
- [File Conversion Overview](rest-api/file-conversion.md): The **Start file conversion** section describes the basic workflow for converting a file.

## Network geofencing

To conform to the laws and regulations of different countries and regions, Interactive Whiteboard supports network geofencing, which allows you to specify a data center and limits the transmission of your business data to the service area the data center covers.

Now Interactive Whiteboard sets up five data centers and each data center provides services to specific areas, as follows:

| Data center | Location                      | Service area                             |
| :---------- | :---------------------------- | :--------------------------------------- |
| `us-sv`     | Silicon Valley, United States | North America and South America          |
| `sg`        | Singapore                     | Singapore, East Asia, and Southeast Asia |
| `in-mum`    | Mumbai, India                 | India                                    |
| `gb-lon`    | London, England               | Europe                                   |
| `cn-hz`     | Hangzhou, China               | Areas not covered by other data centers  |

Interactive Whiteboard has implemented network geofencing in each server-side RESTful API as well as all client-side whiteboard SDKs. This enables you to specify a data center whenever you create a whiteboard room or launch a file-conversion task by calling the RESTful APIs, or whenever you enable a user to join a whiteboard room by calling the methods provided by the SDKs.

Refer to the following API references for more information:

- [RESTful APIs](rest-api/overview.md)
- [Web SDK APIs](/en/api-reference/whiteboard/web)
- [Android SDK APIs](/en/api-reference/whiteboard/android)
- [iOS SDK APIs](/en/api-reference/whiteboard/ios)

With network geofencing enabled, data transfer is restricted to the service areas that your specified data center covers. However, this does not prohibit users located in different areas from communicating with each other, as long as they join the same whiteboard room. For example, when a teacher creates a whiteboard room that is geofenced in Europe, students located in India can join the room through the global accelerator and interact with the teacher. If the students join a whiteboard room that is geofenced in India, then they cannot communicate with the teacher in Europe, because no data is allowed to be transmitted across data centers.

## Network redundancy

Interactive Whiteboard deploys Kubernetes clusters to build fault tolerance and disaster recovery into its services. This ensures these services are not interrupted due to a single point of failure.

Interactive Whiteboard adopts incremental data synchronization, serialized data compression, and optimized network congestion control algorithms to ensure high data-packet delivery success rate within the smallest time window.

## Ongoing commitment to security

Agora is committed to building interactive whiteboard services with compliance, safety, security, and trust. If you think you might have found a security vulnerability within Interactive Whiteboard, please contact the Agora security team directly at [security@agora.io](mailto:security@agora.io).
