---
title: "Integrate user system and course scheduling system"
description: "Best practices to integrate user system and course scheduling system in Flexible Classroom"
---
Flexible Classroom provides a real-time interactive experience in the classroom out of the box. This document shows you how to integrate a custom user system and a custom course scheduling system with Flexible Classroom.

## Understand the tech

![Image](/images/flexible-classroom/integrate-systems-flexible-classroom.png)

As shown in the figure above, if you need to integrate Flexible Classroom with your user system and course scheduling system, implement the following business logic:

1. [Deploy a Signaling token server](../set-up-your-account-and-authentication/authentication-workflow.md) in your backend services.
1. Design a RESTful API for the following three purposes:
    1. Verify that the user logged into the app exists in the user system.
    1. If the user exists, obtain the user information and course scheduling information of the user.
    1. Get the Signaling token issued by the Signaling token generator for this user.
    1. Upon getting the user ID, classroom ID and Signaling token, the app calls the launch method of the Agora Classroom SDK. This starts the Flexible Classroom, and passes in the user ID, classroom ID, Signaling token and other parameters.

## Integrated user system

You need to pass either the user ID or the mapping of the user ID in your user system to Flexible Classroom as `userUuid`.

Flexible Classroom's `userUuidi`s are globally unique, that is, each `userUuidi` is only allowed to log in on one instance of one device at a time, and logging in again overwrites the previous device's login status.

Each `userUuid` in the same `roomUuiddata` is retained, that is, if a user changes the device `userUuid` in the same class, such as switching from browser login to mobile application login, the user's information in the class is not lost.

## Integrated course scheduling system

You need to pass the class ID (or the mapping of the class ID) in your own course scheduling system to the Flexible Classroom as `roomUuid`.

Flexible Classroom `roomUuid` is created when the first user enters and is completely destroyed 1 hour after the last user leaves.

Agora does not save your user information and classroom information. After the class is destroyed, if you reuse the previous `roomUuid` again to enter the room, you get a new classroom instead of the previous one.

Note: Agora does not recommend that you reuse `roomUuid`, as this makes it impossible to distinguish between two sessions. For example, use a new `roomUuid` for each math class instead of reusing the same one for math classes of all grades.
