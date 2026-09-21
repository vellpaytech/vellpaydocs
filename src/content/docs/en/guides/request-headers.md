---
title: Common request headers
description: Header parameters shared by all VellPay merchant APIs.
---

All countries and endpoints use the following request headers; endpoint pages do not repeat them.

| Header | Type | Required | Length | Description |
|---|---|---|---:|---|
| `appId` | String | Yes | - | Application identifier assigned by VellPay |
| `timestamp` | String | Yes | 13 | Current millisecond timestamp; must be within five minutes of platform time |
| `nonce` | String | Yes | - | Random string for a single request; must not be reused |
| `authorization` | String | Yes | - | Signature generated according to VellPay authentication rules |

```http
appId: YOUR_APP_ID
timestamp: 1789526400000
nonce: 7db2b04d77ad4315a7650ef3b31a82f1
authorization: YOUR_SIGNATURE
```
