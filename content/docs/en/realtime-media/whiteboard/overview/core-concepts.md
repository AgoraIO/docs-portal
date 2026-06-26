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

## File conversion

Interactive Whiteboard supports:

- **Static file conversion** for converting PPT, PPTX, DOC, DOCX, and PDF files into images.
- **Dynamic file conversion** for converting PPT and PPTX files into HTML pages that preserve animations.

For implementation details, see [File conversion overview](../build/display-files-and-manage-scenes/file-conversion-overview.md).

## Related setup

- [Enable whiteboard](../build/set-up-and-build-your-first-app/enable-whiteboard.md)
- [Secure authentication with tokens](../build/authenticate-users/authentication-workflow.md)
- [Scenes overview](../build/display-files-and-manage-scenes/scenes/overview.mdx)
