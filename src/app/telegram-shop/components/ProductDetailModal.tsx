"use client";
/* eslint-disable @next/next/no-img-element */

import { mdToHtml } from "@/lib/markdown";
import { Product, ProductVariant, CartItem } from "../types";
import {
  hasVariantChoice,
  matchVariant,
  lineUnit,
  variantOptions,
  valueAvailable,
  variantLabelOf,
  lineKey,
} from "../utils";

interface ProductDetailModalProps {
  detailProduct: Product | null;
  setDetailProduct: (p: Product | null) => void;
  variantPick: Record<string, string>;
  setVariantPick: (picks: Record<string, string>) => void;
  detailQty: number;
  setDetailQty: (qty: number | ((q: number) => number)) => void;
  cart: CartItem[];
  setCartLineQty: (
    product: Product,
    variant: ProductVariant | undefined,
    label: string | undefined,
    qty: number,
  ) => void;
  t: (key: string) => string;
  cartQtyOf: (key: string) => number;
}

export default function ProductDetailModal({
  detailProduct,
  setDetailProduct,
  variantPick,
  setVariantPick,
  detailQty,
  setDetailQty,
  cart,
  setCartLineQty,
  t,
  cartQtyOf,
}: ProductDetailModalProps) {
  if (!detailProduct) return null;

  const p = detailProduct;
  const opts = variantOptions(p);
  const hasVar = hasVariantChoice(p);
  const matched = matchVariant(p, variantPick);
  const imgs = (p.images ?? []).filter(Boolean);
  const price = matched?.price ?? p.price;
  const stock = matched?.stock ?? p.stock;

  // Tier-adjusted unit price for the chosen quantity.
  const priceInfo = lineUnit({
    ...p,
    quantity: detailQty,
    variantId: matched?.id,
    price,
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <span className="modal-title">{p.name}</span>
          <button className="close-btn" onClick={() => setDetailProduct(null)}>
            ✕
          </button>
        </div>

        {imgs.length > 0 ? (
          <div className="img-slider">
            {imgs.map((src, i) => (
              <img key={src} src={src} alt={`${p.name} ${i + 1}`} />
            ))}
          </div>
        ) : (
          <div className="prod-image-placeholder" style={{ height: 220 }}>
            🛍️
          </div>
        )}

        <div className="prod-price" style={{ margin: "12px 0 4px" }}>
          {hasVar && !matched ? (
            `${t("from")} ${p.price.toLocaleString()} Ks`
          ) : priceInfo.discounted ? (
            <>
              <span style={{ textDecoration: "line-through", opacity: 0.6 }}>
                {priceInfo.base.toLocaleString()}
              </span>{" "}
              {priceInfo.unit.toLocaleString()} Ks
            </>
          ) : (
            `${priceInfo.unit.toLocaleString()} Ks`
          )}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
          {t("inStock")}: {stock}
        </div>
        {p.description && (
          <div
            style={{
              fontSize: 14,
              color: "var(--text-muted)",
              marginBottom: 12,
              lineHeight: 1.5,
            }}
            dangerouslySetInnerHTML={{ __html: mdToHtml(p.description) }}
          />
        )}

        {opts.map((opt, oi) => (
          <div key={opt.id} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>
              {opt.name}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {opt.choices.map((c) => {
                const ok = valueAvailable(p, opts, opt, c.tok, variantPick);
                return (
                  <button
                    key={c.tok}
                    disabled={!ok}
                    className={`variant-chip ${variantPick[opt.id] === c.tok ? "active" : ""}`}
                    onClick={() => {
                      const next = { ...variantPick, [opt.id]: c.tok };
                      for (let j = oi + 1; j < opts.length; j++) delete next[opts[j].id];
                      for (let j = oi + 1; j < opts.length; j++) {
                        const o = opts[j];
                        const first = o.choices.find((ch) =>
                          valueAvailable(p, opts, o, ch.tok, next),
                        );
                        if (first) next[o.id] = first.tok;
                      }
                      setVariantPick(next);
                      // Reflect the chosen variant's existing cart qty.
                      const m = matchVariant(p, next);
                      setDetailQty(m ? cartQtyOf(m.id) : 1);
                    }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "8px 0 14px",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Qty</span>
          <div className="cart-qty-ctrl">
            <button
              className="qty-btn"
              onClick={() => setDetailQty((q) => Math.max(1, q - 1))}
            >
              -
            </button>
            <span>{detailQty}</span>
            <button className="qty-btn" onClick={() => setDetailQty((q) => q + 1)}>
              +
            </button>
          </div>
        </div>

        <button
          className="btn-submit"
          disabled={hasVar && !matched}
          onClick={() => {
            if (hasVar) {
              if (!matched) return;
              setCartLineQty(p, matched, variantLabelOf(p, variantPick), detailQty);
            } else {
              setCartLineQty(p, undefined, undefined, detailQty);
            }
            setDetailProduct(null);
          }}
        >
          {cart.some((i) => lineKey(i) === (matched?.id ?? p.id))
            ? t("updateCart")
            : t("addToCart")}
        </button>
      </div>
    </div>
  );
}
