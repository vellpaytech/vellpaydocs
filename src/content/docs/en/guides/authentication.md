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
4. Append `nonce=<value>` to the sorted string. Do not include `appId` or `timestamp` in the string to sign.
5. Sign the resulting UTF-8 string with the merchant PKCS8 private key and `SHA1WithRSA`, then Base64-encode the signature.
6. Put the signature in the `authorization` request header; do not add it to the request body.

## Signing example

Request body:

```json
{
  "merchantOrderNo": "ORDER202609170001",
  "transactionAmount": "60000",
  "paymentType": "WALLET",
  "userName": "TEST USER",
  "userPhone": "081234567890",
  "userEmail": "user@example.com",
  "channel": "DANA",
  "paymentCallbackUrl": "https://merchant.example/callback"
}
```

`nonce` request header:

```text
7db2b04d77ad4315a7650ef3b31a82f1
```

String to sign:

```text
channel=DANA&merchantOrderNo=ORDER202609170001&paymentCallbackUrl=https://merchant.example/callback&paymentType=WALLET&transactionAmount=60000&userEmail=user@example.com&userName=TEST USER&userPhone=081234567890&nonce=7db2b04d77ad4315a7650ef3b31a82f1
```

Arrays and objects use the string representation produced from the actual JSON request. Ensure that the signed content exactly matches the content sent to VellPay.

`null` values and empty strings are excluded from the signature.

## Java signing example

```java
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.UUID;

public class SignUtils {

    public static void main(String[] args) throws Exception {
        String appId = "YOUR_APP_ID";
        String privateKey = "YOUR_PKCS8_PRIVATE_KEY";
        String timestamp = String.valueOf(System.currentTimeMillis());
        String nonce = UUID.randomUUID().toString().replace("-", "");

        // VellPay Indonesia pay-in creation request body.
        JSONObject requestBody = new JSONObject();
        requestBody.put("merchantOrderNo", "ORDER202609170001");
        requestBody.put("transactionAmount", "60000");
        requestBody.put("paymentType", "WALLET");
        requestBody.put("userName", "TEST USER");
        requestBody.put("userPhone", "081234567890");
        requestBody.put("userEmail", "user@example.com");
        requestBody.put("channel", "DANA");
        requestBody.put("paymentCallbackUrl", "https://merchant.example/callback");

        String authorization = signature(requestBody, nonce, privateKey);

        Map<String, String> headers = new LinkedHashMap<>();
        headers.put("Content-Type", "application/json");
        headers.put("appId", appId);
        headers.put("timestamp", timestamp);
        headers.put("nonce", nonce);
        headers.put("authorization", authorization);

        System.out.println("headers=" + JSON.toJSONString(headers));
        System.out.println("requestBody=" + requestBody.toJSONString());
    }

    public static String signature(Map<String, Object> param, String nonce,
                                   String privateKey) throws Exception {
        String signatureStr = paramHandler(param, nonce);
        return sign(signatureStr.getBytes(StandardCharsets.UTF_8),
                privateKey, "SHA1WithRSA");
    }

    public static String sign(byte[] data, String privateKey,
                              String algorithm) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(privateKey);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
        PrivateKey key = KeyFactory.getInstance("RSA").generatePrivate(keySpec);
        Signature signer = Signature.getInstance(algorithm);
        signer.initSign(key);
        signer.update(data);
        return Base64.getEncoder().encodeToString(signer.sign());
    }

    private static String paramHandler(Map<String, Object> param,
                                       String nonce) {
        StringBuilder result = new StringBuilder();
        for (Map.Entry<String, Object> entry : new TreeMap<>(param).entrySet()) {
            if ("sign".equals(entry.getKey())) {
                continue;
            }
            Object value = entry.getValue();
            if (Objects.isNull(value)
                    || (value instanceof String && ((String) value).trim().isEmpty())) {
                continue;
            }
            result.append(entry.getKey()).append("=").append(value).append("&");
        }
        return result.append("nonce=").append(nonce).toString();
    }

    // VellPay supplies the signature in the authorization request header.
    public static boolean verifySign(Map<String, Object> param, String nonce,
                                     String publicKey, String authorization) throws Exception {
        return verifySha1(paramHandler(param, nonce).getBytes(StandardCharsets.UTF_8), publicKey, authorization);
    }

    public static boolean verifySha1(byte[] data, String publicKey,
                                     String authorization) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(publicKey);
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(keyBytes);
        PublicKey key = KeyFactory.getInstance("RSA").generatePublic(keySpec);
        Signature verifier = Signature.getInstance("SHA1WithRSA");
        verifier.initVerify(key);
        verifier.update(data);
        return verifier.verify(Base64.getDecoder().decode(authorization));
    }
}
```

The example keeps the original signing scheme and changes only the request parameters and headers for VellPay. Remove PEM headers, footers, spaces, and line breaks from keys, and do not modify the request body after signing.

## Complete request-header example

```http
appId: A2601010001ID001
timestamp: 1789526400000
nonce: 7db2b04d77ad4315a7650ef3b31a82f1
authorization: BASE64_RSA_SIGNATURE
```

The country is normally identified from the request domain. Merchants do not need to send a `country` request header for standard API requests.

## Callback verification and idempotency

- Read `nonce` and `authorization` from the callback headers and verify the signature with the VellPay platform public key.
- Use the same sorting and signature rules as request authentication.
- Callback request headers include `country` to identify the order country.
- After successful verification and business processing, return the success value defined by the callback endpoint.
- Use `tradeNo` and the order status as the idempotency key for duplicate callbacks.

## Common verification failures

- A key from the wrong environment or application was used.
- The private key still contains PEM header or footer lines, spaces, or line breaks.
- Fields were not sorted in ascending ASCII order.
- Empty fields were included in the signature.
- The signed `nonce` differs from the request-header value.
- The signed body differs from the JSON that was sent.
- A character encoding other than UTF-8 was used.
