---
title: Common error codes
description: VellPay gateway authentication and common merchant API error codes.
---

VellPay uses the response field `code` for the API call result. `code=200` only indicates successful request processing; determine the final transaction result using `data.status`, an order query or callback.

## Gateway authentication errors

| Error code | Error message | Suggested action |
|---:|---|---|
| `401` | Header country error | The country cannot be identified from the domain or fallback request header; verify the country test domain |
| `401` | Header appId is invalid | Check that `appId` belongs to the current environment and country and has the correct format and length |
| `401` | Header timestamp not found | Request headers are missing a valid 13-digit millisecond timestamp |
| `401` | Header timestamp expire | Request time differs from platform time by more than five minutes; synchronize server time |
| `401` | Nonce verify fail | `nonce` was reused or is invalid; generate a new random string |
| `401` | authorization verification failed | Check the signing string, merchant private key, parameter sorting, and `authorization` |
| `401` | app not set merchant public key | The current application has no merchant public key; complete public-key exchange first |
| `413` | json parse error | Request body is not valid JSON |
| `415` | body empty | Request body is empty |
| `416` | gateway maintaining | Gateway is under maintenance, retry later |
| `500` | gateway error | Internal gateway error; record `tid` and contact VellPay technical support |

## Common business errors

| Error code | Error message | Suggested action |
|---:|---|---|
| `401` | signature verification failed | Signature verification failed; regenerate the signature |
| `412` | Please try again later | System is busy, retry later |
| `413` | Request timestamp Timestamp timeout | Request timestamp expired; use the current millisecond timestamp |
| `414` | parameter validation failed | Parameter validation failed; see the field identified by `msg` |
| `416` | Application not found | Application does not exist; verify `appId` and the calling environment |
| `417` | Merchant account not found | Merchant account does not exist or the country account is not enabled |
| `418` | Merchant account is closed | Merchant account is closed; contact technical support |
| `421` | This payout method is not supported | The current country does not support `payoutType` |
| `423` | This payment method is not supported | The current country does not support `paymentType` |
| `424` | This payment method is not configured | The merchant has not configured this pay-in method |
| `425` | Insufficient merchant balance | The merchant’s available balance is insufficient. |
| `426` | merchant order duplicate | Merchant order number is duplicated; check idempotency or use another order number |
| `427` | The callback notification address for collection must not be empty. | Configure a pay-in callback URL. |
| `429` | The card number does not match the bank code. | Bank account does not match the bank code |
| `431` | The bank code does not supported. | The current service does not support this bank code |
| `433` | Payment way not support check out | The current payment method does not support checkout |
| `434` | Merchant order not exist | Merchant order does not exist; check the order number and endpoint type |
| `448` | request time out | Downstream request timed out; query the original order before retrying |
| `460` | The current payment method is unavailable. | The current payment method is unavailable. Use another method or retry later. |
| `462` | This request failed due to blacklist blocking | Request was blocked by the risk-control blacklist; check user parameters |
| `466` | Payment method fee rate not configured. | The merchant has not configured the payment-method fee rate |
| `473` | Merchant joint verification error | Merchant country, account, payment method, or fee configuration is invalid |
| `487` | This API has not yet been made available. | The endpoint is not enabled for the current merchant or country |
| `492` | The order amount does not fall within the configured amount range for the selected payment method. | Order amount is outside the permitted payment-method range |
| `500` | Business Error | General business error; record request details and `tid`, then contact technical support |

## Error response example

```json
{
  "code": 414,
  "data": null,
  "msg": "paymentType is invalid",
  "tid": "747bbf80261844ed85b809212aab0d81"
}
```

:::tip
For unknown errors, save the complete request, response, and request time, `appId`, merchant order number, and `tid`. Never send technical support the merchant private key or full `authorization`.
:::
