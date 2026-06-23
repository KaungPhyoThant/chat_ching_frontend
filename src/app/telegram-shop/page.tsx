"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

interface OptionValue {
  id: string;
  value: string;
}
interface OptionType {
  id: string;
  name: string;
  level: number;
  values: OptionValue[];
}
interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
  optionValueIds: string[];
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: { name: string };
  images?: string[];
  hasVariants?: boolean;
  variants?: ProductVariant[];
  optionTypes?: OptionType[];
}

interface Township {
  id: string;
  name: string;
  deliveryFee: number | null;
}

interface City {
  id: string;
  name: string;
  deliveryFee: number | null;
  townships: Township[];
}

interface Region {
  id: string;
  name: string;
  deliveryFee: number | null;
  cities: City[];
}

interface CartItem extends Product {
  quantity: number;
  variantId?: string;
  variantLabel?: string;
}

// A cart line is identified by its variant when one is chosen, else the product.
const lineKey = (i: { id: string; variantId?: string }) => i.variantId ?? i.id;

// Option types that actually have values, ordered by level (Color, then Size…).
const optionTypesOf = (p: Product) =>
  [...(p.optionTypes ?? [])]
    .filter((ot) => ot.values?.length)
    .sort((a, b) => a.level - b.level);

// True when the product needs a variant choice before adding to cart.
const hasVariantChoice = (p: Product) =>
  optionTypesOf(p).length > 0 && (p.variants?.length ?? 0) > 0;

// Resolve the variant matching one picked value per option type.
const matchVariant = (
  p: Product,
  picks: Record<string, string>,
): ProductVariant | null => {
  const ids = Object.values(picks);
  if (ids.length !== optionTypesOf(p).length) return null;
  return (
    (p.variants ?? []).find(
      (v) =>
        v.isActive &&
        v.optionValueIds.length === ids.length &&
        ids.every((id) => v.optionValueIds.includes(id)),
    ) ?? null
  );
};

interface OrderHistoryEntry {
  orderNo: string;
  status: string;
  total: number;
  createdAt: string;
  items: { name: string; quantity: number; total: number }[];
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  initData: string;
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

const urlParam = (key: string): string | null =>
  typeof window === "undefined"
    ? null
    : new URLSearchParams(window.location.search).get(key);

type Lang = "en" | "my";

// Minimal inline i18n — covers the Mini App chrome only (product/region names
// come from the backend). No library needed for one page.
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
  add: { en: "Add to Cart", my: "ခြင်းထဲ ထည့်မည်" },
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
  transferRef: {
    en: "Transfer Reference Number / Proof Link",
    my: "လွှဲငွေ Ref နံပါတ် / အထောက်အထား",
  },
  transferRefPlaceholder: {
    en: "Reference / Transaction ID",
    my: "Reference / Transaction ID",
  },
  subtotal: { en: "Subtotal", my: "စုစုပေါင်း (ပစ္စည်း)" },
  deliveryFee: { en: "Delivery Fee", my: "ပို့ဆောင်ခ" },
  total: { en: "Total", my: "စုစုပေါင်း" },
  placeOrder: { en: "Place Order", my: "မှာယူမည်" },
  placingOrder: { en: "Placing Order…", my: "မှာယူနေသည်…" },
  orderHistory: { en: "Order History", my: "မှာယူမှု မှတ်တမ်း" },
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
  // Variant picker modal: which product, and the chosen value per option type.
  const [variantModal, setVariantModal] = useState<Product | null>(null);
  const [variantPick, setVariantPick] = useState<Record<string, string>>({});

  const openVariantModal = (p: Product) => {
    setVariantPick({});
    setVariantModal(p);
  };

  /** Human label for a resolved variant, e.g. "Red / Large". */
  const variantLabelOf = (p: Product, picks: Record<string, string>) =>
    optionTypesOf(p)
      .map((ot) => ot.values.find((v) => v.id === picks[ot.id])?.value)
      .filter(Boolean)
      .join(" / ");

  // Theme + language (persisted), and catalog filters.
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

