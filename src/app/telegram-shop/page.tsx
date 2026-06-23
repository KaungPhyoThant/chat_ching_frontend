"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: { name: string };
  images?: string[];
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

export default function TelegramShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("All");

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
            .map((item: { productId: string; name: string; price: number; quantity: number }) => {
              const prod = products.find((p) => p.id === item.productId);
              if (!prod) return null;
              return {
                ...prod,
                quantity: item.quantity,
              };
            })
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

  // Derived listings
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category.name)))];
  const filteredProducts =
    activeTab === "All" ? products : products.filter((p) => p.category.name === activeTab);

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
            quantity: i.quantity,
          })),
        }),
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to sync cart to backend", err);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [...prev, { ...product, quantity: 1 }];
      }
      syncCartToBackend(updated);
      return updated;
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
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
          items: cart.map((i) => ({ productId: i.id, quantity: i.quantity })),
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
          --theme-bg: #0b0f19;
          --theme-panel: rgba(255, 255, 255, 0.03);
          --theme-border: rgba(255, 255, 255, 0.06);
          --theme-accent: #00f2fe;
          --theme-accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          --text-color: #f8fafc;
          --text-muted: #94a3b8;
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
          color: var(--text-color);
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
          color: #0b0f19;
          font-size: 11px;
          font-weight: 700;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(0, 242, 254, 0.4);
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
          color: #0b0f19;
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
          background: linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%);
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
          color: #0b0f19;
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
          background: #0f172a;
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
          color: white;
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
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--theme-border);
          border-radius: 8px;
          padding: 10px;
          color: white;
          font-family: inherit;
          font-size: 14px;
        }

        .form-input option {
          background: #0f172a;
          color: white;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--theme-accent);
        }

        .btn-submit {
          background: var(--theme-accent-gradient);
          color: #0b0f19;
          font-weight: 700;
          border: none;
          border-radius: 8px;
          padding: 12px;
          width: 100%;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0 4px 15px rgba(0, 242, 254, 0.2);
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

      <div className="container">
        {orderSuccess ? (
          <div className="success-overlay">
            <div className="success-icon">🎉</div>
            <h2>Order Placed!</h2>
            <p style={{ color: "var(--theme-accent)", fontWeight: 700, fontSize: "18px" }}>
              #{orderSuccess}
            </p>
            <p style={{ color: "var(--text-muted)", marginTop: "10px" }}>
              We have notified the shop. This window will close shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="header">
              <div>
                <span className="logo">AI Shop</span>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Welcome, {fullName}
                </div>
                {/* ponytail: temporary diagnostic — remove once sync confirmed.
                    If you don't see this line, you're on a stale cached bundle. */}
                <div style={{ fontSize: "10px", color: "#fa8c16" }}>
                  dbg: initData={initData.length} · auth={initData || (telegramId && sig) ? "y" : "n"}
                </div>
              </div>
              <div className="cart-badge-btn" onClick={() => setShowCart(true)}>
                <span>🛒</span>
                {cart.length > 0 && (
                  <span className="badge">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </div>
            </div>

            {/* Category selection */}
            <div className="categories">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`category-tab ${activeTab === c ? "active" : ""}`}
                  onClick={() => setActiveTab(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>Loading catalog...</div>
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
                      <div className="prod-price">{p.price.toLocaleString()} Ks</div>
                    </div>
                    <button className="btn-add" onClick={() => addToCart(p)}>
                      + Add to Cart
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
                    <span className="modal-title">Shopping Cart</span>
                    <button className="close-btn" onClick={() => setShowCart(false)}>
                      ✕
                    </button>
                  </div>

                  {cart.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>Your cart is empty.</div>
                  ) : (
                    <>
                      <div className="cart-list">
                        {cart.map((item) => (
                          <div className="cart-row" key={item.id}>
                            <div>
                              <div style={{ fontWeight: 600 }}>{item.name}</div>
                              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                {item.price.toLocaleString()} Ks
                              </div>
                            </div>
                            <div className="cart-qty-ctrl">
                              <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>
                                -
                              </button>
                              <span>{item.quantity}</span>
                              <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Checkout details Form */}
                      <form onSubmit={handleCheckout}>
                        <h3 style={{ margin: "20px 0 10px 0" }}>Checkout Details</h3>

                        <div className="form-group">
                          <label>Contact Phone</label>
                          <input
                            type="tel"
                            className="form-input"
                            required
                            placeholder="e.g. 09123456789"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Region / State</label>
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
                            <option value="">Select Region</option>
                            {regions.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>City</label>
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
                            <option value="">Select City</option>
                            {selectedRegion?.cities.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Township</label>
                          <select
                            className="form-input"
                            required
                            disabled={!selectedCityId}
                            value={selectedTownshipId}
                            onChange={(e) => setSelectedTownshipId(e.target.value)}
                          >
                            <option value="">Select Township</option>
                            {selectedCity?.townships.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Detailed Shipping Address</label>
                          <textarea
                            className="form-input"
                            rows={2}
                            required
                            placeholder="Street, Building, Apartment No..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Payment Method</label>
                          <select
                            className="form-input"
                            required
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as "KBZPAY" | "WAVEPAY" | "COD")}
                          >
                            <option value="COD">Cash on Delivery (COD)</option>
                            <option value="KBZPAY">KBZPay Transfer</option>
                            <option value="WAVEPAY">WavePay Transfer</option>
                          </select>
                        </div>

                        {paymentMethod !== "COD" && (
                          <div className="form-group">
                            <label>Transfer Reference Number / Proof Link</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Reference / Transaction ID"
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
                            <span>Subtotal</span>
                            <span>{subtotal.toLocaleString()} Ks</span>
                          </div>
                          <div className="total-row">
                            <span>Delivery Fee</span>
                            <span>{deliveryFee.toLocaleString()} Ks</span>
                          </div>
                          <div className="total-row grand">
                            <span>Total</span>
                            <span>{total.toLocaleString()} Ks</span>
                          </div>
                        </div>

                        <button className="btn-submit" type="submit" disabled={checkoutLoading}>
                          {checkoutLoading ? "Placing Order..." : `Place Order • ${total.toLocaleString()} Ks`}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
