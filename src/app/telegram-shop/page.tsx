"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import Script from "next/script";
import { Product, ProductVariant, CartItem, Region, PaymentAccount, OrderHistoryEntry } from "./types";
import {
  lineKey,
  lineUnit,
  hasVariantChoice,
  matchVariant,
  variantOptions,
  valueAvailable,
  Lang,
} from "./utils";
import CartDrawer from "./components/CartDrawer";
import OrderHistoryDrawer from "./components/OrderHistoryDrawer";
import ProductDetailModal from "./components/ProductDetailModal";
import "./shop.css";

const urlParam = (key: string): string | null =>
  typeof window === "undefined"
    ? null
    : new URLSearchParams(window.location.search).get(key);

const STRINGS: Record<string, { en: string; my: string }> = {
  welcome: { en: "Welcome", my: "ကြိုဆိုပါတယ်" },
  all: { en: "All", my: "အားလုံး" },
  searchPlaceholder: { en: "Search products…", my: "ပစ္စည်း ရှာရန်…" },
  sortDefault: { en: "Sort: Default", my: "စဥ်ရန်: ပုံမှန်" },
  sortPriceAsc: { en: "Price: Low → High", my: "ဈေး: နိမ့် → မြင့်" },
  sortPriceDesc: { en: "Price: High → Low", my: "ဈေး: မြင့် → နိမ့်" },
  minPrice: { en: "Min", my: "အနိမ့်ဆုံး" },
  maxPrice: { en: "Max", my: "အမြင့်ဆုံး" },
  loading: { en: "Loading catalog…", my: "ပစ္စည်းများ ဖွင့်နေသည်…" },
  noProducts: { en: "No products found.", my: "ပစ္စည်း မတွေ့ပါ။" },
  addToCart: { en: "+ Add to Cart", my: "+ ခြင်းထဲထည့်" },
  from: { en: "from", my: "စ" },
  chooseOptions: { en: "Choose options", my: "ရွေးချယ်ပါ" },
  inStock: { en: "In stock", my: "လက်ကျန်" },
  add: { en: "Add to Cart", my: "ခြင်းထဲ ထည့်မည်" },
  updateCart: { en: "Update Cart", my: "ခြင်း ပြင်မည်" },
  shoppingCart: { en: "Shopping Cart", my: "ဈေးခြင်း" },
  cartEmpty: { en: "Your cart is empty.", my: "ဈေးခြင်း ဗလာဖြစ်နေသည်။" },
  checkoutDetails: { en: "Checkout Details", my: "မှာယူမှု အချက်အလက်" },
  contactPhone: { en: "Contact Phone", my: "ဆက်သွယ်ရန် ဖုန်း" },
  phonePlaceholder: { en: "e.g. 09123456789", my: "ဥပမာ 09123456789" },
  regionState: { en: "Region / State", my: "တိုင်း / ပြည်နယ်" },
  city: { en: "City", my: "မြို့" },
  township: { en: "Township", my: "မြို့နယ်" },
  selectRegion: { en: "Select Region", my: "တိုင်း ရွေးပါ" },
  selectCity: { en: "Select City", my: "မြို့ ရွေးပါ" },
  selectTownship: { en: "Select Township", my: "မြို့နယ် ရွေးပါ" },
  detailedAddress: { en: "Detailed Shipping Address", my: "အသေးစိတ် လိပ်စာ" },
  addressPlaceholder: {
    en: "Street, Building, Apartment No…",
    my: "လမ်း၊ အဆောက်အအုံ၊ အခန်းနံပါတ်…",
  },
  paymentMethod: { en: "Payment Method", my: "ငွေပေးချေမှု နည်းလမ်း" },
  cod: { en: "Cash on Delivery (COD)", my: "အိမ်ရောက်ငွေချေ (COD)" },
  transferTo: { en: "Transfer to", my: "ဤနေရာသို့ လွှဲပါ" },
  copy: { en: "Copy", my: "ကူး" },
  copied: { en: "Copied!", my: "ကူးပြီး!" },
  uploadSlip: { en: "Upload payment slip", my: "ငွေလွှဲ slip တင်ပါ" },
  chooseImage: { en: "Choose image", my: "ပုံ ရွေးပါ" },
  slipSelected: { en: "Slip selected", my: "Slip ရွေးပြီး" },
  saveQr: { en: "Save QR", my: "QR သိမ်းရန်" },
  qrSaveHint: {
    en: "📱 Tap the QR or Save button to open in browser, then long-press to save",
    my: "📱 QR သို့မဟုတ် ခလုတ်ကိုနှိပ်ပြီး Browser တွင်ဖွင့်ကာ Save to Photos လုပ်ပါ",
  },
  noPayAccount: {
    en: "No payment account configured.",
    my: "ငွေပေးချေမှု အကောင့် မသတ်မှတ်ရသေးပါ။",
  },
  subtotal: { en: "Subtotal", my: "စုစုပေါင်း (ပစ္စည်း)" },
  deliveryFee: { en: "Delivery Fee", my: "ပို့ဆောင်ခ" },
  total: { en: "Total", my: "စုစုပေါင်း" },
  placeOrder: { en: "Place Order", my: "မှာယူမည်" },
  placingOrder: { en: "Placing Order…", my: "မှာယူနေသည်…" },
  orderHistory: { en: "Order History", my: "မှာယူမှု မှတ်တမ်း" },
  continueShopping: { en: "Continue shopping", my: "ဆက်ဝယ်ရန်" },
  payment: { en: "Payment", my: "ငွေပေးချေမှု" },
  shipTo: { en: "Ship to", my: "ပို့ဆောင်ရန်" },
  noOrders: { en: "No orders yet.", my: "မှာယူမှု မရှိသေးပါ။" },
  orderPlaced: { en: "Order Placed!", my: "မှာယူပြီးပါပြီ!" },
  orderNotified: {
    en: "We have notified the shop. This window will close shortly.",
    my: "ဆိုင်သို့ အကြောင်းကြားပြီးပါပြီ။ ဒီ window ခဏနေ ပိတ်ပါမည်။",
  },
};

