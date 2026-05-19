---
title: 实现收发消息
description: 实现收发消息，用于帮助开发者在对应平台上快速完成 RTM 接入与基础验证。
---

本文将指导你如何利用 RTM Java SDK 构建简单的应用程序，内容涵盖了集成和开发的基础知识：开通声网账号、获取 SDK、发送消息、接收消息等。

同时，我们也提供了开源的示例项目供你参考，你可以前往下载或查看其中的源代码。

## 准备工作

开始构建项目前，你需要完成[开通服务](./enable-service.md)，并检查你的开发环境是否满足[平台支持](../overview/platform-support)中的最低版本要求。

## 构建项目

### 1. 项目配置

根据以下步骤配置你的项目：

1. 在 Android Studio 里，创建一个 **Empty Activity** 类型的项目并打开。
2. 通过以下任意一种方式获取最新的 RTM Java SDK 并导入你的项目。

   

   > **信息**
> 如果你同时集成了 2.2.0 及以上版本的 RTM SDK 和 4.3.0 及以上版本的 RTC SDK，请参考 [FAQ](/faq/integration-issues/rtm2-rtc-integration-issue) 处理集成问题。

3. 添加网络权限。打开 `app/src/main/AndroidManifest.xml` 文件，在 `<manifest>` 的下一行添加如下代码：

   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
   ```

4. 在 `/Gradle Scripts/proguard-rules.pro` 文件中添加如下代码，以防止声网 SDK 的代码被混淆：

   ```java
   -keep class io.agora.**
   ```

### 2. 初始化 RTM

调用 RTM SDK 的任何 API 之前，需要先初始化一个 `RtmClient` 对象实例。参考如下步骤创建用户界面、初始化一个 `RtmClient` 对象实例。

1. 创建用户界面。实时消息 App 一般会有如下输入框和按钮：
   - 用户名、频道名、消息输入框
   - 登录、登出按钮
   - 订阅、取消订阅频道按钮
   - 发送消息按钮

   本节提供简易的 UI 界面设计以便于验证功能特性，你可以根据实际项目需求进行修改。
   1. 打开 `/app/res/layout/activity_main.xml` 文件，将文件内容替换为如下代码：

      ```xml
      <?xml version="1.0" encoding="utf-8"?>
      <androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
          xmlns:app="http://schemas.android.com/apk/res-auto"
          xmlns:tools="http://schemas.android.com/tools"
          android:layout_width="match_parent"
          android:layout_height="match_parent"
          android:background="#FFFFFF"
          tools:context=".MainActivity">

          

          

          

          

          

          

          

          

          

      </androidx.constraintlayout.widget.ConstraintLayout>
      ```

   2. 打开 `app/res/values/strings.xml` 文件，将文件内容替换为如下代码：
      ```xml
      <resources>
          <string name="app_name">RtmQuickstart</string>
          <string name="login_button">Login</string>
          <string name="logout_button">Logout</string>
          <string name="subscribe_button">Sub</string>
          <string name="unsubscribe_button">Unsub</string>
          <string name="send_channel_msg_button">Publish MSG</string>
          <string name="uid">User ID</string>
          <string name="msg">Message content</string>
          <string name="channel_name">Channel name</string>

          <string name="app_id">your_appid</string>
          <string name="token">your_token</string>
      </resources>
      ```

      > **信息**
> 你需要将示例中的 `your_appid` 和 `your_token` 字段替换成你项目的 App ID 和 Token。在测试阶段，为快速验证功能，我们建议你在创建声网项目时将鉴权模式设置为调试模式，然后将示例中的 `your_appid` 和 `your_token` 字段都替换成你项目的 App ID。

2. 打开 `app/src/main/java/com/example/rtm/MainActivity.java` 文件，将文件内容替换为如下代码。你会发现此程序并不完整，不用紧张，我们在后续步骤中将一步步指导你补充完善代码。

   > **信息**
> `com.example.rtm` 为示例项目的路径，你需要根据实际项目路径查找文件并填写代码。

   ```java
   // Replace the package path with the path of your real project.
   package com.example.rtm;

   import android.content.pm.ActivityInfo;
   import android.os.Bundle;
   import android.view.View;
   import android.widget.EditText;
   import android.widget.TextView;
   import android.widget.Toast;

   import androidx.appcompat.app.AppCompatActivity;

   import io.agora.rtm.ErrorInfo;
   import io.agora.rtm.LockEvent;
   import io.agora.rtm.MessageEvent;
   import io.agora.rtm.PresenceEvent;
   import io.agora.rtm.PublishOptions;
   import io.agora.rtm.ResultCallback;
   import io.agora.rtm.RtmClient;
   import io.agora.rtm.RtmConfig;
   import io.agora.rtm.RtmConstants;
   import io.agora.rtm.RtmEventListener;
   import io.agora.rtm.RtmMessage;
   import io.agora.rtm.StorageEvent;
   import io.agora.rtm.SubscribeOptions;
   import io.agora.rtm.TopicEvent;

   public class MainActivity extends AppCompatActivity {
       private EditText etUserId;
       private EditText etChannelName;
       private EditText etMessageContent;

       // The user ID of the publisher
       private String mUserId;
       // The channel name of the message channel
       private String mChannelName;

       // The RTM client instance
       private RtmClient mRtmClient;
       // The TextView to show the messages that you send
       private TextView mMessageHistory;

       // Add the event listener

       @Override
       protected void onCreate(Bundle savedInstanceState) {
           super.onCreate(savedInstanceState);
           setContentView(R.layout.activity_main);
           setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
       }

       @Override
       protected void onResume() {
           super.onResume();
       }

       @Override
       protected void onDestroy() {
           super.onDestroy();
       }

       public void onClickLogin(View v)
       {
           try {
               etUserId = (EditText) findViewById(R.id.uid);
               mUserId = etUserId.getText().toString();
               if (mUserId == null || mUserId.isEmpty()) {
                   showToast("invalid userId");
                   return;
               }
               RtmConfig config = new RtmConfig.Builder(getBaseContext().getString(R.string.app_id), mUserId)
                         .eventListener(eventListener)
                         .build();
               mRtmClient = RtmClient.create(config);
           } catch (Exception e) {
               showToast("create rtm client is null");
           }

           if (mRtmClient == null) {
               showToast("rtm client is null");
               return;
           }

           // Log in the RTM server
       }

       public void onClickSubscribe(View v)
       {
           if (mRtmClient == null) {
               showToast("rtm client is null");
               return;
           }

           // Subscribe to a channel
       }

       public void onClickLogout(View v)
       {
           if (mRtmClient == null) {
               showToast("rtm client is null");
           }
           // Log out from the RTM server
       }

       public void onClickUnsubscribe(View v)
       {
           if (mRtmClient == null) {
               showToast("rtm client is null");
               return;
           }
           // Unsubscribe from a channel
       }

       public void onClickSendChannelMsg(View v)
       {
           // Publish a message
       }

       // Write message history to TextView
       public void writeToMessageHistory(String record)
       {
           mMessageHistory = findViewById(R.id.message_history);
           mMessageHistory.append(record);
       }

       private void showToast(String text) {
           Toast.makeText(this, text, Toast.LENGTH_SHORT).show();
       }
   }
   ```

如需了解更多初始化的信息，查看<a href=>初始配置</a>。

### 3. 添加事件监听

事件监听程序帮助你实现频道中消息、事件到达后的处理逻辑，添加以下代码到你的程序中以显示收到的消息或事件通知：

```java showLineNumbers
// Paste the following code snippet below "Add the event listener" comment
private RtmEventListener eventListener = new RtmEventListener() {
    @Override
    public void onMessageEvent(MessageEvent event) {
        String text = "Message received from " + event.getPublisherId() + " Message: " + event.getMessage().getData() + "\n";
        writeToMessageHistory(text);
    }

    @Override
    public void onPresenceEvent(PresenceEvent event) {
        String text = "receive presence event, user: " + event.getPublisherId() + " event: " + event.getEventType() + "\n";
        writeToMessageHistory(text);
    }

    @Override
    public void onConnectionStateChanged(String mChannelName, RtmConstants.RtmConnectionState state, RtmConstants.RtmConnectionChangeReason reason) {
        String text = "Connection state changed to " + state + ", Reason: " + reason + "\n";
        writeToMessageHistory(text);
    }
};
```

### 4. 登录服务

你需要执行登录操作才能建立与 RTM 服务器的连接，然后才能调用 SDK 的其他 API。将以下代码添加到程序中：

```java showLineNumbers
// Paste the following code snippet below "Log in the RTM server" comment
String token =getBaseContext().getString(R.string.token);
mRtmClient.login(token, new ResultCallback() {
    @Override
    public void onSuccess(Void responseInfo) {
        writeToMessageHistory("Successfully log in the RTM server!\n");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        CharSequence text = "User: " + mUserId + " Fail to log in to the RTM system!" + errorInfo.toString();
        int duration = Toast.LENGTH_SHORT;
        runOnUiThread(new Runnable() {
            public void run() {
                Toast toast = Toast.makeText(getApplicationContext(), text, duration);
                toast.show();
            }
        });
    }
});
```

### 5. 收发消息

调用 `publish` 方法向 Message Channel 发送消息后，RTM 会把该消息分发给该频道的所有订阅者，以下代码演示如何发送字符串类型的消息，将此代码片段添加到程序中：

> **信息**
> 你需要先对消息负载进行字符串序列化，才能调用 `publish` 方法发送消息。

```java showLineNumbers
// Paste the following code snippet below "Publish a message" comment
etMessageContent = findViewById(R.id.msg_box);
String message = etMessageContent.getText().toString();
etChannelName = (EditText) findViewById(R.id.channel_name);
mChannelName = etChannelName.getText().toString();
PublishOptions options = new PublishOptions();
options.setCustomType("");
mRtmClient.publish(mChannelName, message, options, new ResultCallback() {
    @Override
    public void onSuccess(Void responseInfo) {
        String text = "Message sent to channel " + mChannelName + " : " + message + "\n";
        writeToMessageHistory(text);
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        String text = "Message fails to send to channel " + mChannelName + " Error: " + errorInfo + "\n";
        writeToMessageHistory(text);
    }
});
```

调用 `subscribe` 方法订阅此频道以接收此频道中的消息。将以下代码添加到程序中：

```java showLineNumbers
// Paste the following code snippet below "Subscribe to a channel" comment
etChannelName = (EditText) findViewById(R.id.channel_name);
mChannelName = etChannelName.getText().toString();
SubscribeOptions options = new SubscribeOptions();
options.setWithMessage(true);
mRtmClient.subscribe(mChannelName, options, new ResultCallback() {
    @Override
    public void onSuccess(Void responseInfo) {
        writeToMessageHistory("Successfully subscribe to the channel!\n");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        writeToMessageHistory("Fail to subscribe to the channel!\n");
    }
});
```

如果你不再需要在此频道收发消息，你可以调用 `unsubscribe` 方法取消订阅此频道。将以下代码添加到程序中：

``` java
// Paste the following code snippet below "Unsubscribe from a channel" comment
etChannelName = (EditText) findViewById(R.id.channel_name);
mChannelName = etChannelName.getText().toString();
mRtmClient.unsubscribe(mChannelName, new ResultCallback() {
    @Override
    public void onSuccess(Void responseInfo) {
        writeToMessageHistory("Successfully unsubscribe from the channel!\n");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        writeToMessageHistory("Fail to unsubscribe from the channel!\n");
    }
});
```

如需了解更多收发消息的信息，查看<a href=>消息</a>。

### 6. 登出服务

当不再需要使用 RTM 服务时，你可以调用 `logout` 方法登出 RTM 系统。将以下代码添加到程序中：

```java
// Paste the following code snippet below "Log out from the RTM server" comment
mRtmClient.logout(new ResultCallback() {
    @Override
    public void onSuccess(Void responseInfo) {
        writeToMessageHistory("Successfully log out from the channel!\n");
    }

    @Override
    public void onFailure(ErrorInfo errorInfo) {
        writeToMessageHistory("Fail to log out from the channel!\n");
    }
});
```

> **信息**
> 本操作会影响你账单中的 PCU 计费项。

### 7. 组合到一起

经过上述步骤，你程序中的代码应该如下所示：

```java
  // Replace the package path with the path of your real project.
  package com.example.rtm;

  import android.content.pm.ActivityInfo;
  import android.os.Bundle;
  import android.view.View;
  import android.widget.EditText;
  import android.widget.TextView;
  import android.widget.Toast;

  import androidx.appcompat.app.AppCompatActivity;

  import io.agora.rtm.ErrorInfo;
  import io.agora.rtm.LockEvent;
  import io.agora.rtm.MessageEvent;
  import io.agora.rtm.PresenceEvent;
  import io.agora.rtm.PublishOptions;
  import io.agora.rtm.ResultCallback;
  import io.agora.rtm.RtmClient;
  import io.agora.rtm.RtmConfig;
  import io.agora.rtm.RtmConstants;
  import io.agora.rtm.RtmEventListener;
  import io.agora.rtm.RtmMessage;
  import io.agora.rtm.StorageEvent;
  import io.agora.rtm.SubscribeOptions;
  import io.agora.rtm.TopicEvent;

  public class MainActivity extends AppCompatActivity {
      private EditText etUserId;
      private EditText etChannelName;
      private EditText etMessageContent;

      // The user ID of the publisher
      private String mUserId;
      // The channel name of the message channel
      private String mChannelName;

      // The RTM client instance
      private RtmClient mRtmClient;
      // The TextView to show the messages that you send
      private TextView mMessageHistory;

      // Add the event listener
      private RtmEventListener eventListener = new RtmEventListener() {
          @Override
          public void onMessageEvent(MessageEvent event) {
              String text = "Message received from " + event.getPublisherId() + " Message: " + event.getMessage().getData() + "\n";
              writeToMessageHistory(text);
          }

          @Override
          public void onPresenceEvent(PresenceEvent event) {
              String text = "receive presence event, user: " + event.getPublisherId() + " event: " + event.getEventType() + "\n";
              writeToMessageHistory(text);
          }

          @Override
          public void onConnectionStateChanged(String mChannelName, RtmConstants.RtmConnectionState state, RtmConstants.RtmConnectionChangeReason reason) {
              String text = "Connection state changed to " + state + ", Reason: " + reason + "\n";
              writeToMessageHistory(text);
          }
      };

      @Override
      protected void onCreate(Bundle savedInstanceState) {
          super.onCreate(savedInstanceState);
          setContentView(R.layout.activity_main);
          setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
      }

      @Override
      protected void onResume() {
          super.onResume();
      }

      @Override
      protected void onDestroy() {
          super.onDestroy();
      }

      public void onClickLogin(View v)
      {
          try {
              etUserId = (EditText) findViewById(R.id.uid);
              mUserId = etUserId.getText().toString();
              if (mUserId == null || mUserId.isEmpty()) {
                  showToast("invalid userId");
                  return;
              }
              RtmConfig config = new RtmConfig.Builder(getBaseContext().getString(R.string.app_id), mUserId)
                  .eventListener(eventListener)
                  .build();
              mRtmClient = RtmClient.create(config);
          } catch (Exception e) {
              showToast("create rtm client is null");
          }

          if (mRtmClient == null) {
              showToast("rtm client is null");
              return;
          }

          // Log in the RTM server
          String token =getBaseContext().getString(R.string.token);
          mRtmClient.login(token, new ResultCallback() {
              @Override
              public void onSuccess(Void responseInfo) {
                  writeToMessageHistory("Successfully log in the RTM server!\n");
              }

              @Override
              public void onFailure(ErrorInfo errorInfo) {
                  CharSequence text = "User: " + mUserId + " Fail to log in to the RTM system!" + errorInfo.toString();
                  int duration = Toast.LENGTH_SHORT;
                  runOnUiThread(new Runnable() {
                      public void run() {
                          Toast toast = Toast.makeText(getApplicationContext(), text, duration);
                          toast.show();
                      }
                  });
              }
          });
      }

      public void onClickSubscribe(View v)
      {
          if (mRtmClient == null) {
              showToast("rtm client is null");
              return;
          }

          // Subscribe to a channel
          etChannelName = (EditText) findViewById(R.id.channel_name);
          mChannelName = etChannelName.getText().toString();

          SubscribeOptions options = new SubscribeOptions();
          options.setWithMessage(true);
          mRtmClient.subscribe(mChannelName, options, new ResultCallback() {
              @Override
              public void onSuccess(Void responseInfo) {
                  writeToMessageHistory("Successfully subscribe to the channel!\n");
              }

              @Override
              public void onFailure(ErrorInfo errorInfo) {
                  writeToMessageHistory("Fail to subscribe to the channel!\n");
              }
          });
      }

      public void onClickLogout(View v)
      {
          if (mRtmClient == null) {
              showToast("rtm client is null");
          }
          // Log out from the RTM server
          mRtmClient.logout(new ResultCallback() {
              @Override
              public void onSuccess(Void responseInfo) {
                  writeToMessageHistory("Successfully log out from the channel!\n");
              }

              @Override
              public void onFailure(ErrorInfo errorInfo) {
                  writeToMessageHistory("Fail to log out from the channel!\n");
              }
          });
      }

      public void onClickUnsubscribe(View v)
      {
          if (mRtmClient == null) {
              showToast("rtm client is null");
              return;
          }
          // Unsubscribe from a channel
          etChannelName = (EditText) findViewById(R.id.channel_name);
          mChannelName = etChannelName.getText().toString();
          mRtmClient.unsubscribe(mChannelName, new ResultCallback() {
              @Override
              public void onSuccess(Void responseInfo) {
                  writeToMessageHistory("Successfully unsubscribe from the channel!\n");
              }

              @Override
              public void onFailure(ErrorInfo errorInfo) {
                  writeToMessageHistory("Fail to unsubscribe from the channel!\n");
              }
          });
      }

      public void onClickSendChannelMsg(View v)
      {
          etMessageContent = findViewById(R.id.msg_box);
          String message = etMessageContent.getText().toString();

          // Publish a message
          etChannelName = (EditText) findViewById(R.id.channel_name);
          mChannelName = etChannelName.getText().toString();
          PublishOptions options = new PublishOptions();
          options.setCustomType("");
          mRtmClient.publish(mChannelName, message, options, new ResultCallback() {
              @Override
              public void onSuccess(Void responseInfo) {
                  String text = "Message sent to channel " + mChannelName + " : " + message + "\n";
                  writeToMessageHistory(text);
              }

              @Override
              public void onFailure(ErrorInfo errorInfo) {
                  String text = "Message fails to send to channel " + mChannelName + " Error: " + errorInfo + "\n";
                  writeToMessageHistory(text);
              }
          });
      }

      // Write message history to TextView
      public void writeToMessageHistory(String record)
      {
          mMessageHistory = findViewById(R.id.message_history);
          mMessageHistory.append(record);
      }

      private void showToast(String text) {
          Toast.makeText(this, text, Toast.LENGTH_SHORT).show();
      }
  }
