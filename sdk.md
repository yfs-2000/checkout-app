# FuturePay Checkout SDK

一个功能强大的支付收银台 SDK，支持弹窗和嵌入两种模式，和完整的 TypeScript 支持。

## 特性

- 🚀 **双模式支持**: 弹窗模式和嵌入模式
- 📱 **响应式设计**: 完美适配桌面端和移动端
- 🎯 **高度自适应**: 嵌入 iframe 高度根据内容自动调整
- 🔒 **安全通信**: 基于 postMessage 的跨域安全通信，支持 RSA + AES 加密
- 🎨 **高度可定制**: 丰富的样式和配置选项
- 📦 **轻量级**: 打包体积小，加载速度快
- 🛡️ **TypeScript**: 完整的类型定义支持
- 🌍 **多环境支持**: 支持开发、测试、生产环境配置

## 安装

### 使用 npm 安装

```bash
npm install @futurepay/checkout-sdk
# 或
yarn add @futurepay/checkout-sdk
# 或
pnpm add @futurepay/checkout-sdk
```

### 使用 CDN 引入

#### UMD 全局方式（快速开始）

```html
<script src="https://cdn.jsdelivr.net/npm/@futurepay/checkout-sdk@latest/dist/index.umd.min.js"></script>
<script>
  // SDK 会挂载到 window.FuturePayCheckoutSDK
  const { openCheckoutModal, embedCheckout, PaymentCheckout } =
    window.FuturePayCheckoutSDK;
  // openCheckoutModal(checkoutOptions);
</script>
```

#### ESM 模块方式（现代浏览器或打包工具）

```html
<script type="module">
  import {
    openCheckoutModal,
    embedCheckout,
    PaymentCheckout,
  } from "https://cdn.jsdelivr.net/npm/@futurepay/checkout-sdk@latest/dist/index.esm.js";

  // openCheckoutModal(checkoutOptions);
</script>
```

> 也可以将上面的 `cdn.jsdelivr.net` 换成 `unpkg.com` 等其他 CDN 服务。 如 `https://unpkg.com/@futurepay/checkout-sdk@latest/dist/index.umd.min.js`

## 使用方法

### 基本用法

```javascript
import { openCheckoutModal, embedCheckout } from "@futurepay/checkout-sdk";

// 配置选项
const checkoutOptions = {
  appId: "your-app-id",
  merchantId: "your-merchant-id",
  merchantRsaPublicKey: "your-merchant-rsa-public-key",
  env: "test", // 'test' | 'prod'
  orderInfo: {
    amount: {
      currency: "USD",
      value: "100",
    },
    countryCode: "US",
    productDetail: "Sample Product",
    origin: "https://your-website.com",
    reference: "ORDER_123",
    returnUrl: "https://your-website.com/return",
    webhookUrl: "https://your-website.com/webhook",
    productName: "Sample Product",
    paymentMethod: {
      type: "card",
      firstName: "John",
      lastName: "Doe",
      shopperEmail: "john.doe@example.com",
      telephoneNumber: "1234567890",
    },
    browserInfo: {
      terminalType: "web",
      osType: "desktop",
    },
  },
};
```

### 1. 弹窗模式

```javascript
// 在页面中心弹出收银台
const checkoutInstance = await openCheckoutModal(checkoutOptions);

// 手动关闭
checkoutInstance.close();
```

### 2. 嵌入模式（高度自适应）⭐

```javascript
// 高度自适应的嵌入式收银台
const checkoutInstance = await embedCheckout("#checkout-container", {
  ...checkoutOptions,
  style: {
    width: "100%",
    minHeight: "400px",
    maxHeight: "800px",
  },
  callbacks: {
    ...checkoutOptions.callbacks,
    // 🎯 高度变化回调
    onHeightChange: (height) => {
      console.log("收银台高度变化:", height + "px");
      // 可以在这里执行自定义逻辑，比如调整父容器样式
    },
  },
});
```

### 3. 高级用法

```javascript
import { PaymentCheckout } from "@futurepay/checkout-sdk";

const checkout = new PaymentCheckout({
  appId: "your-app-id",
  merchantId: "your-merchant-id",
  env: "prod", // 生产环境
  orderInfo: {
    amount: {
      currency: "USD",
      value: "100",
    },
    countryCode: "US",
    productDetail: "Premium Product",
    origin: "https://your-website.com",
    reference: "ORDER_456",
    returnUrl: "https://your-website.com/return",
    webhookUrl: "https://your-website.com/webhook",
  },
  // 样式配置
  style: {
    width: "500px",
    height: "700px",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  },
  // 弹窗配置
  modal: {
    closableByOverlay: true,
    overlayColor: "rgba(0, 0, 0, 0.6)",
    loading: {
      show: true,
      color: "#007bff",
    },
  },
  callbacks: {
    onSuccess: (data) => {
      console.log("支付成功:", data);
      // 处理支付成功逻辑
    },
    onError: (error) => {
      console.error("支付失败:", error);
      // 处理支付失败逻辑
    },
    onClose: () => {
      console.log("收银台关闭");
    },
  },
});

// 打开弹窗
await checkout.openModal();

// 或嵌入到容器
await checkout.embed("#container");

// 更新配置
await checkout.updateOptions({
  orderInfo: {
    amount: {
      currency: "EUR",
      value: "200",
    },
  },
});

// 发送自定义消息
checkout.postMessage({
  type: "CUSTOM_MESSAGE",
  data: { key: "value" },
});
```

