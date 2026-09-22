---
title: 公共请求头
description: 商户请求 VellPay 及 VellPay 回调商户时使用的 Header 参数。
---

请求头根据调用方向分为接口请求头和回调请求头。

<h2 id="api-request-headers">接口请求头</h2>

商户请求 VellPay 时，所有国家和接口统一使用以下请求头。

| Header | 类型 | 必填 | 长度 | 说明 |
|---|---|---|---:|---|
| `appId` | String | 是 | - | VellPay 分配的应用标识 |
| `timestamp` | String | 是 | 13 | 当前毫秒时间戳，与平台时间差不得超过 5 分钟 |
| `nonce` | String | 是 | - | 单次请求随机字符串，不得重复使用 |
| `authorization` | String | 是 | - | 使用商户私钥生成的请求签名 |

<h2 id="callback-request-headers">回调请求头</h2>

VellPay 向商户发送代收、代付等业务回调时，统一使用以下请求头。

| Header | 类型 | 必填 | 长度 | 说明 |
|---|---|---|---:|---|
| `appId` | String | 是 | - | VellPay 分配的应用标识 |
| `timestamp` | String | 是 | 13 | VellPay 发起回调时的毫秒时间戳 |
| `nonce` | String | 是 | - | 本次回调签名使用的随机字符串 |
| `authorization` | String | 是 | - | 使用 VellPay 平台私钥生成的回调签名 |
| `country` | String | 是 | 2 | 订单所属国家的两位国家代码 |
