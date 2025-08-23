import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const createStore = mutation({
  args: {
    storeName: v.string(),
    storeDescription: v.string(),
    categories: v.array(v.string()),
    openingHours: v.string(),
    ownerName: v.string(),
    ownerEmail: v.string(),
    ownerPhone: v.string(),
    businessAddressStreet: v.string(),
    businessAddressArea: v.string(),
    businessAddressPincode: v.string(),
    businessAddressState: v.string(),
    businessAddressCountry: v.string(),
    businessAddressLandmark: v.optional(v.string()),
    storeLogoId: v.optional(v.id("_storage")),
    storeBannerId: v.optional(v.id("_storage")),
    // New store fee fields
    storeCharges: v.optional(v.number()),
    gstApplicable: v.optional(v.boolean()),
    gstPercentage: v.optional(v.number()),
    codAvailable: v.optional(v.boolean()),
    codCharges: v.optional(v.number()),
    invoiceSignatureId: v.optional(v.id("_storage")),
    invoiceTerms: v.optional(v.string()),
    gstNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be logged in to create a store.");
    }

    // Check if user already has a store
    const existingStore = await ctx.db
      .query("stores")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", userId))
      .unique();

    if (existingStore) {
      throw new Error("You already have a store. Each user can only create one store.");
    }

    const storeId = await ctx.db.insert("stores", {
      ownerId: userId,
      storeName: args.storeName,
      storeDescription: args.storeDescription,
      categories: args.categories,
      openingHours: args.openingHours,
      ownerName: args.ownerName,
      ownerEmail: args.ownerEmail,
      ownerPhone: args.ownerPhone,
      businessAddressStreet: args.businessAddressStreet,
      businessAddressArea: args.businessAddressArea,
      businessAddressPincode: args.businessAddressPincode,
      businessAddressState: args.businessAddressState,
      businessAddressCountry: args.businessAddressCountry,
      businessAddressLandmark: args.businessAddressLandmark,
      storeLogoId: args.storeLogoId,
      storeBannerId: args.storeBannerId,
      storeCharges: args.storeCharges || 0,
      gstApplicable: args.gstApplicable || false,
      gstPercentage: args.gstPercentage || 18,
      codAvailable: args.codAvailable || true,
      codCharges: args.codCharges || 0,
      invoiceSignatureId: args.invoiceSignatureId,
      invoiceTerms: args.invoiceTerms,
      gstNumber: args.gstNumber,
    });

    return { success: true, storeId };
  },
});

export const updateStore = mutation({
  args: {
    storeId: v.id("stores"),
    storeName: v.optional(v.string()),
    storeDescription: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    openingHours: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
    ownerPhone: v.optional(v.string()),
    businessAddressStreet: v.optional(v.string()),
    businessAddressArea: v.optional(v.string()),
    businessAddressPincode: v.optional(v.string()),
    businessAddressState: v.optional(v.string()),
    businessAddressCountry: v.optional(v.string()),
    businessAddressLandmark: v.optional(v.string()),
    storeLogoId: v.optional(v.id("_storage")),
    storeBannerId: v.optional(v.id("_storage")),
    storeCharges: v.optional(v.number()),
    gstApplicable: v.optional(v.boolean()),
    gstPercentage: v.optional(v.number()),
    codAvailable: v.optional(v.boolean()),
    codCharges: v.optional(v.number()),
    invoiceSignatureId: v.optional(v.id("_storage")),
    invoiceTerms: v.optional(v.string()),
    gstNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be logged in to update a store.");
    }

    const store = await ctx.db.get(args.storeId);
    if (!store) {
      throw new Error("Store not found.");
    }

    if (store.ownerId !== userId) {
      throw new Error("You can only update your own store.");
    }

    const updates: any = {};
    if (args.storeName !== undefined) updates.storeName = args.storeName;
    if (args.storeDescription !== undefined) updates.storeDescription = args.storeDescription;
    if (args.categories !== undefined) updates.categories = args.categories;
    if (args.openingHours !== undefined) updates.openingHours = args.openingHours;
    if (args.ownerName !== undefined) updates.ownerName = args.ownerName;
    if (args.ownerEmail !== undefined) updates.ownerEmail = args.ownerEmail;
    if (args.ownerPhone !== undefined) updates.ownerPhone = args.ownerPhone;
    if (args.businessAddressStreet !== undefined) updates.businessAddressStreet = args.businessAddressStreet;
    if (args.businessAddressArea !== undefined) updates.businessAddressArea = args.businessAddressArea;
    if (args.businessAddressPincode !== undefined) updates.businessAddressPincode = args.businessAddressPincode;
    if (args.businessAddressState !== undefined) updates.businessAddressState = args.businessAddressState;
    if (args.businessAddressCountry !== undefined) updates.businessAddressCountry = args.businessAddressCountry;
    if (args.businessAddressLandmark !== undefined) updates.businessAddressLandmark = args.businessAddressLandmark;
    if (args.storeLogoId !== undefined) updates.storeLogoId = args.storeLogoId;
    if (args.storeBannerId !== undefined) updates.storeBannerId = args.storeBannerId;
    if (args.storeCharges !== undefined) updates.storeCharges = args.storeCharges;
    if (args.gstApplicable !== undefined) updates.gstApplicable = args.gstApplicable;
    if (args.gstPercentage !== undefined) updates.gstPercentage = args.gstPercentage;
    if (args.codAvailable !== undefined) updates.codAvailable = args.codAvailable;
    if (args.codCharges !== undefined) updates.codCharges = args.codCharges;
    if (args.invoiceSignatureId !== undefined) updates.invoiceSignatureId = args.invoiceSignatureId;
    if (args.invoiceTerms !== undefined) updates.invoiceTerms = args.invoiceTerms;
    if (args.gstNumber !== undefined) updates.gstNumber = args.gstNumber;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.storeId, updates);
    }

    return { success: true };
  },
});

export const getAllStores = query({
  handler: async (ctx) => {
    const stores = await ctx.db.query("stores").collect();
    
    const storesWithImages = await Promise.all(
      stores.map(async (store) => {
        const logoUrl = store.storeLogoId ? await ctx.storage.getUrl(store.storeLogoId) : null;
        const bannerUrl = store.storeBannerId ? await ctx.storage.getUrl(store.storeBannerId) : null;
        return { ...store, logoUrl, bannerUrl };
      })
    );

    return storesWithImages;
  },
});

export const getStoreById = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    const store = await ctx.db.get(args.storeId);
    if (!store) return null;

    const logoUrl = store.storeLogoId ? await ctx.storage.getUrl(store.storeLogoId) : null;
    const bannerUrl = store.storeBannerId ? await ctx.storage.getUrl(store.storeBannerId) : null;
    
    return { ...store, logoUrl, bannerUrl };
  },
});
