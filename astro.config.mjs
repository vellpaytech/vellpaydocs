import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";

const navItem = (label, en, value) => ({ label, translations: { en }, ...value });
const country = (label, en, slug, extraItems = []) => ({
  label,
  translations: { en },
  collapsed: true,
  items: [
    ...(["argentina", "colombia"].includes(slug) ? [navItem("收银台创建", "Create checkout", { link: `/${slug}/checkout/create` })] : []),
    navItem("代收创建", "Create pay-in", { link: `/${slug}/payin/create` }),
    navItem("代收查询", "Query pay-in", { link: `/${slug}/payin/query` }),
    navItem("代收回调", "Pay-in callback", { link: `/${slug}/payin/callback` }),
    navItem("代付创建", "Create payout", { link: `/${slug}/payout/create` }),
    navItem("银行编码", "Bank codes", { link: `/${slug}/payout/banks` }),
    navItem("代付查询", "Query payout", { link: `/${slug}/payout/query` }),
    navItem("代付回调", "Payout callback", { link: `/${slug}/payout/callback` }),
    navItem("余额查询", "Balance query", { link: `/${slug}/inquire/balance` }),
    ...extraItems,
  ],
});

export default defineConfig({
  site: "https://docs.vellpay.com",
  integrations: [
    starlight({
      title: "VellPay Docs",
      description: "VellPay 统一支付 API 开发者文档",
      defaultLocale: "zh",
      locales: {
        zh: { label: "中文", lang: "zh-CN" },
        en: { label: "English", lang: "en" },
      },
      head: [
        { tag: "meta", attrs: { name: "theme-color", content: "#07111f" } },
        { tag: "link", attrs: { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" } },
      ],
      sidebar: [
        { label: "开发指南", translations: { en: "Developer guides" }, items: [
          navItem("快速开始", "Quick start", { slug: "guides/quick-start" }),
          navItem("接入指引", "Integration guide", { slug: "guides/getting-started" }),
          navItem("创建密钥", "Create keys", { slug: "guides/create-keys" }),
          navItem("接口鉴权", "Authentication", { slug: "guides/authentication" }),
          navItem("公共请求头", "Request headers", { slug: "guides/request-headers" }),
          navItem("公共响应", "Common responses", { slug: "guides/common-response" }),
          navItem("订单状态", "Order statuses", { slug: "guides/order-status" }),
          navItem("公共错误码", "Error codes", { slug: "guides/error-codes" }),
        ]},
        { label: "亚洲", translations: { en: "Asia" }, items: [
          country("🇮🇩 印尼", "🇮🇩 Indonesia", "indonesia"), country("🇻🇳 越南", "🇻🇳 Vietnam", "vietnam"), country("🇰🇷 韩国", "🇰🇷 South Korea", "korea"),
          country("🇰🇭 柬埔寨", "🇰🇭 Cambodia", "cambodia", [
            navItem("KYC 创建", "Create KYC", { link: "/cambodia/kyc/create" }),
            navItem("KYC 查询", "Query KYC", { link: "/cambodia/kyc/query" }),
            navItem("KYC 回调", "KYC callback", { link: "/cambodia/kyc/callback" }),
            navItem("额度说明", "Limits", { link: "/cambodia/limits" }),
          ]),
          country("🇮🇳 印度", "🇮🇳 India", "india"),
        ]},
        { label: "拉丁美洲", translations: { en: "Latin America" }, items: [
          country("🇨🇴 哥伦比亚", "🇨🇴 Colombia", "colombia"),
          country("🇦🇷 阿根廷", "🇦🇷 Argentina", "argentina", [
            navItem("悬账列表", "Suspense list", { link: "/argentina/suspense/list" }),
            navItem("凭证查询", "Receipt query", { link: "/argentina/suspense/query" }),
            navItem("悬账补单", "Reconcile order", { link: "/argentina/suspense/reorder" }),
          ]),
          country("🇧🇷 巴西", "🇧🇷 Brazil", "brazil"),
        ]},
      ],
      components: {
        ContentPanel: "./src/components/ContentPanel.astro",
        Sidebar: "./src/components/Sidebar.astro",
        Header: "./src/components/Header.astro",
        TableOfContents: "./src/components/TableOfContents.astro",
        MobileTableOfContents: "./src/components/MobileTableOfContents.astro",
      },
      customCss: ["./src/tailwind.css"],
    }),
    tailwind({ applyBaseStyles: false }),
  ],
});