const persisted = (key: string, fallback: string): string =>
  (typeof window !== "undefined" && localStorage.getItem(key)) || fallback;

export default function TelegramShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState<OrderHistoryEntry[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [variantPick, setVariantPick] = useState<Record<string, string>>({});
  const [detailQty, setDetailQty] = useState(1);

  const cartQtyOf = (key: string) =>
    cart.find((i) => lineKey(i) === key)?.quantity ?? 1;

  const openDetail = (p: Product) => {
    if (hasVariantChoice(p)) {
      const opts = variantOptions(p);
      const picks: Record<string, string> = {};
      for (const o of opts) {
        const first = o.choices.find((ch) =>
          valueAvailable(p, opts, o, ch.tok, picks),
        );
        if (first) picks[o.id] = first.tok;
      }
      const matched = matchVariant(p, picks);
      setVariantPick(picks);
      setDetailQty(matched ? cartQtyOf(matched.id) : 1);
    } else {
      setVariantPick({});
      setDetailQty(cartQtyOf(p.id));
    }
    setDetailProduct(p);
  };

  const [theme, setTheme] = useState<"dark" | "light">(
    () => persisted("tg-theme", "dark") as "dark" | "light",
  );
  const [lang, setLang] = useState<Lang>(() => persisted("tg-lang", "en") as Lang);
  const t = (key: string) => STRINGS[key]?.[lang] ?? STRINGS[key]?.en ?? key;
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "asc" | "desc">("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("tg-theme", next);
  };
  const toggleLang = () => {
    const next: Lang = lang === "en" ? "my" : "en";
    setLang(next);
    localStorage.setItem("tg-lang", next);
  };

  const [telegramId, setTelegramId] = useState<string>(() => urlParam("tgId") ?? "12345678");
  const [fullName, setFullName] = useState<string>(() => urlParam("name") || "Guest User");
  const [username, setUsername] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedTownshipId, setSelectedTownshipId] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<string>("COD");
  const [proofUrl, setProofUrl] = useState("");
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [copied, setCopied] = useState(false);

  const copyNumber = (value: string) => {
    if (!value) return;
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const openQrExternal = (accId: string) => {
    const qrUrl = window.location.origin + `/api/bot/payment-accounts/${accId}/qr`;
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(qrUrl);
    } else {
      window.open(qrUrl, "_blank");
    }
  };

  const PAY_METHOD_LABELS: Record<string, string> = {
    KBZPAY: "KBZPay",
    WAVEPAY: "WavePay",
    BANK_TRANSFER: "Bank Transfer",
    AYAPAY: "AYA Pay",
    CBPAY: "CB Pay",
  };
  const payMethodOptions = [
    { value: "COD", label: t("cod") },
    ...Array.from(new Set(paymentAccounts.map((a) => a.method))).map((m) => ({
      value: m,
      label: PAY_METHOD_LABELS[m] ?? m,
    })),
  ];

  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setProofUrl(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const [initData, setInitData] = useState<string>("");
  const [sig] = useState<string>(() => urlParam("sig") ?? "");

  useEffect(() => {
    let tries = 0;
    const id = setInterval(() => {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        if (tg.initData) setInitData(tg.initData);
        const user = tg.initDataUnsafe?.user;
        if (user) {
          setTelegramId(String(user.id));
          setFullName(`${user.first_name} ${user.last_name || ""}`.trim());
          setUsername(user.username || "");
        }
        clearInterval(id);
      } else if (++tries > 30) {
        clearInterval(id);
      }
    }, 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const prodRes = await fetch("/api/bot/products");
        const prodData = await prodRes.json();
        setProducts(prodData?.data ?? []);

        const regRes = await fetch("/api/bot/delivery-regions");
        const regData = await regRes.json();
        setRegions(regData?.data ?? []);

        const payRes = await fetch("/api/bot/payment-accounts");
        const payData = await payRes.json();
        setPaymentAccounts(payData?.data ?? []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load catalog/delivery data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const hasAuth = initData || (telegramId && sig);
    if (!hasAuth || products.length === 0) return;

    async function loadCart() {
      try {
        const q = new URLSearchParams();
        if (initData) q.set("initData", initData);
        if (sig) {
          q.set("tgId", telegramId);
          q.set("sig", sig);
        }
        const res = await fetch(`/api/bot/cart?${q.toString()}`);
        const result = await res.json();
        if (result.success && result.data) {
          const mappedCart: CartItem[] = result.data
            .map(
              (item: {
                productId: string;
                name: string;
                price: number;
                quantity: number;
                variantId?: string;
                variantLabel?: string;
              }) => {
                const prod = products.find((p) => p.id === item.productId);
                if (!prod) return null;
                return {
                  ...prod,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  variantId: item.variantId,
                  variantLabel: item.variantLabel,
                };
              },
            )
            .filter((i: CartItem | null): i is CartItem => i !== null);
          setCart(mappedCart);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load cart from backend", err);
      }
    }
    loadCart();
  }, [initData, sig, telegramId, products]);

  const authQuery = () => {
    const q = new URLSearchParams();
    if (initData) q.set("initData", initData);
    if (sig) {
      q.set("tgId", telegramId);
      q.set("sig", sig);
    }
    return q.toString();
  };

  const openOrders = async () => {
    setShowOrders(true);
    setOrdersLoading(true);
    try {
      const res = await fetch(`/api/bot/orders?${authQuery()}`);
      const result = await res.json();
      setOrders(result?.data ?? []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to load orders", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  let deliveryFee = 0;
  if (selectedTownshipId) {
    const region = regions.find((r) => r.id === selectedRegionId);
    const city = region?.cities.find((c) => c.id === selectedCityId);
    const township = city?.townships.find((t) => t.id === selectedTownshipId);

    if (township && township.deliveryFee !== null) {
      deliveryFee = Number(township.deliveryFee);
    } else if (city && city.deliveryFee !== null) {
      deliveryFee = Number(city.deliveryFee);
    } else if (region && region.deliveryFee !== null) {
      deliveryFee = Number(region.deliveryFee);
    }
  }

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category.name)))];
  const min = Number(minPrice) || 0;
  const max = Number(maxPrice) || Infinity;
  const q = search.trim().toLowerCase();
  const filteredProducts = products
    .filter((p) => activeTab === "All" || p.category.name === activeTab)
    .filter((p) => !q || p.name.toLowerCase().includes(q))
    .filter((p) => p.price >= min && p.price <= max)
    .sort((a, b) =>
      sortBy === "asc" ? a.price - b.price : sortBy === "desc" ? b.price - a.price : 0,
    );

  const subtotal = cart.reduce((sum, item) => sum + lineUnit(item).unit * item.quantity, 0);
  const total = subtotal + deliveryFee;

  const syncCartToBackend = async (newCart: CartItem[]) => {
    if (!initData && !(telegramId && sig)) return;
    try {
      await fetch("/api/bot/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData,
          tgId: telegramId,
          sig,
          items: newCart.map((i) => ({
            productId: i.id,
            variantId: i.variantId,
            variantLabel: i.variantLabel,
            quantity: i.quantity,
          })),
        }),
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to sync cart to backend", err);
    }
  };

  const addToCart = (
    product: Product,
    variant?: ProductVariant,
    label?: string,
    qty = 1,
  ) => {
    const line: CartItem = {
      ...product,
      price: variant?.price ?? product.price,
      variantId: variant?.id,
      variantLabel: label || variant?.sku,
      quantity: qty,
    };
    const key = lineKey(line);
    setCart((prev) => {
      const existing = prev.find((item) => lineKey(item) === key);
      const updated = existing
        ? prev.map((item) =>
            lineKey(item) === key ? { ...item, quantity: item.quantity + qty } : item,
          )
        : [...prev, line];
      syncCartToBackend(updated);
      return updated;
    });
  };

  const setCartLineQty = (
    product: Product,
    variant: ProductVariant | undefined,
    label: string | undefined,
    qty: number,
  ) => {
    const lk = variant?.id ?? product.id;
    setCart((prev) => {
      const exists = prev.some((i) => lineKey(i) === lk);
      const updated = exists
        ? prev.map((i) => (lineKey(i) === lk ? { ...i, quantity: qty } : i))
        : [
            ...prev,
            {
              ...product,
              price: variant?.price ?? product.price,
              variantId: variant?.id,
              variantLabel: label || variant?.sku,
              quantity: qty,
            },
          ];
      syncCartToBackend(updated);
      return updated;
    });
  };

  const updateQuantity = (key: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((item) => (lineKey(item) === key ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0);
      syncCartToBackend(updated);
      return updated;
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!phone || !address || !selectedTownshipId) {
      alert("Please fill all details!");
      return;
    }

    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/bot/mini-app-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData,
          sig,
          telegramId,
          fullName,
          username,
          phone,
          address,
          townshipId: selectedTownshipId,
          paymentMethod,
          proofUrl: paymentMethod !== "COD" ? proofUrl || "uploaded_via_miniapp" : undefined,
          items: cart.map((i) => ({
            productId: i.id,
            variantId: i.variantId,
            variantLabel: i.variantLabel,
            quantity: i.quantity,
          })),
        }),
      });

      const responseData = await res.json();
      if (res.ok && responseData.success) {
        const orderInfo = responseData.data;
        setOrderSuccess(orderInfo?.orderNo);
        setCart([]);
        setShowCart(false);
        setProofUrl("");
      } else {
        alert("Checkout failed. Please try again.");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert("An error occurred during checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
      />

      <div className={`container ${theme === "light" ? "light" : ""}`}>
        {orderSuccess ? (
          <div className="success-overlay">
            <div className="success-icon">🎉</div>
            <h2>{t("orderPlaced")}</h2>
            <p style={{ color: "var(--theme-accent)", fontWeight: 700, fontSize: "18px" }}>
              #{orderSuccess}
            </p>
            <p style={{ color: "var(--text-muted)", marginTop: "10px" }}>
              {t("orderNotified")}
            </p>
            <button
              className="btn-submit"
              style={{ maxWidth: 280, margin: "20px auto 0" }}
              onClick={() => {
                setOrderSuccess(null);
                openOrders();
              }}
            >
              📦 {t("orderHistory")}
            </button>
            <button
              className="file-btn"
              style={{ margin: "10px auto 0", display: "block" }}
              onClick={() => setOrderSuccess(null)}
            >
              🛍️ {t("continueShopping")}
            </button>
          </div>
        ) : (
          <>
            <div className="header">
              <div>
                <span className="logo">AI Shop</span>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {t("welcome")}, {fullName}
                </div>
                <div style={{ fontSize: "10px", color: "#fa8c16" }}>build #21 · order-detail ✅</div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button className="icon-toggle" onClick={toggleLang} title="Language">
                  {lang === "en" ? "🇬🇧" : "🇲🇲"}
                </button>
                <button className="icon-toggle" onClick={toggleTheme} title="Theme">
                  {theme === "dark" ? "🌙" : "☀️"}
                </button>
                <button className="icon-toggle" onClick={openOrders} title={t("orderHistory")}>
                  📦
                </button>
                <div className="cart-badge-btn" onClick={() => setShowCart(true)}>
                  <span>🛒</span>
                  {cart.length > 0 && (
                    <span className="badge">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="toolbar">
              <input
                className="form-input"
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Sort + price range */}
            <div className="filter-row">
              <select
                className="form-input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "default" | "asc" | "desc")}
              >
                <option value="default">{t("sortDefault")}</option>
                <option value="asc">{t("sortPriceAsc")}</option>
                <option value="desc">{t("sortPriceDesc")}</option>
              </select>
              <input
                className="form-input"
                type="number"
                inputMode="numeric"
                placeholder={t("minPrice")}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input
                className="form-input"
                type="number"
                inputMode="numeric"
                placeholder={t("maxPrice")}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            {/* Category selection */}
            <div className="categories">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`category-tab ${activeTab === c ? "active" : ""}`}
                  onClick={() => setActiveTab(c)}
                >
                  {c === "All" ? t("all") : c}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>{t("loading")}</div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                {t("noProducts")}
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map((p) => (
                  <div className="product-card" key={p.id}>
                    <div onClick={() => openDetail(p)} style={{ cursor: "pointer" }}>
                      {p.images && p.images.length > 0 && p.images[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          style={{
                            width: "100%",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "12px",
                            marginBottom: "10px",
                          }}
                        />
                      ) : (
                        <div className="prod-image-placeholder">🛍️</div>
                      )}
                      <h4 className="prod-name">{p.name}</h4>
                      <div className="prod-price">
                        {hasVariantChoice(p) ? `${t("from")} ` : ""}
                        {p.price.toLocaleString()} Ks
                      </div>
                    </div>
                    <button
                      className="btn-add"
                      onClick={() => (hasVariantChoice(p) ? openDetail(p) : addToCart(p))}
                    >
                      {t("addToCart")}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Shopping Cart Drawer / Modal */}
            <CartDrawer
              showCart={showCart}
              setShowCart={setShowCart}
              cart={cart}
              updateQuantity={updateQuantity}
              handleCheckout={handleCheckout}
              phone={phone}
              setPhone={setPhone}
              address={address}
              setAddress={setAddress}
              selectedRegionId={selectedRegionId}
              setSelectedRegionId={setSelectedRegionId}
              selectedCityId={selectedCityId}
              setSelectedCityId={setSelectedCityId}
              selectedTownshipId={selectedTownshipId}
              setSelectedTownshipId={setSelectedTownshipId}
              regions={regions}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              payMethodOptions={payMethodOptions}
              paymentAccounts={paymentAccounts}
              proofUrl={proofUrl}
              handleSlipUpload={handleSlipUpload}
              copied={copied}
              copyNumber={copyNumber}
              openQrExternal={openQrExternal}
              checkoutLoading={checkoutLoading}
              t={t}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              total={total}
            />

            {/* Order History Modal */}
            <OrderHistoryDrawer
              showOrders={showOrders}
              setShowOrders={setShowOrders}
              ordersLoading={ordersLoading}
              orders={orders}
              t={t}
            />

            {/* Product detail — slider, description, stock, variant picker */}
            <ProductDetailModal
              detailProduct={detailProduct}
              setDetailProduct={setDetailProduct}
              variantPick={variantPick}
              setVariantPick={setVariantPick}
              detailQty={detailQty}
              setDetailQty={setDetailQty}
              cart={cart}
              setCartLineQty={setCartLineQty}
              t={t}
              cartQtyOf={cartQtyOf}
            />
          </>
        )}
      </div>
    </>
  );
}
