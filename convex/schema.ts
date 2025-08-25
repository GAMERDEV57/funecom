import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  stores: defineTable({
    ownerId: v.id("users"),
    storeName: v.string(),
    storeDescription: v.string(),
    ownerName: v.string(),
    ownerEmail: v.string(),
    ownerPhone: v.string(),
    pincode: v.optional(v.string()),
    processingTime: v.optional(v.number()),
    storeCharges: v.optional(v.number()),
    gstApplicable: v.optional(v.boolean()),
    gstPercentage: v.optional(v.number()),
    gstNumber: v.optional(v.string()),
    codAvailable: v.optional(v.boolean()),
    codCharges: v.optional(v.number()),
    invoiceSignatureId: v.optional(v.id("_storage")),
    invoiceTerms: v.optional(v.string()),
    // Legacy fields for backward compatibility
    storeLogoId: v.optional(v.id("_storage")),
    storeBannerId: v.optional(v.id("_storage")),
    businessAddressArea: v.optional(v.string()),
    businessAddressCountry: v.optional(v.string()),
    businessAddressLandmark: v.optional(v.string()),
    businessAddressPincode: v.optional(v.string()),
    businessAddressState: v.optional(v.string()),
    businessAddressStreet: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    openingHours: v.optional(v.string()),
  }).index("by_ownerId", ["ownerId"]),

  products: defineTable({
    storeId: v.id("stores"),
    productName: v.string(),
    description: v.optional(v.string()),
    productDescription: v.optional(v.string()),
    price: v.number(),
    stockQuantity: v.number(),
    category: v.string(),
    subCategory: v.optional(v.string()),
    brand: v.optional(v.string()),
    images: v.optional(v.array(v.object({
      storageId: v.string(),
      filename: v.optional(v.string()),
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
  }).index("by_storeId", ["storeId"])
    .index("by_category", ["category"])
    .searchIndex("search_products", {
      searchField: "productName",
      filterFields: ["category", "storeId"],
    }),

  orders: defineTable({
    userId: v.id("users"),
    storeId: v.id("stores"),
    productId: v.id("products"),
    quantity: v.number(),
    productPriceAtOrder: v.number(),
    totalPrice: v.number(),
    shippingAddress: v.object({
      type: v.string(),
      street: v.string(),
      area: v.string(),
      pincode: v.string(),
      city: v.string(),
      state: v.string(),
      country: v.string(),
      landmark: v.optional(v.string()),
    }),
    paymentMethod: v.string(),
    orderStatus: v.string(),
    trackingId: v.optional(v.string()),
    courierName: v.optional(v.string()),
    estimatedDeliveryTime: v.optional(v.string()),
    deliveryEstimateDays: v.optional(v.number()),
    subtotal: v.optional(v.number()),
    storeCharges: v.optional(v.number()),
    gstAmount: v.optional(v.number()),
    codCharges: v.optional(v.number()),
    finalTotal: v.optional(v.number()),
    statusHistory: v.optional(v.array(v.object({
      status: v.string(),
      timestamp: v.number(),
      location: v.optional(v.string()),
      description: v.optional(v.string()),
    }))),
  }).index("by_userId", ["userId"])
    .index("by_storeId", ["storeId"])
    .index("by_status", ["orderStatus"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    phone: v.optional(v.string()),
    profileImageId: v.optional(v.id("_storage")),
    addresses: v.optional(v.array(v.object({
      id: v.string(),
      type: v.string(),
      street: v.string(),
      area: v.string(),
      pincode: v.string(),
      city: v.string(),
      state: v.string(),
      country: v.string(),
      landmark: v.optional(v.string()),
      isDefault: v.boolean(),
    }))),
  }).index("by_userId", ["userId"]),

  deliveryEstimates: defineTable({
    orderId: v.id("orders"),
    originPincode: v.string(),
    destinationPincode: v.string(),
    estimatedDays: v.number(),
    estimatedDate: v.string(),
    courierPartner: v.string(),
    serviceable: v.boolean(),
    cashOnDelivery: v.boolean(),
    createdAt: v.number(),
  }).index("by_orderId", ["orderId"])
    .index("by_pincodes", ["originPincode", "destinationPincode"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
