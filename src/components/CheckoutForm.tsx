// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck

import {
  type CheckoutInstance,
  type CheckoutOptions,
  embedCheckout,
  openCheckoutModal,
} from "@futurepay/checkout-sdk";
import { useEffect, useRef, useState } from "react";
// LocalStorage key
const LS_KEY = "fp-checkout-form";

// 默认表单数据
const defaultFormData = (): CheckoutOptions => ({
  env: "test",
  appId: "2",
  merchantId: "1",
  merchantRsaPublicKey:
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiYzBouEzCmT7NjBJwIfsN3sCZrnDBzUHhINyhT4LhgBV+NrFiN8jkuAUCdqLVqpqQKqNpdN6ju5CuHSpXwcl3ZMztbZcw8BJWoOW+gIuuSodBQiKQ/DEo6Yh3EYbgIvKX4+i5XxoRrwS84yDP+XMNwD/SPMwjTmaBhSZ4goLNRZzupiGxsfoiC/5OwOVmeRiBDsAbPrKw92fO4F7OwrbFazaAshbL5BcZP0BfkSeRnrFdKOVhZA3EAOFL58owkBtt8r1H2MgbhQ+1RCe6gYaGbQcFWzEvsVWEAWJYxJuRYBO50NKtm7Eya6MmeXwm0+L/FdITb9ehD3TS6cXkURv9wIDAQAB",
  orderInfo: {
    amount: {
      currency: "USD",
      value: 100,
    },
    paymentMethod: {
      type: "intercards",
    },
    isexchange: false,
    productDetail: "购买产品详情/订单描述",
    countryCode: "HK",
    origin: "fffmall.com",
    returnUrl: "https://futurepay.global/",
    webhookUrl: "https://futurepay.global/webhook",
    enableOneClick: false,
    shopperReference: "testuser@qq.com",
  },
  mode: "payment",
  style: {
    maxWidth: "100%",
  },
});

