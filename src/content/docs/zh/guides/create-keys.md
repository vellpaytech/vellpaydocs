---
title: 创建密钥
description: 生成并配置 VellPay 接口使用的 RSA 密钥对。
---

# 操作步骤

1. 生成一组商户 RSA 公钥和私钥。
2. 在 VellPay 商户后台填写商户公钥，并保存平台公钥。
3. 使用商户私钥为请求签名，使用平台公钥验证回调签名。

# 第一步：生成商户密钥对

#### 方式一：使用命令行创建
VellPay 使用 RSA 密钥完成请求签名和响应验签。请在可信设备上使用 OpenSSL 生成 PKCS8 私钥及对应公钥。

```bash
openssl genpkey -algorithm RSA -out merchant_private_key.pem -pkeyopt rsa_keygen_bits:1024
openssl rsa -pubout -in merchant_private_key.pem -out merchant_public_key.pem
```

Windows 用户可在 CMD 或 PowerShell 中执行相同命令；macOS 用户如未安装 OpenSSL，可先执行 `brew install openssl`。

生成后将得到：

- `merchant_private_key`：商户私钥，只能保存在商户服务端。
- `merchant_public_key`：商户公钥，用于配置到 VellPay 应用。

#### 方式二：使用密钥生成工具创建（建议使用此方法）

访问网址：[公私钥生成在线工具](https://uutool.cn/rsa-generate/)

密钥长度选择：1024

格式选择：PKCS8

![公私钥生成在线工具](https://image.xiwu.me/2024/812b469da11fd34b0ccc5357893a4917.png)

此时我们得到：公钥和私钥（使用时不要有空格和换行，请妥善保管私钥，公钥将在本文第二步中使用）

:::caution
不要把私钥发送给 VellPay，也不要把私钥提交到 Git、前端代码、文档站或日志系统。
:::

建议由商户安全团队在可信环境生成密钥。不要在不受信任的在线网站中生成生产密钥。

## 第二步：交换公钥

1. 登录 VellPay 商户后台，进入“商户中心 > 应用列表”。
2. 如果尚未创建应用，点击“添加应用”；已有应用则进入应用设置。
3. 点击“交换公钥”，按后台要求完成身份验证。
4. 在“商户公钥”中填写生成的公钥正文。
5. 复制并安全保存后台展示的“平台公钥”，后续用于验证平台回调签名。

填写公钥时去掉下面两行标记，并移除正文中的空格和换行：

```text
-----BEGIN PUBLIC KEY-----
-----END PUBLIC KEY-----
```

密钥必须配套使用。重新生成商户密钥后，需要在商户后台同步更新商户公钥。

:::note
测试环境和生产环境的应用及密钥相互隔离。请勿使用测试应用调用生产环境，也不要在两个环境复用生产私钥。
:::

## 第三步：接入鉴权

完成密钥交换后，根据[接口鉴权](/zh/guides/authentication/)生成请求头中的 `authorization`，并使用平台公钥验证响应及回调签名。
