---
title: API Authentication
description: VellPay RSA signing, request verification, and callback verification rules.
---

## Cryptography

| Item | Value |
|---|---|
| Key algorithm | RSA |
| Key length | 1024 bits |
| Signature algorithm | SHA1WithRSA |
| Signature encoding | Base64 |
| Private-key format | PKCS8 |

The merchant signs requests with its private key, and VellPay verifies them with the merchant public key. VellPay signs callbacks with the platform private key, and the merchant verifies them with the platform public key. Complete [key creation](/en/guides/create-keys/) and the public-key exchange before integration.

## Request authentication flow

1. Generate a 13-digit millisecond `timestamp`. The request time must be within five minutes of the VellPay platform time.
2. Generate a random `nonce` for every request. The same `appId` must not reuse a `nonce` within 24 hours.
3. Sort non-empty request-body fields by field name in ascending ASCII order and join them as `a=1&b=2`. Exclude `null`, empty strings, and the `sign` field.
4. Append `nonce=<value>` to the sorted string.
5. Sign the resulting UTF-8 string with the merchant PKCS8 private key and `SHA1WithRSA`, then Base64-encode the signature.
6. Put the signature in the `authorization` request header.

## Signing example

Request body:

```json
{
  "merchantOrderNo": "ORDER202609170001",
  "transactionAmount": "100",
  "paymentType": "QR",
  "description": "test order"
}
```

`nonce` request header:

```text
7db2b04d77ad4315a7650ef3b31a82f1
```

String to sign:

```text
description=test order&merchantOrderNo=ORDER202609170001&paymentType=QR&transactionAmount=100&nonce=7db2b04d77ad4315a7650ef3b31a82f1
```

Arrays and objects use the string representation produced from the actual JSON request. Ensure that the signed content exactly matches the content sent to VellPay.

## Complete request-header example

```http
appId: A2601010001ID001
timestamp: 1789526400000
nonce: 7db2b04d77ad4315a7650ef3b31a82f1
authorization: BASE64_RSA_SIGNATURE
```

The country is normally identified from the request domain. Merchants do not need to send a `country` request header for standard API requests.

## Callback verification and idempotency

- Verify callback signatures with the VellPay platform public key.
- Use the same sorting and signature rules as request authentication.
- Callback request headers include `country` to identify the order country.
- After successful verification and business processing, return the success value defined by the callback endpoint.
- Use `tradeNo` and the order status as the idempotency key for duplicate callbacks.

## Common verification failures

- A key from the wrong environment or application was used.
- The private key still contains PEM headers, spaces, or line breaks.
- Fields were not sorted in ascending ASCII order.
- Empty fields were included in the signature.
- The signed `nonce` differs from the request-header value.
- The signed body differs from the JSON that was sent.
- A character encoding other than UTF-8 was used.
