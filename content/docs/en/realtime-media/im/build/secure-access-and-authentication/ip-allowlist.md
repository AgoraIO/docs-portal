---
title: "TCP/TLS IP allowlist"
description: "Describes the TCP/TLS IP allowlist function"
---

For the communication between end users behind enterprise firewalls, Agora Chat allows all communications to always use TCP/TLS 443 with TLS headers. Agora Chat supports the IP allowlist function. If you have a strict security policy for end users and allow only certain absolute domain names or specified IP addresses/port ranges to communicate through TCP/TLS 443, you can add the allowed IP addresses or domain names to the IP allowlist. To ensure smooth communication via Agora Chat, you must add the IP addresses and ports of data centers of Agora Chat to the firewall allowlist.

### Add IP addresses and ports of data centers of Agora Chat to the firewall allowlist

1. Prepare the development environment. See [SDK quickstart](../../get-started-sdk) for your platform.

1. Add the IP addresses and ports of Agora Chat access points to the firewall allowlist.

1. Test message sending and receiving in the development environment.

### List of domain names of Agora Chat data centers

For each Agora Chat data center, for example, Singapore, virginia US, or Frankfurt Germany, Agora Chat provides fully qualified domain names for the access points.

Agora fully controls the servers and the traffic on the IP addresses of the access points. The IP addresses are subject to change and any changes will be announced with a minimum of a 3-month notice to you, ensuring that you have enough time to update their firewalls to trust these IP addresses.

**virginia, US**

| Domain Name | IP Address | Port | Platform |
| :---------- | :------- | :----- | :------------- |
| [msync-api-41.chat.agora.io](http://msync-api-41.chat.agora.io/) | 3.33.220.151, 15.197.222.199 | 443 | Client SDKs |
| [msync-im-41-tls.chat.agora.io](http://msync-im-41-tls.chat.agora.io/) | 52.223.55.237, 35.71.161.179 | 443 | Client SDKs |
| [a41.chat.agora.io](http://a41.chat.agora.io/) | 99.83.189.183, 75.2.75.207 | 443 | RESTful API |
| ap-america.agora.io | 106.14.12.130, 47.107.39.93, 118.190.148.38, 112.126.96.46, 52.58.56.244, 35.178.208.187, 52.52.84.170, 50.17.126.121, 3.0.163.78, 52.194.158.59, 54.65.86.72, 13.127.149.196, 15.206.47.129, 123.56.235.221, 101.132.108.165, 52.28.239.238, 3.9.120.239, 52.54.85.111, 184.72.18.217, 13.250.89.184, 18.176.162.64 | UDP port: 8443, 5888-5889, 4000-4100 and 8130; UDP port: 443 and 8443 | Client SDKs |

**Singapore**

| Domain Name | IP Address | Port | Platform |
| :---------- | :------- | :----- | :------------- |
| [msync-api-61.chat.agora.io](http://msync-api-61.chat.agora.io/) | 35.71.135.178, 52.223.50.200 | 443 | Client SDKs |
| [msync-im-61-tls.chat.agora.io](http://msync-im-61-tls.chat.agora.io/) | 35.71.183.128, 52.223.36.218 | 443 | Client SDKs |
| [a61.chat.agora.io](http://a61.chat.agora.io/) | 52.223.32.250, 35.71.139.186 | 443 | RESTful API |
| ap-asia.agora.io | 106.14.12.130, 47.107.39.93, 118.190.148.38, 112.126.96.46, 52.58.56.244, 35.178.208.187, 52.52.84.170, 50.17.126.121, 3.0.163.78, 52.194.158.59, 54.65.86.72, 13.127.149.196, 15.206.47.129, 123.56.235.221, 101.132.108.165, 52.28.239.238, 3.9.120.239, 52.54.85.111, 184.72.18.217, 13.250.89.184, 18.176.162.64 | UDP port: 8443, 5888-5889, 4000-4100 and 8130; TCP port: 443 and 8443 | Client SDKs |

**Frankfurt Germany**

| Domain Name | IP Address | Port | Platform |
| :---------- | :------- | :----- | :------------- |
| [msync-api-71.chat.agora.io](http://msync-api-71.chat.agora.io/) | 75.2.86.219, 99.83.214.138 | 443 | Client SDKs |
| [msync-im-71-tls.chat.agora.io](http://msync-im-71-tls.chat.agora.io/) | 75.2.56.250, 99.83.180.145 | 443 | Client SDKs |
| [a71.chat.agora.io](http://a71.chat.agora.io/) | 3.33.221.135, 15.197.253.209 | 443 | RESTful API |
| ap-europe.agora.io | 106.14.12.130, 47.107.39.93, 118.190.148.38, 112.126.96.46, 52.58.56.244, 35.178.208.187, 52.52.84.170, 50.17.126.121, 3.0.163.78, 52.194.158.59, 54.65.86.72, 13.127.149.196, 15.206.47.129, 123.56.235.221, 101.132.108.165, 52.28.239.238, 3.9.120.239, 52.54.85.111, 184.72.18.217, 13.250.89.184, 18.176.162.64 | UDP port: 8443, 5888-5889, 4000-4100 and 8130; TCP port: 443 and 8443 | Client SDKs |
