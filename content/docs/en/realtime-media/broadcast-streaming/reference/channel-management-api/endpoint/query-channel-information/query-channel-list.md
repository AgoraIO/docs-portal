---
title: "Query channel list"
description: "API reference for querying the channel list"
---

<LeftColumn
  method="GET"
  endpoint="https://api.agora.io/dev/v1/channel/{appid}"
 >

Use this endpoint to get the list of all channels under a specified project. The channel list is returned by page; specify the page number and page size in the request URL.
:::note
If the number of users in a channel changes frequently, the query results may be inaccurate. The following situations may occur:
- A channel appears repeatedly on different pages.
- A channel does not appear on any page.
:::
## Request

The request URL and request body is case-sensitive. All requests must use HTTPS.

### Request header

- `Content-Type`: `application/json`
- The request header must contain the `Authorization` field. For details, see [RESTful authentication](../../restful-authentication).

### Path parameters

<PathParameter name="appid" type="string" required={true}>
 The App ID of the project. You can get it through one of the following methods:
 - Copy from the [Agora Console](https://console.agora.io)
 - Call the [Get all projects](../../agora-console-rest-api) API, and read the value of the `vendor_key` field in the response body.
</PathParameter>

### Query parameters

<ParameterList title="QUERY">
 <Parameter name="page_no" type="number" required={false} defaultValue="0">
  The page number to query. The default value is `0`, which is the first page. The value of `page_no` cannot exceed `(total number of channels / page_size) - 1`; otherwise, the specified page contains no channels.
 </Parameter>

 <Parameter name="page_size" type="number" required={false} defaultValue="100" possibleValues="[1,500]">
  The number of channels per page.
 </Parameter>
</ParameterList>

## Response

A `200` status code indicates success. The response body contains the following parameters:

<ParameterList title="OK">
 <Parameter name="success" type="boolean">
  The state of this request:
  - `true`: Success.
  - `false`: Reserved for future use.
 </Parameter>

 <Parameter name="data" type="object">
  Channel statistics.

  <Parameter name="channels" type="array">
   The list of channels. Each object in the array represents one channel and contains the following fields. If the specified page contains no channels, this field is empty.

   <Parameter name="channel_name" type="string">
    The channel name.
   </Parameter>

   <Parameter name="user_count" type="number">
    The total number of users in the channel.
   </Parameter>
  </Parameter>

  <Parameter name="total_size" type="number">
   The total number of channels under the specified project.
  </Parameter>
 </Parameter>
</ParameterList>

If the status code is not `200`, the request fails. See the `message` field in the response body for the reason for this failure. Refer to [Response status codes](../../response-status-code) for details.

</LeftColumn>

<RightColumn>

<Section title="Authorization">
 This endpoint requires [Basic authentication](../../restful-authentication).
</Section>

<Section title="Request example">

Test this request in [Postman](https://documenter.getpostman.com/view/6319646/SVSLr9AM#080ffa91-0c31-42ab-9177-7942f8691ea2) or use one of the following code examples:

**Curl**
```bash
curl --request GET \
 --url 'https://api.sd-rtn.com/dev/v1/channel/<appid>?page_no=0&page_size=100' \
 --header 'Accept: application/json' \
 --header 'Authorization: Basic <your_base64_encoded_credentials>'
```

**Node.js**
```js
const http = require('http');

const options = {
 method: 'GET',
 hostname: 'api.sd-rtn.com',
 port: null,
 path: '/dev/v1/channel/<appid>?page_no=0&page_size=100',
 headers: {
  Authorization: 'Basic <your_base64_encoded_credentials>',
  Accept: 'application/json'
 }
};

const req = http.request(options, function (res) {
 const chunks = [];

 res.on('data', function (chunk) {
  chunks.push(chunk);
 });

 res.on('end', function () {
  const body = Buffer.concat(chunks);
  console.log(body.toString());
 });
});

req.end();
```

**Python**
```python
import http.client

conn = http.client.HTTPConnection("api.sd-rtn.com")

headers = {
  'Authorization': "Basic <your_base64_encoded_credentials>",
  'Accept': "application/json"
}

conn.request("GET", "/dev/v1/channel/<appid>?page_no=0&page_size=100", headers=headers)

res = conn.getresponse()
data = res.read()
print(data.decode("utf-8"))
```

</Section>

<Section title="Response example">

```json
{
 "success": true,
 "data": {
  "channels": [
   {
    "channel_name": "lkj144",
    "user_count": 3
   }
  ],
  "total_size": 1
 }
}
```

</Section>
</RightColumn>
