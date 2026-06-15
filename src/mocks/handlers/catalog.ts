import { http } from "msw";
import { fail, ok } from "../envelope";
import { db } from "../db";
import { daysAgo, nextId } from "../db/store";
import type { Product } from "@/features/products/types";
import type { Category } from "@/features/categories/types";

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const catalogHandlers = [
  // ---- Products ----
  http.get("/api/products", () => ok(db.products.all())),

  http.get("/api/products/:id", ({ params }) => {
    const product = db.products.find(String(params.id));
    return product ? ok(product) : fail(404, "Product not found");
  }),

  http.post("/api/products", async ({ request }) => {
    const body = (await request.json()) as Partial<Product>;
    const category = db.categories.find(body.categoryId ?? "");
    const product: Product = {
      id: nextId("prd"),
      categoryId: body.categoryId ?? "",
      categoryName: category?.name ?? "Uncategorized",
      sku: body.sku ?? `SKU-${Date.now().toString().slice(-6)}`,
      name: body.name ?? "Untitled product",
      description: body.description,
      price: Number(body.price ?? 0),
      stock: Number(body.stock ?? 0),
      images: body.images ?? [],
      isActive: body.isActive ?? true,
      createdAt: daysAgo(0),
      hasVariants: body.hasVariants ?? false,
      baseCurrency: body.baseCurrency ?? "MMK",
      optionTypes: body.optionTypes ?? [],
      variants:
        body.variants ?? [
          {
            id: `var_${Date.now()}`,
            productId: "",
            sku: body.sku ?? "SKU",
            optionValueIds: [],
            price: Number(body.price ?? 0),
            stock: Number(body.stock ?? 0),
            isActive: true,
            tiers: [],
          },
        ],
      attributes: body.attributes,
    };
    db.products.insert(product);
    return ok(product);
  }),

  http.patch("/api/products/:id", async ({ params, request }) => {
    const body = (await request.json()) as Partial<Product>;
    if (body.categoryId) {
      const category = db.categories.find(body.categoryId);
      if (category) body.categoryName = category.name;
    }
    const updated = db.products.update(String(params.id), body);
    return updated ? ok(updated) : fail(404, "Product not found");
  }),

  http.delete("/api/products/:id", ({ params }) => {
    const removed = db.products.remove(String(params.id));
    return removed ? ok(removed) : fail(404, "Product not found");
  }),

  // ---- Categories ----
  http.get("/api/categories", () => ok(db.categories.all())),

  http.post("/api/categories", async ({ request }) => {
    const body = (await request.json()) as Partial<Category>;
    const category: Category = {
      id: nextId("cat"),
      parentId: body.parentId ?? null,
      name: body.name ?? "New category",
      slug: body.slug ?? slugify(body.name ?? "new-category"),
      description: body.description,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? db.categories.all().length + 1,
      productCount: 0,
    };
    db.categories.insert(category);
    return ok(category);
  }),

  http.patch("/api/categories/:id", async ({ params, request }) => {
    const body = (await request.json()) as Partial<Category>;
    const updated = db.categories.update(String(params.id), body);
    return updated ? ok(updated) : fail(404, "Category not found");
  }),

  http.delete("/api/categories/:id", ({ params }) => {
    const id = String(params.id);
    if (db.products.all().some((p) => p.categoryId === id)) {
      return fail(409, "Category has products and cannot be deleted");
    }
    const removed = db.categories.remove(id);
    return removed ? ok(removed) : fail(404, "Category not found");
  }),
];
