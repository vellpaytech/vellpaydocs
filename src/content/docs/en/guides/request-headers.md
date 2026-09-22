---
title: Common request headers
description: Header parameters used for merchant API requests and VellPay callbacks.
---

Headers are grouped by the direction of the request.

<h2 id="api-request-headers">API request headers</h2>

Merchant requests to VellPay use the following headers for every country and endpoint.

| Header | Type | Required | Length | Description |
|---|---|---|---:|---|
| `appId` | String | Yes | - | Application identifier assigned by VellPay |
| `timestamp` | String | Yes | 13 | Current millisecond timestamp; must be within five minutes of platform time |
| `nonce` | String | Yes | - | Random string for a single request; must not be reused |
| `authorization` | String | Yes | - | Request signature generated with the merchant private key |

<h2 id="callback-request-headers">Callback request headers</h2>

VellPay uses the following headers when sending pay-in, payout, and other business callbacks to merchants.

| Header | Type | Required | Length | Description |
|---|---|---|---:|---|
| `appId` | String | Yes | - | Application identifier assigned by VellPay |
| `timestamp` | String | Yes | 13 | Millisecond timestamp when VellPay sends the callback |
| `nonce` | String | Yes | - | Random string used to sign this callback |
| `authorization` | String | Yes | - | Callback signature generated with the VellPay platform private key |
| `country` | String | Yes | 2 | Two-letter country code of the order |
