"use client";
/* eslint-disable @next/next/no-img-element */

import { CartItem, Region, PaymentAccount } from "../types";
import { lineKey, lineUnit } from "../utils";

interface CartDrawerProps {
  showCart: boolean;
  setShowCart: (show: boolean) => void;
  cart: CartItem[];
  updateQuantity: (key: string, delta: number) => void;
  handleCheckout: (e: React.FormEvent) => void;
  phone: string;
  setPhone: (phone: string) => void;
  address: string;
  setAddress: (address: string) => void;
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  selectedCityId: string;
  setSelectedCityId: (id: string) => void;
  selectedTownshipId: string;
  setSelectedTownshipId: (id: string) => void;
  regions: Region[];
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  payMethodOptions: { value: string; label: string }[];
  paymentAccounts: PaymentAccount[];
  proofUrl: string;
  handleSlipUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  copied: boolean;
  copyNumber: (val: string) => void;
  openQrExternal: (id: string) => void;
  checkoutLoading: boolean;
  t: (key: string) => string;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export default function CartDrawer({
  showCart,
  setShowCart,
  cart,
  updateQuantity,
  handleCheckout,
  phone,
  setPhone,
  address,
  setAddress,
  selectedRegionId,
  setSelectedRegionId,
  selectedCityId,
  setSelectedCityId,
  selectedTownshipId,
  setSelectedTownshipId,
  regions,
  paymentMethod,
  setPaymentMethod,
  payMethodOptions,
  paymentAccounts,
  proofUrl,
  handleSlipUpload,
  copied,
  copyNumber,
  openQrExternal,
  checkoutLoading,
  t,
  subtotal,
  deliveryFee,
  total,
}: CartDrawerProps) {
  if (!showCart) return null;

  const selectedRegion = regions.find((r) => r.id === selectedRegionId);
  const selectedCity = selectedRegion?.cities.find((c) => c.id === selectedCityId);

  return (
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
                      {(() => {
                        const { base, unit, discounted } = lineUnit(item);
                        return discounted ? (
                          <>
                            <span style={{ textDecoration: "line-through", opacity: 0.6 }}>
                              {base.toLocaleString()}
                            </span>{" "}
                            <span style={{ color: "var(--theme-accent)", fontWeight: 600 }}>
                              {unit.toLocaleString()} Ks
                            </span>
                          </>
                        ) : (
                          `${unit.toLocaleString()} Ks`
                        );
                      })()}
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
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {payMethodOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {paymentMethod !== "COD" &&
                (() => {
                  const acc = paymentAccounts.find((a) => a.method === paymentMethod);
                  const number =
                    paymentMethod === "BANK_TRANSFER"
                      ? acc?.accountNumber || acc?.phone || ""
                      : acc?.phone || acc?.accountNumber || "";
                  return (
                    <div className="form-group">
                      <label>{t("transferTo")}</label>
                      {acc ? (
                        <div className="pay-account">
                          <div style={{ fontWeight: 600 }}>{acc.name}</div>
                          {acc.bankName && (
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                              {acc.bankName}
                            </div>
                          )}
                          {number && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                margin: "4px 0",
                              }}
                            >
                              <span style={{ fontWeight: 700, fontSize: 16 }}>{number}</span>
                              <button
                                type="button"
                                className="icon-toggle"
                                onClick={() => copyNumber(number)}
                              >
                                📋 {copied ? t("copied") : t("copy")}
                              </button>
                            </div>
                          )}
                          {acc.description && (
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                              {acc.description}
                            </div>
                          )}
                          {acc.qrImage && (
                            <>
                              <button
                                type="button"
                                onClick={() => openQrExternal(acc.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  cursor: "pointer",
                                  display: "block",
                                  width: "100%",
                                  maxWidth: 320,
                                  marginTop: 10,
                                }}
                              >
                                <img
                                  src={`/api/bot/payment-accounts/${acc.id}/qr`}
                                  alt="QR"
                                  style={{
                                    width: "100%",
                                    height: "auto",
                                    objectFit: "contain",
                                    display: "block",
                                    borderRadius: 12,
                                    background: "#fff",
                                    padding: 8,
                                    WebkitTouchCallout: "default",
                                    WebkitUserSelect: "auto",
                                    userSelect: "auto",
                                  }}
                                />
                              </button>
                              <button
                                type="button"
                                className="file-btn"
                                onClick={() => openQrExternal(acc.id)}
                                style={{ marginTop: 8 }}
                              >
                                ⬇ {t("saveQr")}
                              </button>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "var(--text-muted)",
                                  marginTop: 4,
                                }}
                              >
                                {t("qrSaveHint")}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                          {t("noPayAccount")}
                        </div>
                      )}

                      <label style={{ marginTop: 12 }}>{t("uploadSlip")}</label>
                      <label className="file-btn">
                        {proofUrl.startsWith("data:")
                          ? `✓ ${t("slipSelected")}`
                          : `📎 ${t("chooseImage")}`}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSlipUpload}
                          style={{ display: "none" }}
                        />
                      </label>
                      {proofUrl.startsWith("data:") && (
                        <img
                          src={proofUrl}
                          alt="slip"
                          style={{
                            width: 120,
                            marginTop: 8,
                            borderRadius: 8,
                            border: "1px solid var(--theme-border)",
                          }}
                        />
                      )}
                    </div>
                  );
                })()}

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
  );
}
