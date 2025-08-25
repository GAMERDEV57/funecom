import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";

export const addProduct = mutation({
  args: {
    storeId: v.id("stores"),
    productName: v.string(),
    description: v.string(), 
    category: v.string(),
    price: v.number(),
    stockQuantity: v.number(),
    images: v.optional(v.array(v.object({ 
      storageId: v.string(),
      filename: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated.");
    }
    const store = await ctx.db.get(args.storeId);
    if (!store || store.ownerId !== userId) {
      throw new Error("User not authorized to add products to this store or store not found.");
    }

    const productId = await ctx.db.insert("products", {
      storeId: args.storeId,
      productName: args.productName,
      description: args.description,
      productDescription: args.description, // For backward compatibility
      category: args.category,
      price: args.price,
      stockQuantity: args.stockQuantity,
      images: args.images,
    });
    return productId;
  },
});

export const getProductById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) return null;
    
    const imagesWithUrls = await Promise.all(
      (product.images || []).map(async (img) => ({
        storageId: img.storageId,
        filename: img.filename,
        url: await ctx.storage.getUrl(img.storageId),
      }))
    );
    
    const store = await ctx.db.get(product.storeId);
    return { 
      ...product, 
      images: imagesWithUrls,
      storeName: store?.storeName ?? "Unknown Store" 
    };
  }
});

export const getAllStoreProductsForManagement = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated.");
    const store = await ctx.db.get(args.storeId);
    if (!store || store.ownerId !== userId) throw new Error("Not authorized.");

    const products = await ctx.db
      .query("products")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .collect();

    return Promise.all(
      products.map(async (product) => {
        const imagesWithUrls = await Promise.all(
          (product.images || []).map(async (img) => ({
            ...img,
            url: await ctx.storage.getUrl(img.storageId),
          }))
        );
        return { ...product, images: imagesWithUrls };
      })
    );
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    productName: v.optional(v.string()),
    description: v.optional(v.string()), 
    category: v.optional(v.string()),
    price: v.optional(v.number()),
    stockQuantity: v.optional(v.number()),
    images: v.optional(v.array(v.object({ 
      storageId: v.string(),
      filename: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated.");

    const { productId, ...updates } = args;
    const existingProduct = await ctx.db.get(productId);
    if (!existingProduct) throw new Error("Product not found.");

    const store = await ctx.db.get(existingProduct.storeId);
    if (!store || store.ownerId !== userId) throw new Error("Not authorized.");
    
    await ctx.db.patch(productId, updates);
    return { success: true };
  },
});

export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated.");

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found.");

    const store = await ctx.db.get(product.storeId);
    if (!store || store.ownerId !== userId) throw new Error("Not authorized.");

    if (product.images) {
      for (const image of product.images) {
        await ctx.storage.delete(image.storageId);
      }
    }
    await ctx.db.delete(args.productId);
    return { success: true };
  },
});

export const listPublishedProductsMarketplace = query({
  args: {
    category: v.optional(v.string()),
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let products: Doc<"products">[];

    if (args.searchTerm) {
      products = await ctx.db
        .query("products")
        .withSearchIndex("search_products", q => 
          q.search("productName", args.searchTerm as string)
           .eq("category", args.category || "")
        )
        .collect();
    } else if (args.category) {
      products = await ctx.db
        .query("products")
        .withIndex("by_category", q => q.eq("category", args.category as string))
        .order("desc")
        .collect();
    } else {
      products = await ctx.db
        .query("products")
        .order("desc")
        .collect();
    }

    return Promise.all(
      products.map(async (product) => {
        let primaryImageUrl: string | null = null;
        if (product.images && product.images.length > 0) {
          primaryImageUrl = await ctx.storage.getUrl(product.images[0].storageId);
        }
        const store = await ctx.db.get(product.storeId);
        return { 
          ...product, 
          primaryImageUrl,
          storeName: store?.storeName ?? "Unknown Store",
        };
      })
    );
  },
});

export const getProductCategories = query({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    
    const categories = new Set<string>();
    products.forEach(p => categories.add(p.category));
    return Array.from(categories).sort();
  }
});

export const getAllPublishedProducts = query({
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .order("desc")
      .collect();

    return Promise.all(
      products.map(async (product) => {
        const imageUrls = await Promise.all(
          (product.images || []).map(async (img) => 
            await ctx.storage.getUrl(img.storageId)
          )
        );
        const store = await ctx.db.get(product.storeId);
        return { ...product, imageUrls, storeName: store?.storeName ?? "Unknown Store" };
      })
    );
  }
});