```

现在，你可以开始运行你的程序：

1. 保存项目。
2. 在菜单栏中依次点击 **Run > Select Device > Select Multiple Devices** 并添加两个设备。例如，选择一个虚拟机和一个真机。
3. 运行项目。成功运行后，你可以在两个设备中看到 App 界面。
4. 将一个设备作为接收端，进行如下操作：
   1. 输入用户名，点击 **LOGIN**。
   2. 输入频道名，点击 **SUB**。
5. 将另一个设备作为发送端，进行如下操作：
   1. 输入不同的用户名，点击 **LOGIN**。
   2. 输入相同的频道名。
   3. 输入消息，点击 **PUBLISH MSG**。
6. 将上面的发送端和设备端互换，重复步骤 4 和 5。

如果两个设备均可收发消息，那么你已经成功集成并正确使用了 RTM 服务。

## 贯穿始终

相比于介绍如何写出代码，声网更愿意帮助你掌握上述程序编写的过程和逻辑。上述程序依次完成了以下操作，让你可以正确地收发消息：

1. 设置并初始化 RTM 对象。
2. 添加 `onMessageEvent`、`onPresenceEvent` 和 `onLinkStateEvent` 事件监听函数。
3. 调用 `login` 登录了 RTM 服务。
4. 调用 `subscribe` 订阅了一个 Message Channel。
5. 调用 `publish` 发送消息。
6. 调用 `unsubscribe` 取消订阅一个 Message Channel。
7. 调用 `logout` 登出 RTM 系统。

## 下一步

现在，你已经学会了如何使用 RTM Java SDK 来实现 Message Channel 的收发消息功能。下一步，你可以通过 SDK 的 <a href=>API 参考</a >了解更多功能的使用方法。
