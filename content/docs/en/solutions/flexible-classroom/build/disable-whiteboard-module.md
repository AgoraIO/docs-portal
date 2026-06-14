---
title: "Enable and disable the whiteboard"
description: "Turn the Flexible Classroom whiteboard module on or off and understand the related APIs."
---

# Enable and disable the whiteboard

The whiteboard module in Flexible Classroom is implemented based on `AgoraWidget`. You can turn the whiteboard module on or off in the classroom by setting the widget state as active or inactive.

After disabling the whiteboard module, drawing tools including pencil, text box, shape, and eraser will no longer be available and users cannot upload, delete, or display class files on the whiteboard. Other features that do not rely on the whiteboard, such as uploading or deleting class files, pop-up quiz, count-down timer, and screen sharing will not be affected.

## Turn the whiteboard on or off

The Whiteboard interface is packaged in the file `packages/agora-classroom-sdk/src/infra/stores/common/base.ts`, and the whiteboard-related interface is in the file `packages/agora-classroom-sdk/src/infra/protocol/board.ts`.

```js
get boardApi() {
    return EduUIStoreBase._boardApi;
}
```

To enable or disable the Whiteboard, you monitor the status change of the Whiteboard caused by the teacher client and adjust the UI accordingly.

Call the Whiteboard-related interfaces `boardApi.enable()` and `boardApi.disable()` to turn the Whiteboard on or off.

```js
// Enable the Whiteboard
this.boardApi.enable();
...

// Disable the Whiteboard
this.boardApi.disable();
```

## API reference

#### `connected`

Query whether the Whiteboard is connected to the server.

```js
@computed
get connected() {
  return this.connState === BoardConnectionState.Connected;
}
```

**return value**

- `true`: connected.
- `false`: not connected.

#### `mounted`

Query whether the Whiteboard is mounted.

```js
@computed
get mounted() {
  return this.mountState === BoardMountState.Mounted;
}
```

**return value**

- `true`: Mounted.
- `false`: not mounted.

#### `granted`

Query whether the user has the permission to operate the Whiteboard.

```js
@computed
get granted() {
  return this.hasPrivilege();
}
```

**return value**

- `true`: Have permission.
- `false`: No permission.

#### `enable`

Connect and turn on the Whiteboard.

```js
enable() {
this._sendBoardCommandMessage(AgoraExtensionRoomEvent.ToggleBoard, true);
}
```

#### `disable`

Disconnect and turn off the Whiteboard.

```js
disable() {
  this._sendBoardCommandMessage(AgoraExtensionRoomEvent.ToggleBoard, false);
}
```