export const CheckoutForm = () => {
  // 初始化时尝试从 localStorage 读取
  const [form, setForm] = useState<CheckoutOptions>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LS_KEY);
        if (stored) {
          return JSON.parse(stored) as CheckoutOptions;
        }
      } catch {
        /* ignore JSON parse error */
      }
    }
    return defaultFormData();
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const removePaymentMethodKey = (key: string) => {
    // 删除指定 key

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [key]: _, ...rest } = form.orderInfo?.paymentMethod ?? {};
    updateOrderInfo({ paymentMethod: rest });
  };

  const addPaymentMethodPair = () => {
    if (!newKey) return;
    if (
      Object.prototype.hasOwnProperty.call(
        form.orderInfo?.paymentMethod,
        newKey
      )
    ) {
      alert("该 Key 已存在");
      return;
    }
    updateOrderInfo({
      paymentMethod: {
        ...form.orderInfo?.paymentMethod,
        [newKey]: newValue,
      },
    });
    setNewKey("");
    setNewValue("");
  };

  // 持久化到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(form));
    } catch {
      /* ignore quota errors */
    }
  }, [form]);

  // 通用字段更新
  const handleChange = <K extends keyof CheckoutOptions>(
    key: K,
    value: CheckoutOptions[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // 嵌套字段更新工具
  const updateOrderInfo = (updates: Partial<CheckoutOptions["orderInfo"]>) => {
    setForm((prev) => ({
      ...prev,
      orderInfo: { ...prev?.orderInfo, ...updates },
    }));
  };
  const embedRef = useRef<CheckoutInstance | null>(null);

  return (
    <div className="space-y-6">
      {/* 基础配置 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span>运行环境 env</span>
          <select
            className="border rounded px-2 py-1"
            value={form.env}
            onChange={(e) =>
              handleChange("env", e.target.value as "test" | "prod")
            }
          >
            <option value="test">test</option>
            <option value="prod">prod</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span>模式 mode</span>
          <select
            className="border rounded px-2 py-1"
            value={form.mode}
            onChange={(e) =>
              handleChange("mode", e.target.value as "payment" | "subscription")
            }
          >
            <option value="payment">payment</option>
            <option value="subscription">subscription</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span>Session Token</span>
          <input
            className="border rounded px-2 py-1"
            value={form.sessionToken}
            onChange={(e) =>
              handleChange("sessionToken", e.target.value || undefined)
            }
          />
        </label>

        <label className="flex flex-col gap-1">
          <span>Theme</span>
          <select
            className="border rounded px-2 py-1"
            value={form.theme}
            onChange={(e) =>
              handleChange(
                "theme",
                e.target.value as "light" | "dark" | "system"
              )
            }
          >
            <option value="light">light</option>
            <option value="dark">dark</option>
            <option value="system">system</option>
          </select>
        </label>
      </div>

      {/* 订单信息 */}
      <fieldset className="border rounded p-4 space-y-4">
        <legend className="px-2">订单信息 orderInfo</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1">
            <span>金额 currency</span>
            <input
              className="border rounded px-2 py-1"
              value={form.orderInfo.amount.currency}
              onChange={(e) =>
                updateOrderInfo({
                  amount: {
                    ...form.orderInfo.amount,
                    currency: e.target.value,
                  },
                })
              }
            />
          </label>

          <label className="flex flex-col gap-1">
            <span>金额 value</span>
            <input
              type="number"
              className="border rounded px-2 py-1"
              value={form.orderInfo.amount.value}
              onChange={(e) =>
                updateOrderInfo({
                  amount: {
                    ...form.orderInfo.amount,
                    value: Number(e.target.value),
                  },
                })
              }
            />
          </label>

          <label className="flex flex-col gap-1">
            <span>国家 countryCode</span>
            <input
              className="border rounded px-2 py-1"
              value={form.orderInfo.countryCode}
              onChange={(e) => updateOrderInfo({ countryCode: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span>产品详情 productDetail</span>
            <input
              className="border rounded px-2 py-1"
              value={form.orderInfo.productDetail}
              onChange={(e) =>
                updateOrderInfo({ productDetail: e.target.value })
              }
            />
          </label>

          <label className="flex flex-col gap-1">
            <span>Origin</span>
            <input
              className="border rounded px-2 py-1"
              value={form.orderInfo.origin}
              onChange={(e) => updateOrderInfo({ origin: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-3">
            <span>Return URL</span>
            <input
              className="border rounded px-2 py-1"
              value={form.orderInfo.returnUrl}
              onChange={(e) => updateOrderInfo({ returnUrl: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-3">
            <span>Webhook URL</span>
            <input
              className="border rounded px-2 py-1"
              value={form.orderInfo.webhookUrl}
              onChange={(e) => updateOrderInfo({ webhookUrl: e.target.value })}
            />
          </label>
          <label className="flex items-center  gap-1">
            <span>directReturn</span>
            <input
              type="checkbox"
              className="border rounded px-2 py-1 w-4"
              checked={form.orderInfo.directReturn}
              onChange={(e) =>
                updateOrderInfo({ directReturn: e.target.checked })
              }
            />
          </label>

          <label className="flex  items-center gap-1">
            <span>isexchange</span>
            <input
              type="checkbox"
              className="border rounded px-2 py-1 w-4"
              checked={form.orderInfo.isexchange}
              onChange={(e) =>
                updateOrderInfo({ isexchange: e.target.checked })
              }
            />
          </label>

          <label className="flex  items-center gap-1">
            <span>enableOneClick</span>
            <input
              type="checkbox"
              className="border rounded px-2 py-1 w-4"
              checked={form.orderInfo.enableOneClick}
              onChange={(e) =>
                updateOrderInfo({ enableOneClick: e.target.checked })
              }
            />
          </label>
        </div>

        {/* 支付人信息（动态键值对） */}
        <div className="space-y-2 pt-4">
          {Object.entries(form.orderInfo.paymentMethod ?? {}).map(
            ([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  className="border rounded px-2 py-1 w-40 bg-gray-50"
                  value={key}
                  readOnly
                />
                <input
                  className="border rounded px-2 py-1 flex-1"
                  value={value}
                  onChange={(e) =>
                    updateOrderInfo({
                      paymentMethod: {
                        ...form.orderInfo.paymentMethod,
                        [key]: e.target.value,
                      },
                    })
                  }
                />
                <button
                  type="button"
                  className="text-red-600 px-2"
                  onClick={() => removePaymentMethodKey(key)}
                >
                  删除
                </button>
              </div>
            )
          )}

          {/* 新增键值对 */}
          <div className="flex items-center gap-2">
            <input
              className="border rounded px-2 py-1 w-40"
              placeholder="Key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
            />
            <input
              className="border rounded px-2 py-1 flex-1"
              placeholder="Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />
            <button
              type="button"
              className="text-green-600 px-2"
              onClick={addPaymentMethodPair}
            >
              新增
            </button>
          </div>
        </div>
      </fieldset>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => {
            openCheckoutModal({
              ...form,
              orderInfo: {
                ...form.orderInfo,
                reference: `test-${Date.now()}`,
              },
            });
          }}
        >
          打开弹窗 Open Modal
        </button>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={async () => {
            if (!containerRef.current) return;

            embedRef.current = await embedCheckout(containerRef.current, {
              ...form,
              orderInfo: {
                ...form.orderInfo,
                reference: `test-${Date.now()}`,
              },
            });
          }}
        >
          嵌入收银台 Embed Checkout
        </button>
      </div>

      {/* 嵌入式收银台展示 */}
      <div className="mt-8 space-y-4">
        {/* 顶部文案 */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center justify-center gap-2">
            安全支付收银台
          </h3>
          <p className="text-sm text-gray-600">
            支持多种支付方式 · 银行级安全加密 · 全球支付网络
          </p>
          <div className="flex justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              SSL加密
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              PCI合规
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              实时验证
            </span>
          </div>
        </div>

        {/* 嵌入容器 */}
        <div className="relative">
          <div ref={containerRef} className="w-[420px] mx-auto" />
        </div>

        {/* 底部提示文案 */}
        <div className="text-center space-y-3 pt-4">
          <div className="flex justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1">🔒 数据加密传输</span>
            <span className="flex items-center gap-1">⚡ 秒级支付确认</span>
            <span className="flex items-center gap-1">🌍 支持全球支付</span>
          </div>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            我们采用业界领先的安全技术，确保您的支付信息安全。支持Visa、MasterCard、American
            Express等主流支付方式。
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            由 FuturePay 提供技术支持
          </div>
        </div>
      </div>
    </div>
  );
};