## API 参考

### CheckoutOptions

| 参数                 | 类型   | 必填 | 描述                        |
| -------------------- | ------ | ---- | --------------------------- |
| appId                | string | 是   | 应用 ID                     |
| merchantId           | string | 是   | 商户 ID                     |
| merchantRsaPublicKey | string | 是   | 商户 RSA 公钥               |
| env                  | string | 否   | 运行环境： 'test' \| 'prod' |
| orderInfo            | object | 是   | 订单信息                    |
| callbacks            | object | 否   | 回调函数配置                |
| style                | object | 否   | 样式配置                    |
| modal                | object | 否   | 弹窗配置                    |
| dynamicAmount        | boolean | 否  | 金额是否可能在收银台加载后变化，默认 false，仅 createElements 生效。开启后拉起 Apple Pay / Google Pay 面板时会重新请求订单接口获取最新金额；商户需在改动金额后先更新订单 |

#### orderInfo 订单信息

#### callbacks 回调函数

| 回调函数       | 参数类型 | 描述                       |
| -------------- | -------- | -------------------------- |
| onSuccess      | any      | 支付成功回调               |
| onError        | any      | 支付失败回调               |
| onClose        | -        | 收银台关闭回调             |
| onHeightChange | number   | 高度变化回调（仅嵌入模式） |

#### style 样式配置

| 参数         | 类型   | 描述     |
| ------------ | ------ | -------- |
| width        | string | 宽度     |
| height       | string | 高度     |
| minHeight    | string | 最小高度 |
| maxHeight    | string | 最大高度 |
| minWidth     | string | 最小宽度 |
| maxWidth     | string | 最大宽度 |
| boxShadow    | string | 阴影     |
| borderRadius | string | 圆角     |

#### modal 弹窗配置

| 参数              | 类型    | 描述                 |
| ----------------- | ------- | -------------------- |
| closableByOverlay | boolean | 点击遮罩层是否可关闭 |
| overlayColor      | string  | 遮罩层颜色           |
| loading           | object  | 加载动画配置         |

#### loading 加载动画配置

| 参数  | 类型    | 描述             |
| ----- | ------- | ---------------- |
| show  | boolean | 是否显示加载动画 |
| color | string  | 加载动画颜色     |

### CheckoutInstance 方法

| 方法                   | 参数                           | 返回值                          | 描述                   |
| ---------------------- | ------------------------------ | ------------------------------- | ---------------------- |
| openModal()            | -                              | Promise&lt;CheckoutInstance&gt; | 以弹窗模式打开收银台   |
| embed(container)       | HTMLElement \| string          | Promise&lt;CheckoutInstance&gt; | 将收银台嵌入到指定容器 |
| close()                | -                              | void                            | 关闭收银台             |
| updateOptions(options) | Partial&lt;CheckoutOptions&gt; | Promise&lt;void&gt;             | 更新配置               |
| postMessage(message)   | any                            | void                            | 向收银台发送消息       |

## 事件处理

收银台会发送以下消息事件：

- `CHECKOUT_SUCCESS`: 支付成功
- `CHECKOUT_ERROR`: 支付失败
- `CHECKOUT_CLOSE`: 关闭收银台
- `CHECKOUT_HEIGHT_CHANGE`: 高度变化
- `CHECKOUT_REDIRECT`: 重定向跳转
- `REQUEST_HEIGHT_UPDATE`: 请求高度更新

## 环境配置

SDK 支持二种运行环境：

| 环境 | 描述     | 收银台地址                                |
| ---- | -------- | ----------------------------------------- |
| test | 测试环境 | https://checkout-v2.futurepay-develop.com |
| prod | 生产环境 | https://checkout-v2.futurepay.global      |

## 安全机制

- **RSA + AES 双重加密**: 订单信息使用 AES 加密，AES 密钥使用 RSA 公钥加密
- **消息来源验证**: 严格验证 postMessage 的来源域名
- **HTTPS 通信**: 所有网络请求均使用 HTTPS 协议
- **CSP 兼容**: 支持内容安全策略（Content Security Policy）

## 故障排除

### 高度自适应不工作

1. 确认使用的是嵌入模式（`embed` 方法）
2. 检查收银台应用是否支持高度自适应
3. 确认浏览器支持 `ResizeObserver` API

### 加载失败

1. 检查 `appId` `merchantRsaPublicKey` 和 `merchantId` 是否正确
2. 确认网络连接正常
3. 验证订单信息格式是否正确

### 环境配置问题

1. 确认 `env` 参数设置正确
2. 检查对应环境的服务是否可用
3. 验证 API 密钥是否匹配环境

## 浏览器兼容性

- Chrome ≥ 60
- Firefox ≥ 60
- Safari ≥ 12
- Edge ≥ 79
- 移动端现代浏览器
