---
title: "Core concepts"
description: "Ideas that are central to developing with Agora Interactive Whiteboard."
---

Interactive Whiteboard extends Agora's realtime stack with a shared visual workspace for teaching, collaboration, annotation, and presentation.

## Core concepts

![Whiteboard concepts](https://assets-docs.agora.io/images/interactive-whiteboard/whiteboard-concepts.png)

- **AppIdentifier**: the unique identifier of your whiteboard project. You use it when initializing the SDK.
- **Access Key and Secret Key**: the credential pair used to generate whiteboard tokens.
- **SDK token**: the top-level dynamic credential tied to a whiteboard project.
- **Room token**: a token tied to one room under a whiteboard project.
- **Task token**: a token tied to one file-conversion task.
- **Room UUID**: the unique identifier returned when you create a room.
- **Task UUID**: the unique identifier returned when you start a file-conversion task.
- **Interactive mode**: read-write room participation.
- **Subscription mode**: read-only room participation.
- **Scene**: an infinitely extensible whiteboard page. Rooms can contain multiple scenes and scene directories.
- **Multi-window mode**: a display mode that allows multiple floating content windows on one whiteboard page.

## Token roles

Whiteboard supports `admin`, `writer`, and `reader` roles across SDK tokens, room tokens, and task tokens.

- SDK tokens are project-level and can operate across rooms and conversion tasks.
- Room tokens are scoped to one room.
- Task tokens are scoped to one file-conversion task.

### SDK token permissions

An SDK token is bound to a specific Interactive Whiteboard project and is the highest-level token. Users holding an SDK token can operate all rooms and file-conversion tasks under the bound project.

| Permission | `admin` | `writer` | `reader` |
|:-----------|:-------:|:--------:|:--------:|
| Create a room | Yes | Yes | No |
| Join a room in interactive mode | Yes | Yes | No |
| Join a room in read-only mode | No | No | Yes |
| Get room list | Yes | Yes | No |
| Get room information | Yes | Yes | No |
| Ban a room | Yes | No | No |
| Take a screenshot of the specified scene | Yes | Yes | No |
| Take screenshots of all scenes under the scene group | Yes | Yes | No |
| Get the scene address list of the room | Yes | Yes | No |
| Insert a new scene | Yes | Yes | No |
| Jump to a scene | Yes | Yes | No |
| Initiate a file-conversion task | Yes | Yes | No |
| Generate a room token of an equal or lower role | Yes | Yes | Yes |
| Generate a task token of an equal or lower role | Yes | Yes | Yes |

:::caution

An SDK token has the highest level of permissions. If leaked, it can compromise your business security. Do not expose the SDK token to the client, store it in a database, or write it to a configuration file. Retrieve the SDK token from the business server when needed and set an expiration time based on your business requirements.

:::

### Room token permissions

A room token is tied to a specific room within a particular Interactive Whiteboard project. Users with a room token can interact with the associated room.

| Permission | `admin` | `writer` | `reader` |
|:-----------|:-------:|:--------:|:--------:|
| Join a specific room in interactive mode | Yes | Yes | No |
| Join a specific room in subscription mode | No | No | Yes |
| Get specific room information | Yes | Yes | No |
| Block specific rooms | Yes | No | No |
| Take a screenshot of the specified scene | Yes | Yes | No |
| Take screenshots of all scenes under the scene group | Yes | Yes | No |
| Get a list of scene addresses for a specific room | Yes | Yes | No |
| Insert a new scene in a specific room | Yes | Yes | No |
| Jump to a specific room | Yes | Yes | No |

### Task token permissions

A task token is linked to a specific file-conversion task within a project.

| Permission | `admin` | `writer` | `reader` |
|:-----------|:-------:|:--------:|:--------:|
| Query the progress of a specific file-conversion task | Yes | Yes | Yes |

## File conversion

Interactive Whiteboard supports:

- **Static file conversion** for converting PPT, PPTX, DOC, DOCX, and PDF files into images.
- **Dynamic file conversion** for converting PPT and PPTX files into HTML pages that preserve animations.

For implementation details, see [File conversion overview](../build/display-files-and-manage-scenes/file-conversion-overview.md).

## Related setup

- [Enable whiteboard](../build/set-up-and-build-your-first-app/enable-whiteboard.md)
- [Secure authentication with tokens](../build/authenticate-users/authentication-workflow.md)
- [Scenes overview](../build/display-files-and-manage-scenes/scenes/overview.mdx)
