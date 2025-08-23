import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  stores: defineTable({
    ownerId: v.id("users"),
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
    storeCharges: v.optional(v.number()), // Store service fee
    gstApplicable: v.optional(v.boolean()), // Whether GST is applicable
    gstPercentage: v.optional(v.number()), // GST percentage (default 18%)
    codAvailable: v.optional(v.boolean()), // Cash on Delivery available
    codCharges: v.optional(v.number()), // COD charges if any
    // Invoice settings
    invoiceSignatureId: v.optional(v.id("_storage")), // Store owner signature for invoices
    invoiceTerms: v.optional(v.string()), // Terms and conditions for invoices
    gstNumber: v.optional(v.string()), // GST registration number
  }).index("by_ownerId", ["ownerId"]),

  products: defineTable({
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
  })
  .index("by_storeId", ["storeId"])
  .index("by_category", ["category"])
  .index("by_storeId_and_isPublished", ["storeId", "isPublished"])
  .searchIndex("search_productName", { searchField: "productName", filterFields: ["storeId", "category", "isPublished"] })
  .searchIndex("search_description", { searchField: "productDescription", filterFields: ["storeId", "category", "isPublished"] })
  .searchIndex("search_tags", { searchField: "tags", filterFields: ["storeId", "isPublished"] }),

  userProfiles: defineTable({
    userId: v.id("users"),
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
      isDefault: v.optional(v.boolean()),
    }))),
    // Email change tracking
    emailChangeHistory: v.optional(v.array(v.object({
      oldEmail: v.string(),
      newEmail: v.string(),
      changeDate: v.number(),
    }))),
    emailChangesThisMonth: v.optional(v.number()),
    lastEmailChangeReset: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

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
    paymentId: v.optional(v.string()),
    orderStatus: v.string(),
    trackingId: v.optional(v.string()),
    courierName: v.optional(v.string()),
    estimatedDeliveryTime: v.optional(v.string()),
    cancellationReason: v.optional(v.string()),
    // Enhanced order tracking
    statusHistory: v.optional(v.array(v.object({
      status: v.string(),
      timestamp: v.number(),
      location: v.optional(v.string()),
      description: v.optional(v.string()),
    }))),
    // Pricing breakdown
    subtotal: v.number(),
    storeCharges: v.optional(v.number()),
    gstAmount: v.optional(v.number()),
    codCharges: v.optional(v.number()),
    finalTotal: v.number(),
  })
  .index("by_userId", ["userId"])
  .index("by_storeId", ["storeId"])
  .index("by_productId", ["productId"])
  .index("by_userId_and_status", ["userId", "orderStatus"])
  .index("by_storeId_and_status", ["storeId", "orderStatus"]),

  reviews: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    storeId: v.id("stores"),
    rating: v.number(),
    comment: v.optional(v.string()),
    reviewDate: v.number(),
  })
  .index("by_productId", ["productId"])
  .index("by_userId", ["userId"])
  .index("by_storeId", ["storeId"]),

  invoices: defineTable({
    orderId: v.id("orders"),
    userId: v.id("users"),
    storeId: v.id("stores"),
    invoiceNumber: v.string(), 
    issueDate: v.number(), 
    dueDate: v.optional(v.number()),
    storeDetails: v.object({
        storeName: v.string(),
        ownerName: v.string(),
        ownerEmail: v.string(),
        ownerPhone: v.string(),
        businessAddressStreet: v.string(),
        businessAddressArea: v.string(),
        businessAddressPincode: v.string(),
        businessAddressState: v.string(),
        businessAddressCountry: v.string(),
        businessAddressLandmark: v.optional(v.string()),
    }),
    customerDetails: v.object({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
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
    }),
    items: v.array(v.object({
        productId: v.id("products"),
        productName: v.string(),
        quantity: v.number(),
        pricePerUnit: v.number(),
        totalPrice: v.number(),
    })),
    subTotalAmount: v.number(),
    taxAmount: v.optional(v.number()),
    shippingAmount: v.optional(v.number()),
    discountAmount: v.optional(v.number()),
    totalAmount: v.number(),
    paymentStatus: v.string(),
    paymentMethod: v.string(),
    notes: v.optional(v.string()),
  })
  .index("by_orderId", ["orderId"])
  .index("by_userId", ["userId"])
  .index("by_storeId", ["storeId"])
  .index("by_invoiceNumber", ["invoiceNumber"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
