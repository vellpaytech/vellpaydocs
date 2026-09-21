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

`null` values and empty strings are excluded from the signature.

## Java signing example

```java
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.UUID;

@Slf4j
public class SignUtils {

    public static void main(String[] args) throws Exception {
        // Replace this value with the merchant private key.
        String privateKey = "privateKey";
        String nonce = UUID.randomUUID().toString().replace("-", "");

        // Build the request body.
        JSONObject requestBody = new JSONObject();
        requestBody.put("merchantOrderNo", "TEST1234567890");
        requestBody.put("idCardNumber", "1234567890");
        requestBody.put("realName", "VellPay");
        requestBody.put("amount", "1000");
        requestBody.put("callbackUrl", "https://merchant.example/callback");
        requestBody.put("paymentType", 1);
        requestBody.put("email", "test@example.com");
        requestBody.put("phone", "3000000000");

        // Generate the request signature. Send this value in the
        // authorization header; do not add it to the JSON request body.
        String authorization = signature(requestBody, nonce, privateKey);

        log.info("nonce={}, timestamp={}, authorization={}, requestBody={}",
                nonce, System.currentTimeMillis(), authorization,
                requestBody.toJSONString());
    }

    public static String signature(Map<String, Object> params, String nonce,
                                   String privateKey) throws Exception {
        String stringToSign = buildStringToSign(params, nonce);
        log.debug("stringToSign={}", stringToSign);
        return sign(stringToSign.getBytes(StandardCharsets.UTF_8),
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

    private static String buildStringToSign(Map<String, Object> params,
                                            String nonce) {
        Map<String, Object> sortedParams = new TreeMap<>(params);
        StringBuilder result = new StringBuilder();
        for (Map.Entry<String, Object> entry : sortedParams.entrySet()) {
            if ("sign".equals(entry.getKey())) {
                continue;
            }
            Object value = entry.getValue();
            if (Objects.isNull(value)
                    || (value instanceof String
                    && StringUtils.isBlank((String) value))) {
                continue;
            }
            result.append(entry.getKey()).append("=")
                    .append(value).append("&");
        }
        return result.append("nonce=").append(nonce).toString();
    }

    // Use this method to verify a VellPay callback signature.
    public static boolean verifySignature(Map<String, Object> params,
                                          String nonce, String publicKey) {
        String signature = (String) params.get("sign");
        if (StringUtils.isBlank(signature)) {
            log.error("Callback is missing sign: {}", JSON.toJSONString(params));
            return false;
        }
        try {
            return verifySha1(
                    buildStringToSign(params, nonce)
                            .getBytes(StandardCharsets.UTF_8),
                    publicKey,
                    signature);
        } catch (Exception exception) {
            log.error("RSA signature verification failed: {}",
                    JSON.toJSONString(params), exception);
            return false;
        }
    }

    public static boolean verifySha1(byte[] data, String publicKey,
                                     String signature) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(publicKey);
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(keyBytes);
        PublicKey key = KeyFactory.getInstance("RSA").generatePublic(keySpec);
        Signature verifier = Signature.getInstance("SHA1WithRSA");
        verifier.initVerify(key);
        verifier.update(data);
        return verifier.verify(Base64.getDecoder().decode(signature));
    }
}
```

Remove PEM header and footer lines, spaces, and line breaks from the private key before passing it to the example.

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
- The private key still contains PEM header or footer lines, spaces, or line breaks.
- Fields were not sorted in ascending ASCII order.
- Empty fields were included in the signature.
- The signed `nonce` differs from the request-header value.
- The signed body differs from the JSON that was sent.
- A character encoding other than UTF-8 was used.
