---
title: 接口鉴权
description: VellPay RSA 签名、请求验签和回调验签规则。
---

## 加密方式

| 项目 | 取值 |
|---|---|
| 密钥算法 | RSA |
| 密钥长度 | 1024 bit |
| 签名算法 | SHA1WithRSA |
| 签名编码 | Base64 |
| 私钥格式 | PKCS8 |

商户使用自己的私钥签名，VellPay 使用商户公钥验签。平台回调使用平台私钥签名，商户使用平台公钥验签。接入前请先完成[创建密钥](/zh/guides/create-keys/)和公钥交换。

## 请求鉴权流程

1. 生成 13 位毫秒时间戳 `timestamp`。平台允许请求时间与平台当前时间相差不超过 5 分钟。
2. 为每次请求生成随机字符串 `nonce`，同一个 `appId` 在 24 小时内不得重复使用相同的 `nonce`。
3. 请求体字段名按照 ASCII 升序排列并拼接为 `a=1&b=2`，`null`、空字符串和 `sign` 字段不参与签名。
4. 在排序结果末尾追加 `nonce=<value>`。`appId` 和 `timestamp` 不参与签名。
5. 使用商户 PKCS8 私钥和 `SHA1WithRSA` 对 UTF-8 编码的签名原文加签，并将结果进行 Base64 编码。
6. 将签名结果放入请求头 `authorization`，不要将签名加入请求体。


## 签名原文示例

请求体：

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

请求头中的 `nonce`：

```text
7db2b04d77ad4315a7650ef3b31a82f1
```

排序并拼接后的签名原文：

```text
channel=DANA&merchantOrderNo=ORDER202609170001&paymentCallbackUrl=https://merchant.example/callback&paymentType=WALLET&transactionAmount=60000&userEmail=user@example.com&userName=TEST USER&userPhone=081234567890&nonce=7db2b04d77ad4315a7650ef3b31a82f1
```

空值、`null` 和空字符串不参与签名。数组或对象字段使用请求 JSON 解析后的字符串形式参与拼接，商户侧必须确保生成方式与实际发送内容一致。

## Java 签名示例

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

        // VellPay 印度尼西亚代收创建请求体
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

    private static String paramHandler(Map<String, Object> param, String nonce) {
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

    // VellPay 的签名从 authorization 请求头传入
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

示例沿用原签名方案，只将请求参数和请求头调整为 VellPay 格式。传入方法的密钥应移除 PEM 头尾、空格和换行；签名后不要再次修改请求体。

## 完整请求头示例

```http
appId: A2601010001ID001
timestamp: 1789526400000
nonce: 7db2b04d77ad4315a7650ef3b31a82f1
authorization: BASE64_RSA_SIGNATURE
```

国家优先由请求域名识别，商户正常接入时不需要发送 `country` 请求头。

## 回调验签与幂等

- 从回调请求头读取 `nonce` 和 `authorization`，使用 VellPay 平台公钥验证签名。
- 验签规则与请求签名规则保持一致。
- 回调请求头中的 `country` 用于标识具体国家。
- 回调验签成功并完成业务处理后，按照对应回调协议返回成功结果。

## 常见验签失败原因

- 使用了错误环境或错误应用对应的密钥。
- 私钥包含 PEM 头尾、空格或换行。
- 字段排序方式不是 ASCII 升序。
- 空字段参与了签名。
- `nonce` 与请求头中的值不一致。
- 签名使用的请求体与最终发送的 JSON 内容不一致。
- 使用了错误的字符集，应固定为 UTF-8。
