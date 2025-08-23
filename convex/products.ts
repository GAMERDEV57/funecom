import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";

export const addProduct = mutation({
  args: {
    storeId: v.id("stores"),
    productName: v.string(),
    productDescription: v.string(), 
    category: v.string(),
    subCategory: v.optional(v.string()),
    brand: v.optional(v.string()),
    price: v.number(),
    stockQuantity: v.number(),
    images: v.array(v.object({ 
      storageId: v.id("_storage"),
      isPrimary: v.optional(v.boolean()),
    })),
    variants: v.optional(v.array(v.object({
      name: v.string(),
      options: v.array(v.string()),
    }))),
    sku: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    weight: v.optional(v.number()),
    dimensions: v.optional(v.object({
      length: v.number(),
      width: v.number(),
      height: v.number(),
    })),
    isPublished: v.boolean(),
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
      productDescription: args.productDescription, 
      category: args.category,
      subCategory: args.subCategory,
      brand: args.brand,
      price: args.price,
      stockQuantity: args.stockQuantity,
      images: args.images, 
      variants: args.variants,
      sku: args.sku,
      tags: args.tags,
      weight: args.weight,
      dimensions: args.dimensions,
      isPublished: args.isPublished,
    });
    return productId;
  },
});

export const getProductWithPrimaryImage = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) return null;

    let primaryImageUrl: string | null = null;
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
      if (primaryImage) {
        primaryImageUrl = await ctx.storage.getUrl(primaryImage.storageId);
      }
    }
    return { ...product, primaryImageUrl };
  },
});

export const getStoreProductsWithPrimaryImages = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .filter(q => q.eq(q.field("isPublished"), true)) 
      .order("desc")
      .collect();

    return Promise.all(
      products.map(async (product) => {
        let primaryImageUrl: string | null = null;
        if (product.images && product.images.length > 0) {
          const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
          if (primaryImage) {
            primaryImageUrl = await ctx.storage.getUrl(primaryImage.storageId);
          }
        }
        return { ...product, primaryImageUrl };
      })
    );
  },
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
    productDescription: v.optional(v.string()), 
    category: v.optional(v.string()),
    subCategory: v.optional(v.string()),
    brand: v.optional(v.string()),
    price: v.optional(v.number()),
    stockQuantity: v.optional(v.number()),
    images: v.optional(v.array(v.object({ 
        storageId: v.id("_storage"),
        isPrimary: v.optional(v.boolean()),
    }))),
    variants: v.optional(v.array(v.object({
        name: v.string(),
        options: v.array(v.string()),
    }))),
    sku: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    weight: v.optional(v.number()),
    dimensions: v.optional(v.object({
        length: v.number(),
        width: v.number(),
        height: v.number(),
    })),
    isPublished: v.optional(v.boolean()),
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
            // If search term exists, prioritize search index
            let queryChain = ctx.db
                .query("products")
                .withSearchIndex("search_productName", q => 
                    q.search("productName", args.searchTerm as string)
                     .eq("isPublished", true)
                );
            // If category is also specified, and it's a filterField in search_productName, it can be added here.
            // Assuming "category" is a filterField in "search_productName"
            if (args.category) {
                 queryChain = ctx.db
                .query("products")
                .withSearchIndex("search_productName", q => 
                    q.search("productName", args.searchTerm as string)
                     .eq("isPublished", true)
                     .eq("category", args.category as string) // Add category to search query
                );
            }
            products = await queryChain.collect(); // Removed .order("desc") as search results are relevance-ordered

        } else if (args.category) {
            // If only category is specified, use by_category index
            products = await ctx.db
                .query("products")
                .withIndex("by_category", q => q.eq("category", args.category as string))
                .filter(q => q.eq(q.field("isPublished"), true))
                .order("desc")
                .collect();
        } else {
            // No search term or category, list all published products
            products = await ctx.db
                .query("products")
                .filter(q => q.eq(q.field("isPublished"), true))
                .order("desc")
                .collect();
        }

        return Promise.all(
            products.map(async (product) => {
                let primaryImageUrl: string | null = null;
                if (product.images && product.images.length > 0) {
                    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
                    if (primaryImage) {
                        primaryImageUrl = await ctx.storage.getUrl(primaryImage.storageId);
                    }
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

export const getProductDetailsMarketplace = query({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        const product = await ctx.db.get(args.productId);
        if (!product || !product.isPublished) {
            return null; 
        }

        const imagesWithUrls = await Promise.all(
            (product.images || []).map(async (img) => ({
                storageId: img.storageId,
                isPrimary: img.isPrimary,
                url: await ctx.storage.getUrl(img.storageId),
            }))
        );
        
        const store = await ctx.db.get(product.storeId);

        return {
            ...product,
            images: imagesWithUrls,
            storeName: store?.storeName ?? "Unknown Store",
            storeId: store?._id,
        };
    }
});

export const getProductCategories = query({
    handler: async (ctx) => {
        const products = await ctx.db.query("products")
            .filter(q => q.eq(q.field("isPublished"), true))
            .collect();
        
        const categories = new Set<string>();
        products.forEach(p => categories.add(p.category));
        return Array.from(categories).sort();
    }
});

export const getProductById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) return null;
    
    const imagesWithUrls = await Promise.all(
      (product.images || []).map(async (img) => ({
        storageId: img.storageId,
        isPrimary: img.isPrimary,
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

export const getAllPublishedProducts = query({
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .filter(q => q.eq(q.field("isPublished"), true))
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