  // User and checkout details
  const [telegramId, setTelegramId] = useState<string>(() => urlParam("tgId") ?? "12345678");
  const [fullName, setFullName] = useState<string>(() => urlParam("name") || "Guest User");
  const [username, setUsername] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedTownshipId, setSelectedTownshipId] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"KBZPAY" | "WAVEPAY" | "COD">("COD");
  const [proofUrl, setProofUrl] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Initialize Telegram WebApp variables
  const [initData, setInitData] = useState<string>("");
  // Bot-signed fallback identity from the launch URL (?tgId&sig), used when
  // Telegram supplies no signed initData (ngrok / some desktop launches).
  const [sig] = useState<string>(() => urlParam("sig") ?? "");
  // Read identity from the Telegram WebApp SDK. We poll instead of relying on the
  // script's onLoad because Telegram's in-app WebView sometimes serves the SDK
  // from cache and never fires onLoad — leaving us stuck as "Guest User" with
  // empty initData so the cart never synced. Poll until the SDK appears (~3s).
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

  // Fetch products and regions
  useEffect(() => {
    async function loadData() {
      try {
        const prodRes = await fetch("/api/bot/products");
        const prodData = await prodRes.json();
        setProducts(prodData?.data ?? []);

        const regRes = await fetch("/api/bot/delivery-regions");
        const regData = await regRes.json();
        setRegions(regData?.data ?? []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to load catalog/delivery data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Fetch cart from backend when we have an identity (initData or signed tgId)
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
                // Trust the backend's stored price/name (already variant-aware).
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

  // Build the auth query (initData, or signed tgId fallback) shared by cart/orders.
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

  // Calculate township delivery fee
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

  // Derived listings — category tab + search + price range + sort.
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

  const selectedRegion = regions.find((r) => r.id === selectedRegionId);
  const selectedCity = selectedRegion?.cities.find((c) => c.id === selectedCityId);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
  ) => {
    const line: CartItem = {
      ...product,
      price: variant?.price ?? product.price,
      variantId: variant?.id,
      variantLabel: label || variant?.sku,
      quantity: 1,
    };
    const key = lineKey(line);
    setCart((prev) => {
      const existing = prev.find((item) => lineKey(item) === key);
      const updated = existing
        ? prev.map((item) =>
            lineKey(item) === key ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [...prev, line];
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
        setTimeout(() => {
          const tg = window.Telegram?.WebApp;
          if (tg) {
            tg.close();
          }
        }, 3000);
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        
        :root {
          --theme-bg: #091413;
          --theme-panel: rgba(176, 228, 204, 0.05);
          --theme-border: rgba(176, 228, 204, 0.14);
          --theme-accent: #b0e4cc;
          --theme-accent-gradient: linear-gradient(135deg, #408a71 0%, #b0e4cc 100%);
          --text-color: #eaf5ef;
          --text-muted: #7fae9d;
        }

        body {
          background-color: var(--theme-bg);
          color: var(--text-color);
          font-family: 'Outfit', sans-serif;
          margin: 0;
          padding: 0;
          min-height: 100vh;
        }

        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 16px;
          min-height: 100vh;
          background: var(--theme-bg);
          color: var(--text-color);
        }

        /* Light theme — overrides the design tokens for this subtree. The cyan
           accent is too pale on white, so darken it (and its gradient) for
           readable price text, the logo, and active tabs. */
        .container.light {
          --theme-bg: #ffffff;
          --theme-panel: #f1f5f9;
          --theme-border: #cbd5e1;
          --text-color: #0f172a;
          --text-muted: #475569;
          --theme-accent: #285a48;
          --theme-accent-gradient: linear-gradient(135deg, #408a71 0%, #285a48 100%);
        }

        /* Accent-filled controls carry dark text in dark mode; flip to white on
           the darker light-mode accent gradient so labels stay legible.
           (.btn-add is excluded — it has a light panel background.) */
        .container.light .btn-submit,
        .container.light .category-tab.active {
          color: #ffffff;
        }

        .toolbar {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 10px;
        }

        /* Search: pill shape with an inline magnifier icon. */
        .toolbar .form-input {
          margin: 0;
          border-radius: 999px;
          padding-left: 40px;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='11' cy='11' r='7'/><path d='M21 21l-4.3-4.3'/></svg>");
          background-repeat: no-repeat;
          background-position: left 14px center;
        }
        .toolbar .form-input:focus {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='11' cy='11' r='7'/><path d='M21 21l-4.3-4.3'/></svg>");
          background-repeat: no-repeat;
          background-position: left 14px center;
        }

        .icon-toggle {
          flex: 0 0 auto;
          background: var(--theme-panel);
          border: 1px solid var(--theme-border);
          color: var(--text-color);
          border-radius: 8px;
          padding: 6px 8px;
          font-size: 14px;
          line-height: 1;
          cursor: pointer;
          font-family: inherit;
        }

        .filter-row {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .filter-row .form-input:first-child {
          flex: 1.4;
        }
        .filter-row .form-input {
          flex: 1;
          min-width: 0;
        }

        .filter-row .form-input {
          margin: 0;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--theme-border);
        }

        .logo {
          font-size: 24px;
          font-weight: 700;
          background: var(--theme-accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cart-badge-btn {
          position: relative;
          background: var(--theme-panel);
          border: 1px solid var(--theme-border);
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .cart-badge-btn:active {
          transform: scale(0.9);
        }

        .badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--theme-accent-gradient);
          color: #091413;
          font-size: 11px;
          font-weight: 700;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(176, 228, 204, 0.35);
        }

        .categories {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          margin-bottom: 20px;
          padding-bottom: 4px;
          scrollbar-width: none;
        }

        .categories::-webkit-scrollbar {
          display: none;
        }

        .category-tab {
          background: var(--theme-panel);
          border: 1px solid var(--theme-border);
          color: var(--text-muted);
          padding: 8px 16px;
          border-radius: 20px;
          white-space: nowrap;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .category-tab.active {
          background: var(--theme-accent-gradient);
          color: #091413;
          border-color: transparent;
          font-weight: 600;
        }

        .product-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .product-card {
          background: var(--theme-panel);
          border: 1px solid var(--theme-border);
          border-radius: 16px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          backdrop-filter: blur(8px);
        }

        .prod-image-placeholder {
          background: linear-gradient(135deg, rgba(64, 138, 113, 0.12) 0%, rgba(176, 228, 204, 0.1) 100%);
          border-radius: 12px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          margin-bottom: 10px;
        }

        .prod-name {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .prod-price {
          color: var(--theme-accent);
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .btn-add {
          background: var(--theme-panel);
          border: 1px solid var(--theme-accent);
          color: var(--theme-accent);
          border-radius: 8px;
          padding: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .btn-add:active {
          background: var(--theme-accent);
          color: #091413;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(11, 15, 25, 0.85);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: flex-end;
        }

        .modal-content {
          background: var(--theme-bg);
          width: 100%;
          max-height: 85vh;
          border-radius: 24px 24px 0 0;
          padding: 20px;
          overflow-y: auto;
          box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.5);
          border-top: 1px solid var(--theme-border);
          color: var(--text-color);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 700;
        }

        .close-btn {
          background: var(--theme-panel);
          border: 1px solid var(--theme-border);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-color);
        }

        .cart-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .cart-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--theme-border);
        }

        .cart-qty-ctrl {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .qty-btn {
          background: var(--theme-panel);
          border: 1px solid var(--theme-border);
          color: var(--text-color);
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .total-block {
          background: var(--theme-panel);
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 20px;
        }

        .order-card {
          background: var(--theme-panel);
          border: 1px solid var(--theme-border);
          border-radius: 12px;
          padding: 12px;
        }

        .variant-chip {
          background: var(--theme-panel);
          border: 1px solid var(--theme-border);
          color: var(--text-color);
          border-radius: 999px;
          padding: 7px 16px;
          font-size: 14px;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.15s;
        }
        .variant-chip.active {
          background: var(--theme-accent-gradient);
          border-color: transparent;
          color: #091413;
          font-weight: 600;
        }

        .order-status {
          font-size: 11px;
          font-weight: 600;
          color: var(--theme-accent);
          background: var(--theme-bg);
          border: 1px solid var(--theme-border);
          border-radius: 999px;
          padding: 2px 8px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .total-row.grand {
          font-size: 18px;
          font-weight: 700;
          border-top: 1px dashed var(--theme-border);
          padding-top: 8px;
          margin-top: 8px;
          color: var(--theme-accent);
        }

        .form-group {
          margin-bottom: 14px;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .form-input {
          width: 100%;
          box-sizing: border-box;
          background: var(--theme-panel);
          border: 1px solid var(--theme-border);
          border-radius: 12px;
          padding: 11px 14px;
          color: var(--text-color);
          font-family: inherit;
          font-size: 14px;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }

        /* Replace the native OS dropdown chrome with a themed chevron. */
        select.form-input {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          cursor: pointer;
          padding-right: 36px;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1.5L6 6.5L11 1.5' stroke='%2394a3b8' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>");
          background-repeat: no-repeat;
          background-position: right 12px center;
        }

        .form-input option {
          background: var(--theme-bg);
          color: var(--text-color);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--theme-accent);
          background: var(--theme-bg);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-accent) 22%, transparent);
        }

        .btn-submit {
          background: var(--theme-accent-gradient);
          color: #091413;
          font-weight: 700;
          border: none;
          border-radius: 8px;
          padding: 12px;
          width: 100%;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0 4px 15px rgba(64, 138, 113, 0.35);
          margin-top: 10px;
        }

        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .success-overlay {
          text-align: center;
          padding: 40px 20px;
        }

        .success-icon {
          font-size: 64px;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>

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
          </div>
        ) : (
          <>
            <div className="header">
              <div>
                <span className="logo">AI Shop</span>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {t("welcome")}, {fullName}
                </div>
                {/* Deploy marker — bump on each push to confirm Vercel updated. */}
                <div style={{ fontSize: "10px", color: "#fa8c16" }}>build #4 · variants ✅</div>
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
                    <div>
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
                      onClick={() =>
                        hasVariantChoice(p) ? openVariantModal(p) : addToCart(p)
                      }
                    >
                      {t("addToCart")}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Shopping Cart Drawer / Modal */}
            {showCart && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <span className="modal-title">{t("shoppingCart")}</span>
                    <button className="close-btn" onClick={() => setShowCart(false)}>
                      ✕
                    </button>
                  </div>

                  {cart.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>{t("cartEmpty")}</div>
                  ) : (
                    <>
                      <div className="cart-list">
                        {cart.map((item) => (
                          <div className="cart-row" key={lineKey(item)}>
                            <div>
                              <div style={{ fontWeight: 600 }}>
                                {item.name}
                                {item.variantLabel ? ` (${item.variantLabel})` : ""}
                              </div>
                              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                {item.price.toLocaleString()} Ks
                              </div>
                            </div>
                            <div className="cart-qty-ctrl">
                              <button className="qty-btn" onClick={() => updateQuantity(lineKey(item), -1)}>
                                -
                              </button>
                              <span>{item.quantity}</span>
                              <button className="qty-btn" onClick={() => updateQuantity(lineKey(item), 1)}>
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Checkout details Form */}
                      <form onSubmit={handleCheckout}>
                        <h3 style={{ margin: "20px 0 10px 0" }}>{t("checkoutDetails")}</h3>

                        <div className="form-group">
                          <label>{t("contactPhone")}</label>
                          <input
                            type="tel"
                            className="form-input"
                            required
                            placeholder={t("phonePlaceholder")}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>{t("regionState")}</label>
                          <select
                            className="form-input"
                            required
                            value={selectedRegionId}
                            onChange={(e) => {
                              setSelectedRegionId(e.target.value);
                              setSelectedCityId("");
                              setSelectedTownshipId("");
                            }}
                          >
                            <option value="">{t("selectRegion")}</option>
                            {regions.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>{t("city")}</label>
                          <select
                            className="form-input"
                            required
                            disabled={!selectedRegionId}
                            value={selectedCityId}
                            onChange={(e) => {
                              setSelectedCityId(e.target.value);
                              setSelectedTownshipId("");
                            }}
                          >
                            <option value="">{t("selectCity")}</option>
                            {selectedRegion?.cities.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>{t("township")}</label>
                          <select
                            className="form-input"
                            required
                            disabled={!selectedCityId}
                            value={selectedTownshipId}
                            onChange={(e) => setSelectedTownshipId(e.target.value)}
                          >
                            <option value="">{t("selectTownship")}</option>
                            {selectedCity?.townships.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>{t("detailedAddress")}</label>
                          <textarea
                            className="form-input"
                            rows={2}
                            required
                            placeholder={t("addressPlaceholder")}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>{t("paymentMethod")}</label>
                          <select
                            className="form-input"
                            required
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as "KBZPAY" | "WAVEPAY" | "COD")}
                          >
                            <option value="COD">{t("cod")}</option>
                            <option value="KBZPAY">KBZPay Transfer</option>
                            <option value="WAVEPAY">WavePay Transfer</option>
                          </select>
                        </div>

                        {paymentMethod !== "COD" && (
                          <div className="form-group">
                            <label>{t("transferRef")}</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder={t("transferRefPlaceholder")}
                              required
                              value={proofUrl}
                              onChange={(e) => setProofUrl(e.target.value)}
                            />
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                              Transfer to KBZPay/WavePay: 09123456789 (AI Shop)
                            </div>
                          </div>
                        )}

                        <div className="total-block">
                          <div className="total-row">
                            <span>{t("subtotal")}</span>
                            <span>{subtotal.toLocaleString()} Ks</span>
                          </div>
                          <div className="total-row">
                            <span>{t("deliveryFee")}</span>
                            <span>{deliveryFee.toLocaleString()} Ks</span>
                          </div>
                          <div className="total-row grand">
                            <span>{t("total")}</span>
                            <span>{total.toLocaleString()} Ks</span>
                          </div>
                        </div>

                        <button className="btn-submit" type="submit" disabled={checkoutLoading}>
                          {checkoutLoading
                            ? t("placingOrder")
                            : `${t("placeOrder")} • ${total.toLocaleString()} Ks`}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Order History Modal */}
            {showOrders && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <span className="modal-title">{t("orderHistory")}</span>
                    <button className="close-btn" onClick={() => setShowOrders(false)}>
                      ✕
                    </button>
                  </div>

                  {ordersLoading ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>{t("loading")}</div>
                  ) : orders.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>{t("noOrders")}</div>
                  ) : (
                    <div className="cart-list">
                      {orders.map((o) => (
                        <div key={o.orderNo} className="order-card">
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 700 }}>#{o.orderNo}</span>
                            <span className="order-status">{o.status}</span>
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0" }}>
                            {new Date(o.createdAt).toLocaleDateString()}
                          </div>
                          {o.items.map((i, idx) => (
                            <div
                              key={idx}
                              style={{ fontSize: "13px", color: "var(--text-muted)" }}
                            >
                              • {i.name} ×{i.quantity} — {i.total.toLocaleString()} Ks
                            </div>
                          ))}
                          <div style={{ textAlign: "right", fontWeight: 700, marginTop: "6px" }}>
                            {t("total")}: {o.total.toLocaleString()} Ks
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Variant picker modal */}
            {variantModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <span className="modal-title">{variantModal.name}</span>
                    <button className="close-btn" onClick={() => setVariantModal(null)}>
                      ✕
                    </button>
                  </div>
                  {optionTypesOf(variantModal).map((ot) => (
                    <div key={ot.id} style={{ marginBottom: 14 }}>
                      <div
                        style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}
                      >
                        {ot.name}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {ot.values.map((val) => (
                          <button
                            key={val.id}
                            className={`variant-chip ${variantPick[ot.id] === val.id ? "active" : ""}`}
                            onClick={() =>
                              setVariantPick((prev) => ({ ...prev, [ot.id]: val.id }))
                            }
                          >
                            {val.value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="prod-price" style={{ margin: "12px 0" }}>
                    {(matchVariant(variantModal, variantPick)?.price ?? variantModal.price).toLocaleString()}{" "}
                    Ks
                  </div>
                  <button
                    className="btn-submit"
                    disabled={!matchVariant(variantModal, variantPick)}
                    onClick={() => {
                      const v = matchVariant(variantModal, variantPick);
                      if (!v) return;
                      addToCart(variantModal, v, variantLabelOf(variantModal, variantPick));
                      setVariantModal(null);
                    }}
                  >
                    {t("add")}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
