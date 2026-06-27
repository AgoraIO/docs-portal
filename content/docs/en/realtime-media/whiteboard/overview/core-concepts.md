---
title: "Core concepts"
description: "Ideas that are central to developing with Agora Interactive Whiteboard."
---

Interactive Whiteboard extends Agora's realtime stack with a shared visual workspace for teaching, collaboration, annotation, and presentation.

## Core concepts

![Whiteboard concepts](/images/interactive-whiteboard/whiteboard-concepts.png)

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

| Permission | `admin` | `writer` | `reader` |
| --- | :---: | :---: | :---: |
| Create a room | ✔ | ✔ | ✘ |
| Join a room in interactive mode | ✔ | ✔ | ✘ |
| Join a room in subscription mode | ✘ | ✘ | ✔ |
| Get room list | ✔ | ✔ | ✘ |
| Get room information | ✔ | ✔ | ✘ |
| Ban a room | ✔ | ✘ | ✘ |
| Take a screenshot of the specified scene | ✔ | ✔ | ✘ |
| Take screenshots of all scenes under a scene directory | ✔ | ✔ | ✘ |
| Get scene address lists | ✔ | ✔ | ✘ |
| Insert scenes | ✔ | ✔ | ✘ |
| Jump between scenes | ✔ | ✔ | ✘ |
| Start a file-conversion task | ✔ | ✔ | ✘ |
| Generate room tokens of the same or lower role | ✔ | ✔ | ✔ |
| Generate task tokens of the same or lower role | ✔ | ✔ | ✔ |

### Room token permissions

| Permission | `admin` | `writer` | `reader` |
| --- | :---: | :---: | :---: |
| Join the specified room in interactive mode | ✔ | ✔ | ✘ |
| Join the specified room in subscription mode | ✘ | ✘ | ✔ |
| Get room information | ✔ | ✔ | ✘ |
| Ban the room | ✔ | ✘ | ✘ |
| Take a screenshot of the specified scene | ✔ | ✔ | ✘ |
| Take screenshots of all scenes under a scene directory | ✔ | ✔ | ✘ |
| Get scene address lists | ✔ | ✔ | ✘ |
| Insert scenes | ✔ | ✔ | ✘ |
| Jump between scenes | ✔ | ✔ | ✘ |

### Task token permissions

| Permission | `admin` | `writer` | `reader` |
| --- | :---: | :---: | :---: |
| Query a file-conversion task | ✔ | ✔ | ✔ |

### Token-related APIs

Use the following flows depending on your environment:

- Generate SDK, room, or task tokens on your app server. See [Secure authentication with tokens](../build/authenticate-users/authentication-workflow.md).
- Create rooms and receive a `Room UUID` from the room-creation API.
- Start file conversion and receive a `Task UUID` from the conversion API.

Relevant REST APIs:

- Generate an SDK token
- Generate a room token
- Generate a task token
- Create a room
- Start a file-conversion task

```ts
type WhiteboardRole = 'admin' | 'writer' | 'reader';

interface RoomTokenPayload {
  role: WhiteboardRole;
  roomUUID: string;
}

interface TaskTokenPayload {
  role: WhiteboardRole;
  taskUUID: string;
}
```

```ts
const sdkTokenPayload = {
  role: 'writer' as const,
};

const roomTokenPayload = {
  role: 'writer' as const,
  roomUUID: 'your-room-uuid',
};

const taskTokenPayload = {
  role: 'reader' as const,
  taskUUID: 'your-task-uuid',
};
```

## File conversion

Interactive Whiteboard supports:

- **Static file conversion** for converting PPT, PPTX, DOC, DOCX, and PDF files into images.
- **Dynamic file conversion** for converting PPT and PPTX files into HTML pages that preserve animations.

For implementation details, see [File conversion overview](../build/display-files-and-manage-scenes/file-conversion-overview.md).

## Related setup

- [Enable whiteboard](../build/set-up-and-build-your-first-app/enable-whiteboard.md)
- [Secure authentication with tokens](../build/authenticate-users/authentication-workflow.md)
- [Scenes overview](../build/display-files-and-manage-scenes/scenes/overview.mdx)
