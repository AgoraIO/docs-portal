---
title: Implement HTTP Authentication
description: "This article explains how to perform HTTP authentication in Conversational AI Engine, including RTC token authentication and HTTP Basic Authentication."
---

# Implement HTTP Authentication

This article explains how to perform HTTP authentication in Conversational AI Engine, including RTC token authentication and HTTP Basic Authentication.

## Prerequisites

You have already followed [Enable the Service](../get-started/enable-service.md) to enable the Conversational AI Engine service.

## Use RTC Token Authentication (Recommended)

When performing HTTP authentication, you can place the RTC token used for your Agora Conversational AI Engine project in the `Authorization` field of the HTTP request header. This section explains how to obtain and pass in an RTC token. You can choose either of the following methods based on your needs.

### Use a Temporary Token

In a test environment, you can follow [Enable the Service](../get-started/enable-service.md#get-a-temporary-token) to generate a temporary token for your project from the Agora Console. The token is valid for 24 hours.

### Deploy a Token Server to Generate Tokens

In a production environment, you can refer to [Use Token Authentication](https://doc.shengwang.cn/doc/rtc/android/basic-features/token-authentication) to deploy a token server that generates tokens and delivers them to the client.

#### Request Example

```bash
curl --request POST \
  --url https://api.agora.io/cn/api/conversational-ai-agent/v2/projects/:appid/join \
  --header 'Authorization: agora token="007abcxxxxxxx123"' \
  --data '
{
  "name": "unique_name",
  "properties": {
    "channel": "channel_name",
    "token": "token",
    "agent_rtc_uid": "0",
    "remote_rtc_uids": [
      "123"
    ],
    "enable_string_uid": false,
    "idle_timeout": 120,
    "advanced_features": {
      "enable_aivad": true
    },
    "llm": {
      "url": "https://api.minimax.chat/v2/text/chatcompletion_v2",
      "api_key": "xxx",
      "system_messages": [
        {
          "role": "system",
          "content": "You are a helpful chatbot."
        }
      ],
      "greeting_message": "Hello, how can I help you?",
      "failure_message": "Sorry, I can't answer that question.",
      "max_history": 32,
      "params": {
        "model": "abab6.5s-chat",
        "max_token": 1024,
        "userName": "Tomas"
      }
    },
    "asr": {
      "language": "zh-CN",
      "vendor": "fengming"
    },
    "tts": {
      "vendor": "minimax",
      "skip_patterns": [
        1
      ],
      "params": {
        "group_id": "xxxx",
        "key": "xxxx",
        "model": "speech-01-turbo",
        "voice_setting": {
          "voice_id": "female-shaonv",
          "speed": 1,
          "vol": 1,
          "pitch": 0,
          "emotion": "happy"
        },
        "audio_setting": {
          "sample_rate": 16000
        }
      }
    }
  }
}
'
```

## Use HTTP Basic Authentication

When performing HTTP Basic Authentication, you can use the customer ID and customer secret provided by Agora to generate a credential encoded with Base64, and place it in the `Authorization` field of the HTTP request header. This section explains how to obtain the `Authorization` field used for HTTP Basic Authentication.

### Generate It with a Third-Party Tool

You can use a [third-party online tool](https://www.debugbear.com/basic-auth-header-generator) to quickly generate the Authorization value. Enter the customer ID and customer secret into the Username and Password fields respectively, and you will get a result like `Authorization: Basic NDI1OTQ3N2I4MzYy...YwZjA=`. The content after the colon is the `Authorization` value.

### Generate It with Sample Code

Copy the following code and fill in your customer ID and customer secret to generate the corresponding `Authorization` field:

#### Java

```java
import java.io.IOException;
import java.net.URI;
import java.util.Base64;

public class Base64Encoding {

    public static void main(String[] args) throws IOException, InterruptedException {

        // Customer ID
        // Set environment variable AGORA_CUSTOMER_KEY
        final String customerKey = System.getenv("AGORA_CUSTOMER_KEY");
        // Customer secret
        // Set environment variable AGORA_CUSTOMER_SECRET
        final String customerSecret = System.getenv("AGORA_CUSTOMER_SECRET");

        // Concatenate customer ID and customer secret, then encode with Base64
        String plainCredentials = customerKey + ":" + customerSecret;
        String base64Credentials = new String(Base64.getEncoder().encode(plainCredentials.getBytes()));
        // Create authorization header
        String authorizationHeader = "Basic " + base64Credentials;
    }
}
```

#### Golang

```go
package main

import (
    "fmt"
    "strings"
    "net/http"
    "io/ioutil"
    "encoding/base64"
)

func main() {
    // Customer ID
    // Set environment variable AGORA_CUSTOMER_KEY
    customerKey := os.Getenv("AGORA_CUSTOMER_KEY")
    // Customer secret
    // Set environment variable AGORA_CUSTOMER_SECRET
    customerSecret := os.Getenv("AGORA_CUSTOMER_SECRET")

    // Concatenate customer ID and customer secret, then encode with Base64
    plainCredentials := customerKey + ":" + customerSecret
    base64Credentials := base64.StdEncoding.EncodeToString([]byte(plainCredentials))
    // Create Authorization header
    authHeader := "Basic " + base64Credentials
    // Print the generated authentication header
    fmt.Println(authHeader)
}
```

#### PHP

```php
<?php
// Customer ID
// Set environment variable AGORA_CUSTOMER_KEY
$customerKey = getenv("AGORA_CUSTOMER_KEY");
// Customer secret
// Set environment variable AGORA_CUSTOMER_SECRET
$customerSecret = getenv("AGORA_CUSTOMER_SECRET");
// Concatenate customer ID and customer secret
$credentials = $customerKey . ":" . $customerSecret;

// Encode with Base64
$base64Credentials = base64_encode($credentials);
// Create authorization header
$arr_header = "Authorization: Basic " . $base64Credentials;
```

#### C#

```cs
using System;
using System.IO;
using System.Net;
using System.Text;

namespace Examples.System.Net
{
    public class WebRequestPostExample
    {
        public static void Main()
        {
            // Customer ID
            // Set environment variable AGORA_CUSTOMER_KEY
            string customerKey = Environment.GetEnvironmentVariable("AGORA_CUSTOMER_KEY");
            // Customer secret
            // Set environment variable AGORA_CUSTOMER_SECRET
            string customerSecret = Environment.GetEnvironmentVariable("AGORA_CUSTOMER_SECRET");
            // Concatenate customer ID and customer secret
            string plainCredential = customerKey + ":" + customerSecret;

            // Encode with Base64
            var plainTextBytes = Encoding.UTF8.GetBytes(plainCredential);
            string encodedCredential = Convert.ToBase64String(plainTextBytes);
            // Create authorization header
            string authorizationHeader = "Authorization: Basic " + encodedCredential;
        }
    }
}
```

#### Node.js

```javascript
// HTTP Basic Authentication example implemented with Node.js
const https = require('https')
// Customer ID
// Set environment variable AGORA_CUSTOMER_KEY
const customerKey = process.env.AGORA_CUSTOMER_KEY;
// Customer secret
// Set environment variable AGORA_CUSTOMER_SECRET
const customerSecret = process.env.AGORA_CUSTOMER_SECRET;
// Concatenate customer ID and customer secret
const plainCredential = customerKey + ":" + customerSecret
// Encode with Base64
encodedCredential = Buffer.from(plainCredential).toString('base64')
// Create authorization header
authorizationField = "Basic " + encodedCredential
```

#### Python

```python
# -- coding utf-8 --
# Python 3
import base64
import http.client

# Customer ID
# Set environment variable AGORA_CUSTOMER_KEY
customer_key = os.environ.get("AGORA_CUSTOMER_KEY")
# Customer secret
# Set environment variable AGORA_CUSTOMER_SECRET
customer_secret = os.environ.get("AGORA_CUSTOMER_SECRET")

# Concatenate customer ID and customer secret
credentials = customer_key + ":" + customer_secret
# Encode with Base64
base64_credentials = base64.b64encode(credentials.encode("utf8"))
credential = base64_credentials.decode("utf8")
# Create authorization header
basic_auth_header = 'basic ' + credential
```
