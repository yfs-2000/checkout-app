// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck

import {
  type CheckoutInstance,
  type CheckoutOptions,
  createElementsCheckout,
  embedCheckout,
  openCheckoutModal,
} from "@futurepay/checkout-sdk";
import {
  ChevronRight,
  Code,
  CreditCard,
  Globe,
  Layout,
  Link as LinkIcon,
  Lock,
  Plus,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Wallet,
  Zap,
} from "lucide-react";
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
    isexchange: false,
    productDetail: "Premium Subscription Plan",
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

// UI Components
const SectionHeader = ({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
    <Icon className="w-5 h-5 text-blue-600" />
    <h3 className="font-semibold text-gray-800">{title}</h3>
  </div>
);

const InputGroup = ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <label className={`flex flex-col gap-1.5 ${className}`}>
    <span className="text-sm font-medium text-gray-600">{label}</span>
    {children}
  </label>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`border border-gray-200 rounded-lg px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 bg-white ${
      props.className || ""
    }`}
  />
);

const StyledSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="relative">
    <select
      {...props}
      className={`w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 bg-white pr-8 ${
        props.className || ""
      }`}
    />
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
      <ChevronRight className="w-4 h-4 rotate-90" />
    </div>
  </div>
);

const Toggle = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean | undefined;
  onChange: (checked: boolean) => void;
}) => (
  <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group">
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
    </div>
    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
      {label}
    </span>
  </label>
);

