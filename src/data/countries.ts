export interface CountryCapability {
  label: string;
  description: string;
  href: string;
  tone: "payin" | "payout" | "checkout";
}

export interface CountryConfig {
  locale?: "zh" | "en";
  slug: string;
  name: string;
  flag: string;
  code: string;
  currency: string;
  currencyName: string;
  timezone: string;
  region: "asia" | "latin-america";
  summary: string;
  capabilities: CountryCapability[];
  paymentMethods: string[];
  notices: Array<{ label: string; description: string }>;
}

const capabilities = (slug: string, supportsCheckout = false): CountryCapability[] => [
  { label: "代收 Pay-in", description: "创建本地代收订单并查询订单状态。", href: `/${slug}/payin/create`, tone: "payin" },
  { label: "代付 Payout", description: "向本地银行账户或钱包发起资金付款。", href: `/${slug}/payout/create`, tone: "payout" },
  ...(supportsCheckout ? [{ label: "收银台 Checkout", description: "创建托管支付页面并获取支付链接。", href: `/${slug}/checkout/create`, tone: "checkout" as const }] : []),
];

export const countries: Record<string, CountryConfig> = {
  indonesia: {
    slug: "indonesia", name: "印度尼西亚", flag: "🇮🇩", code: "ID", currency: "IDR", currencyName: "印度尼西亚盾",
    timezone: "Asia/Jakarta (UTC+7)", region: "asia", summary: "接入印度尼西亚本地代收与代付能力。",
    capabilities: capabilities("indonesia"), paymentMethods: ["PaymentLink", "E-Wallet", "VA", "QRIS", "QRIS-Direct", "VA-Direct"],
    notices: [{ label: "金额", description: "交易金额使用 IDR，按接口字段规则传递。" }, { label: "手机号", description: "用户手机号应符合印度尼西亚本地号码格式。" }, { label: "渠道", description: "部分支付方式需要同时传递 channel。" }],
  },
  vietnam: {
    slug: "vietnam", name: "越南", flag: "🇻🇳", code: "VN", currency: "VND", currencyName: "越南盾",
    timezone: "Asia/Ho_Chi_Minh (UTC+7)", region: "asia", summary: "接入越南本地代收与代付能力。",
    capabilities: capabilities("vietnam"), paymentMethods: ["以商户已开通的 paymentType 为准"],
    notices: [{ label: "测试环境", description: "越南测试域名确认后开放在线请求。" }, { label: "时间", description: "业务时间使用越南当地时间。" }],
  },
  korea: {
    slug: "korea", name: "韩国", flag: "🇰🇷", code: "KR", currency: "KRW", currencyName: "韩元",
    timezone: "Asia/Seoul (UTC+9)", region: "asia", summary: "接入韩国虚拟账户、钱包支付及本地付款能力。",
    capabilities: capabilities("korea"), paymentMethods: ["VA", "KYC VA dynamic", "KAKAOPAY", "TOSSPAY"],
    notices: [{ label: "金额", description: "KRW 金额按整数规则处理。" }, { label: "身份信息", description: "部分支付方式需要用户身份及账户持有人信息。" }, { label: "手机号", description: "使用符合韩国本地格式的手机号。" }],
  },
  cambodia: {
    slug: "cambodia", name: "柬埔寨", flag: "🇰🇭", code: "KH", currency: "KHR / USD", currencyName: "瑞尔 / 美元",
    timezone: "Asia/Phnom_Penh (UTC+7)", region: "asia", summary: "接入柬埔寨本地支付及 KYC 认证能力。",
    capabilities: capabilities("cambodia"), paymentMethods: ["KHQR", "KHQR_USD", "BankTransfer", "BankTransfer_USD"],
    notices: [{ label: "KYC", description: "柬埔寨开放 KYC 创建与查询接口。" }, { label: "币种", description: "支付方式决定使用 KHR 或 USD。" }, { label: "金额精度", description: "KHR 使用整数，USD 可保留两位小数。" }],
  },
  india: {
    slug: "india", name: "印度", flag: "🇮🇳", code: "IN", currency: "INR", currencyName: "印度卢比",
    timezone: "Asia/Kolkata (UTC+5:30)", region: "asia", summary: "接入印度聚合支付、二维码、钱包和本地付款能力。",
    capabilities: capabilities("india"), paymentMethods: ["CHECKOUT", "QR", "PHONEPE", "PAYTM", "BANK_TRANSFER", "UPI"],
    notices: [{ label: "代收方式", description: "支持 CHECKOUT、QR、PHONEPE 和 PAYTM。" }, { label: "代付方式", description: "支持 BANK_TRANSFER 和 UPI。" }, { label: "金额", description: "交易币种为 INR。" }],
  },
  colombia: {
    slug: "colombia", name: "哥伦比亚", flag: "🇨🇴", code: "CO", currency: "COP", currencyName: "哥伦比亚比索",
    timezone: "America/Bogota (UTC-5)", region: "latin-america", summary: "接入哥伦比亚 PSE、钱包、BRE-B 与本地付款能力。",
    capabilities: capabilities("colombia", true), paymentMethods: ["PSE", "NEQUI_PSE", "EFECTY", "DAVIPLATA_PSE", "TRANSFIYA", "MOVIL_PSE", "DALE_PSE", "BREB_KEY", "NEQUI_PUSH", "BREB_QR", "DAVIPLATA_PUSH", "AHORRO", "CORRIENTE", "PHONE", "BREB"],
    notices: [{ label: "币种", description: "交易使用 COP，金额规则以接口字段说明为准。" }, { label: "BRE-B", description: "实际到账金额可能由付款人在银行 App 中输入，应以最终通知为准。" }, { label: "账户类型", description: "代付方式需与实际收款账户类型匹配。" }],
  },
  argentina: {
    slug: "argentina", name: "阿根廷", flag: "🇦🇷", code: "AR", currency: "ARS", currencyName: "阿根廷比索",
    timezone: "America/Argentina/Buenos_Aires (UTC-3)", region: "latin-america", summary: "接入阿根廷二维码、CVU、现金支付及悬账管理能力。",
    capabilities: capabilities("argentina", true), paymentMethods: ["QR", "CVU", "RAPIPAGO", "PAGOFACIL"],
    notices: [{ label: "金额", description: "交易使用 ARS，部分场景要求金额为 10 的倍数。" }, { label: "CVU", description: "实际支付金额可能与订单期望金额不同，应正确处理不足额和超额。" }, { label: "悬账", description: "提供悬账列表、凭证查询和补单接口。" }],
  },
  brazil: {
    slug: "brazil", name: "巴西", flag: "🇧🇷", code: "BR", currency: "BRL", currencyName: "巴西雷亚尔",
    timezone: "America/Sao_Paulo (UTC-3)", region: "latin-america", summary: "接入巴西 PIX 代收与本地代付能力。",
    capabilities: capabilities("brazil"), paymentMethods: ["PIX"],
    notices: [{ label: "支付方式", description: "当前代收支付方式为 PIX。" }, { label: "金额", description: "交易使用 BRL，最多保留两位小数。" }, { label: "本地信息", description: "用户身份和银行信息按具体接口字段要求传递。" }],
  },
};

export const countryGroups = [
  { id: "latin-america", label: "拉丁美洲", countries: [countries.argentina, countries.brazil, countries.colombia] },
  { id: "asia", label: "亚洲", countries: [countries.cambodia, countries.india, countries.indonesia, countries.korea, countries.vietnam] },
];
