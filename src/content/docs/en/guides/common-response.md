---
title: Common responses
description: All VellPay merchant APIs use a common response structure.
---

All countries and endpoints use the following response structure. Business fields are contained in `data`, and documented separately on each endpoint page.

## Response parameters

| Field | Type | Required | Description |
|---|---|---|---|
| `code` | Integer | Yes | Response status code, `200` indicates successful request processing |
| `data` | Object / Array / null | Yes | Business response data; structure depends on the endpoint |
| `msg` | String | No | Response description or error details |
| `tid` | String | Yes | Request trace identifier; provide it for troubleshooting |

## Success response example

```json
{
  "code": 200,
  "data": {},
  "msg": "success",
  "tid": "747bbf80261844ed85b809212aab0d81"
}
```

## Error response example

```json
{
  "code": 414,
  "data": null,
  "msg": "paymentType is invalid",
  "tid": "747bbf80261844ed85b809212aab0d81"
}
```

When `code` is not `200`, treat the request as failed and retain `tid`. See [Common error codes](/en/guides/error-codes/) for meanings and suggested actions.