export const CheckoutForm = () => {
  // 初始化时尝试从 sessionStorage 读取
  const [form, setForm] = useState<CheckoutOptions>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(LS_KEY);
        if (stored) {
          return JSON.parse(stored) as CheckoutOptions;
        }
      } catch {
        /* ignore JSON parse error */
      }
    }
    return defaultFormData();
  });
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [email, setEmail] = useState("");
  const [elementsSubmitting, setElementsSubmitting] = useState(false);
  const [demoMode, setDemoMode] = useState<"embed" | "elements" | null>(
    "embed"
  );

  const removePaymentMethodKey = (key: string) => {
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
      sessionStorage.setItem(LS_KEY, JSON.stringify(form));
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

  const updateCheckoutConfig = (
    updates: Partial<CheckoutOptions["checkoutConfig"]>
  ) => {
    setForm((prev) => ({
      ...prev,
      checkoutConfig: { ...prev?.checkoutConfig, ...updates },
    }));
  };
  const updateCssVariables = (
    updates: Partial<
      NonNullable<CheckoutOptions["checkoutConfig"]>["cssVariables"]
    >
  ) => {
    setForm((prev) => ({
      ...prev,
      checkoutConfig: {
        ...prev.checkoutConfig,
        cssVariables: {
          ...(prev.checkoutConfig?.cssVariables || {}),
          ...updates,
        },
      },
    }));
  };
  const embedRef = useRef<CheckoutInstance | null>(null);
  const elementsRef = useRef<CheckoutInstance | null>(null);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans text-gray-900">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Checkout Console
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                FuturePay Integration Demo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100">
              Env: {form.env?.toUpperCase()}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Configuration */}
          <div className="xl:col-span-5 space-y-6">
            {/* Basic Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <SectionHeader icon={Settings} title="基础配置 Environment" />
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Environment">
                  <StyledSelect
                    value={form.env}
                    onChange={(e) =>
                      handleChange("env", e.target.value as "test" | "prod")
                    }
                  >
                    <option value="test">Test Sandbox</option>
                    <option value="prod">Production</option>
                  </StyledSelect>
                </InputGroup>

                <InputGroup label="Mode">
                  <StyledSelect
                    value={form.mode}
                    onChange={(e) =>
                      handleChange(
                        "mode",
                        e.target.value as "payment" | "subscription"
                      )
                    }
                  >
                    <option value="payment">Single Payment</option>
                    <option value="subscription">Subscription</option>
                  </StyledSelect>
                </InputGroup>

                <InputGroup label="Theme" className="col-span-2">
                  <StyledSelect
                    value={form.checkoutConfig?.theme || ""}
                    onChange={(e) =>
                      updateCheckoutConfig({
                        theme: e.target.value as "light" | "dark" | "system",
                      })
                    }
                  >
                    <option value="">Default</option>
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                    <option value="system">System Preference</option>
                  </StyledSelect>
                </InputGroup>

                <InputGroup label="Session Token" className="col-span-2">
                  <StyledInput
                    placeholder="Optional session token"
                    value={form.sessionToken}
                    onChange={(e) =>
                      handleChange("sessionToken", e.target.value || undefined)
                    }
                  />
                </InputGroup>
              </div>
            </div>

            {/* Style Config */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <SectionHeader icon={Layout} title="样式配置 Styles" />
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Primary Color 主色">
                  <StyledInput
                    placeholder="#007bff"
                    value={
                      form.checkoutConfig?.cssVariables?.primaryColor || ""
                    }
                    onChange={(e) =>
                      updateCssVariables({
                        primaryColor: e.target.value || undefined,
                      })
                    }
                  />
                </InputGroup>

                <InputGroup label="Background 背景">
                  <StyledInput
                    placeholder="#ffffff"
                    value={form.checkoutConfig?.cssVariables?.background || ""}
                    onChange={(e) =>
                      updateCssVariables({
                        background: e.target.value || undefined,
                      })
                    }
                  />
                </InputGroup>

                <InputGroup label="Foreground 文本">
                  <StyledInput
                    placeholder="#0f172a"
                    value={form.checkoutConfig?.cssVariables?.foreground || ""}
                    onChange={(e) =>
                      updateCssVariables({
                        foreground: e.target.value || undefined,
                      })
                    }
                  />
                </InputGroup>

                <InputGroup label="Secondary Foreground 次文本">
                  <StyledInput
                    placeholder="#475569"
                    value={
                      form.checkoutConfig?.cssVariables?.secondaryForeground ||
                      ""
                    }
                    onChange={(e) =>
                      updateCssVariables({
                        secondaryForeground: e.target.value || undefined,
                      })
                    }
                  />
                </InputGroup>

                <InputGroup label="Card Background 卡片背景">
                  <StyledInput
                    placeholder="#f8fafc"
                    value={
                      form.checkoutConfig?.cssVariables?.cardBackground || ""
                    }
                    onChange={(e) =>
                      updateCssVariables({
                        cardBackground: e.target.value || undefined,
                      })
                    }
                  />
                </InputGroup>

                <InputGroup label="Secondary 次级色">
                  <StyledInput
                    placeholder="#94a3b8"
                    value={form.checkoutConfig?.cssVariables?.secondary || ""}
                    onChange={(e) =>
                      updateCssVariables({
                        secondary: e.target.value || undefined,
                      })
                    }
                  />
                </InputGroup>

                <InputGroup label="Border 边框色">
                  <StyledInput
                    placeholder="#e2e8f0"
                    value={form.checkoutConfig?.cssVariables?.border || ""}
                    onChange={(e) =>
                      updateCssVariables({
                        border: e.target.value || undefined,
                      })
                    }
                  />
                </InputGroup>

                <InputGroup label="侧边栏背景色">
                  <StyledInput
                    placeholder="#e2e8f0"
                    value={form.checkoutConfig?.cssVariables?.accent || ""}
                    onChange={(e) =>
                      updateCssVariables({
                        accent: e.target.value || undefined,
                      })
                    }
                  />
                </InputGroup>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <SectionHeader icon={ShoppingCart} title="订单详情 Order Info" />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Amount">
                    <StyledInput
                      type="number"
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
                  </InputGroup>
                  <InputGroup label="Currency">
                    <StyledInput
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
                  </InputGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Country">
                    <StyledInput
                      value={form.orderInfo.countryCode}
                      onChange={(e) =>
                        updateOrderInfo({ countryCode: e.target.value })
                      }
                    />
                  </InputGroup>
                  <InputGroup label="Origin">
                    <StyledInput
                      value={form.orderInfo.origin}
                      onChange={(e) =>
                        updateOrderInfo({ origin: e.target.value })
                      }
                    />
                  </InputGroup>
                </div>

                <InputGroup label="Product Detail">
                  <StyledInput
                    value={form.orderInfo.productDetail}
                    onChange={(e) =>
                      updateOrderInfo({ productDetail: e.target.value })
                    }
                  />
                </InputGroup>
              </div>
            </div>

            {/* URLs & Webhooks */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <SectionHeader icon={LinkIcon} title="链接配置 URLs" />
              <div className="space-y-4">
                <InputGroup label="Return URL">
                  <StyledInput
                    value={form.orderInfo.returnUrl}
                    onChange={(e) =>
                      updateOrderInfo({ returnUrl: e.target.value })
                    }
                  />
                </InputGroup>
                <InputGroup label="Webhook URL">
                  <StyledInput
                    value={form.orderInfo.webhookUrl}
                    onChange={(e) =>
                      updateOrderInfo({ webhookUrl: e.target.value })
                    }
                  />
                </InputGroup>
              </div>
            </div>

            {/* Toggles */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <SectionHeader icon={ShieldCheck} title="功能开关 Options" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Toggle
                  label="Direct Return"
                  checked={form.orderInfo.directReturn}
                  onChange={(checked) =>
                    updateOrderInfo({ directReturn: checked })
                  }
                />
                <Toggle
                  label="Is Exchange"
                  checked={form.orderInfo.isexchange}
                  onChange={(checked) =>
                    updateOrderInfo({ isexchange: checked })
                  }
                />
                <Toggle
                  label="Enable OneClick"
                  checked={form.orderInfo.enableOneClick}
                  onChange={(checked) =>
                    updateOrderInfo({ enableOneClick: checked })
                  }
                />
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <SectionHeader icon={Wallet} title="支付参数 Payment Params" />

              <div className="space-y-3 mb-4">
                {Object.entries(form.orderInfo.paymentMethod ?? {}).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100 group"
                    >
                      <div
                        className="w-1/3 text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1.5 rounded truncate"
                        title={key}
                      >
                        {key}
                      </div>
                      <input
                        className="flex-1 text-sm bg-transparent border-none outline-none focus:ring-0 text-gray-700 placeholder-gray-400"
                        value={value as string}
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
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        onClick={() => removePaymentMethodKey(key)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                )}
              </div>

              <div className="flex items-center gap-2 p-2 border border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors bg-gray-50/50">
                <input
                  className="w-1/3 border-none bg-transparent text-sm outline-none focus:ring-0 px-2"
                  placeholder="New Key"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                />
                <div className="w-px h-4 bg-gray-300"></div>
                <input
                  className="flex-1 border-none bg-transparent outline-none text-sm focus:ring-0 px-2"
                  placeholder="Value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
                <button
                  type="button"
                  className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={addPaymentMethodPair}
                  disabled={!newKey}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Preview & Actions */}
          <div className="xl:col-span-7 space-y-6 sticky top-6">
            {/* Action Bar */}
            <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-gray-100 p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Checkout Actions
                  </h2>
                  <div className="text-sm text-gray-500">
                    Current Mode:{" "}
                    <span className="font-semibold text-blue-600">
                      {demoMode === "embed"
                        ? "Embed"
                        : demoMode === "elements"
                        ? "Elements"
                        : "Modal"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <button
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-blue-50 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-200 text-blue-700 transition-all active:scale-[0.98]"
                    onClick={() => {
                      openCheckoutModal({
                        ...form,
                        orderInfo: {
                          ...form.orderInfo,
                          reference: `test-${Date.now()}`,
                        },
                      });
                      setDemoMode("modal");
                    }}
                  >
                    <Layout className="w-6 h-6" />
                    <span className="font-semibold">Open Modal</span>
                  </button>

                  <button
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
                      demoMode === "embed"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={async () => {
                      setDemoMode("embed");
                      if (embedRef.current) {
                        embedRef.current.close();
                      }
                      if (elementsRef.current) {
                        elementsRef.current.close();
                      }
                      // 小延时确保 DOM 渲染
                      setTimeout(async () => {
                        embedRef.current = await embedCheckout(
                          "#embed-checkout-container",
                          {
                            ...form,
                            orderInfo: {
                              ...form.orderInfo,
                              reference: `test-${Date.now()}`,
                            },
                          }
                        );
                      }, 100);
                    }}
                  >
                    <Code className="w-6 h-6" />
                    <span className="font-semibold">Embed Checkout</span>
                  </button>

                  <button
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
                      demoMode === "elements"
                        ? "border-purple-200 bg-purple-50 text-purple-700"
                        : "border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={async () => {
                      setDemoMode("elements");
                      if (embedRef.current) {
                        embedRef.current.close();
                      }
                      if (elementsRef.current) {
                        elementsRef.current.close();
                      }
                      // 小延时确保 DOM 渲染
                      setTimeout(async () => {
                        elementsRef.current = await createElementsCheckout(
                          "#elements-checkout-container",
                          {
                            ...form,
                            orderInfo: {
                              ...form.orderInfo,
                              reference: `test-${Date.now()}`,
                            },
                          }
                        );
                      }, 100);
                    }}
                  >
                    <CreditCard className="w-6 h-6" />
                    <span className="font-semibold">Elements UI</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 min-h-[600px] flex flex-col overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-md border border-gray-200 text-xs text-gray-500 shadow-sm">
                    <Lock className="w-3 h-3" />
                    secure-checkout.futurepay.global
                  </div>
                </div>
              </div>

              <div className="flex-1 p-8 bg-gray-50/30 relative">
                {demoMode === "embed" && (
                  <div className="max-w-[480px] mx-auto w-full animate-in fade-in zoom-in-95 duration-300">
                    <div className="text-center mb-8 space-y-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Secure Payment
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Complete your purchase securely
                      </p>
                      <div className="flex justify-center gap-4 mt-4">
                        <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          <ShieldCheck className="w-3 h-3" /> SSL Encrypted
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4  shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                      <div id="embed-checkout-container" className="w-full " />
                    </div>
                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        Powered by FuturePay
                      </div>
                    </div>
                  </div>
                )}

                {demoMode === "elements" && (
                  <div className="max-w-[480px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-6">
                      <div className="space-y-1 border-b border-gray-100 pb-4">
                        <h3 className="font-bold text-xl text-gray-900">
                          Payment Details
                        </h3>
                        <p className="text-sm text-gray-500">
                          Enter your payment information below
                        </p>
                      </div>

                      <div className="space-y-4">
                        <InputGroup label="Email Address">
                          <StyledInput
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </InputGroup>

                        {/* Elements Container */}
                        <div
                          id="elements-checkout-container"
                          className="rounded-lg"
                        ></div>

                        <button
                          className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                          disabled={
                            !email || !elementsRef.current || elementsSubmitting
                          }
                          onClick={async () => {
                            if (
                              !elementsRef.current ||
                              !email ||
                              elementsSubmitting
                            )
                              return;

                            setElementsSubmitting(true);
                            try {
                              const data =
                                await elementsRef.current.elementsSubmit({
                                  paymentMethod: {
                                    shopperEmail: email,
                                  },
                                });
                              console.log("提交成功:", data);
                            } catch (error) {
                              console.error("提交失败:", error);
                              alert("Payment Failed: " + error.message);
                            } finally {
                              setElementsSubmitting(false);
                            }
                          }}
                        >
                          {elementsSubmitting
                            ? "Processing..."
                            : `You will pay ${form.orderInfo.amount.currency} ${form.orderInfo.amount.value}`}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {demoMode === "modal" && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                      <Layout className="w-10 h-10 text-gray-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">
                        Modal is Active
                      </p>
                      <p className="text-sm">
                        The payment modal should be open on your screen.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Info */}
            <div className="flex justify-between text-xs text-gray-400 px-2">
              <span>SDK Version: 2.0.7</span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                FuturePay Global
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
