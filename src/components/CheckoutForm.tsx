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
  env: "dev",
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
      firstName: "ming",
      lastName: "xing",
    },
    productDetail: "购买产品详情/订单描述",
    countryCode: "HK",
    origin: "fffmall.com",
    reference: `24092905000017-${Date.now()}`,
    returnUrl: "http://localhost:5173",
    webhookUrl: "http://localhost:5173/webhook",
  },
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
      Object.prototype.hasOwnProperty.call(form.orderInfo?.paymentMethod, newKey)
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
              handleChange("env", e.target.value as "dev" | "prod")
            }
          >
            <option value="dev">dev</option>
            <option value="prod">prod</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span>App ID</span>
          <input
            className="border rounded px-2 py-1"
            value={form.appId}
            onChange={(e) => handleChange("appId", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span>Merchant ID</span>
          <input
            className="border rounded px-2 py-1"
            value={form.merchantId}
            onChange={(e) => handleChange("merchantId", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 md:col-span-2">
          <span>Merchant RSA Public Key</span>
          <textarea
            className="border rounded px-2 py-1 h-24"
            value={form.merchantRsaPublicKey}
            onChange={(e) =>
              handleChange("merchantRsaPublicKey", e.target.value)
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

          <label className="flex flex-col gap-1">
            <span>Reference</span>
            <input
              className="border rounded px-2 py-1"
              value={form.orderInfo.reference}
              onChange={(e) => updateOrderInfo({ reference: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span>Return URL</span>
            <input
              className="border rounded px-2 py-1"
              value={form.orderInfo.returnUrl}
              onChange={(e) => updateOrderInfo({ returnUrl: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span>Webhook URL</span>
            <input
              className="border rounded px-2 py-1"
              value={form.orderInfo.webhookUrl}
              onChange={(e) => updateOrderInfo({ webhookUrl: e.target.value })}
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
          onClick={() => openCheckoutModal(form)}
        >
          打开弹窗 Open Modal
        </button>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={async () => {
            if (!containerRef.current) return;
            embedRef.current = await embedCheckout(containerRef.current, {
              ...form,
              callbacks: {
                onSuccess() {
                  window.location.href = "https://www.baidu.com";
                },
              },
            });
          }}
        >
          嵌入收银台 Embed Checkout
        </button>
      </div>

      {/* 嵌入容器 */}
      <div ref={containerRef} className="w-[420px]" />
    </div>
  );
};
