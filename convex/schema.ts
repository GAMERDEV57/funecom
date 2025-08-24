// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/**
 * ================
 * Stores & Products
 * ================
 */
const stores = defineTable({
  ownerId: v.id("users"),
  storeName: v.string(),
  storeDescription: v.string(),
  categories: v.array(v.string()),

  // Owner details
  ownerName: v.string(),
  ownerEmail: v.string(),
  ownerPhone: v.string(),

  // Business address
  businessAddressStreet: v.string(),
  businessAddressArea: v.string(),
  businessAddressPincode: v.string(),
  businessAddressState: v.string(),
  businessAddressCountry: v.string(),
  businessAddressLandmark: v.optional(v.string()),

  // Media
  storeLogoId: v.optional(v.id("_storage")),
  storeBannerId: v.optional(v.id("_storage")),

  // Store fee settings
  storeCharges: v.optional(v.number()),   // service fee
  gstApplicable: v.optional(v.boolean()), // true/false
  gstPercentage: v.optional(v.number()),  // e.g. 18
  codAvailable: v.optional(v.boolean()),
  codCharges: v.optional(v.number()),

  // Invoice settings
  invoiceSignatureId: v.optional(v.id("_storage")),
  invoiceTerms: v.optional(v.string()),
  gstNumber: v.optional(v.string()),

  // Meta
  openingHours: v.string(),
})
.index("by_ownerId", ["ownerId"]);

const products = defineTable({
  storeId: v.id("stores"),
  productName: v.string(),
  productDescription: v.string(),
  category: v.string(),
  subCategory: v.optional(v.string()),
  brand: v.optional(v.string()),

  price: v.number(),
  stockQuantity: v.number(),

  // Images
  images: v.array(v.object({
    storageId: v.id("_storage"),
    isPrimary: v.optional(v.boolean()),
  })),

  // Variants (size, color, etc.)
  variants: v.optional(v.array(v.object({
    name: v.string(),
    options: v.array(v.string()),
  }))),

  // Extra meta
  sku: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  weight: v.optional(v.number()),
  dimensions: v.optional(v.object({
    length: v.number(),
    width: v.number(),
    height: v.number(),
  })),

  // Published / draft status
  isPublished: v.boolean(),
})
.index("by_storeId", ["storeId"])
.index("by_category", ["category"])
.index("by_storeId_and_isPublished", ["storeId", "isPublished"])
.searchIndex("search_name", {
  searchField: "productName",
  filterFields: ["storeId", "category", "isPublished"],
})
.searchIndex("search_description", {
  searchField: "productDescription",
  filterFields: ["storeId", "category", "isPublished"],
})
.searchIndex("search_tags", {
  searchField: "tags",
  filterFields: ["storeId", "isPublished"],
});

/**
 * ============
 * User Profiles
 * ============
 */
const userProfiles = defineTable({
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

  // Track email changes
  emailChangeHistory: v.optional(v.array(v.object({
    oldEmail: v.string(),
    newEmail: v.string(),
    changeDate: v.number(),
  }))),
  emailChangesThisMonth: v.optional(v.number()),
  lastEmailChangeReset: v.optional(v.number()),
})
.index("by_userId", ["userId"]);

/**
 * ======
 * Orders
 * ======
 */
const orders = defineTable({
  userId: v.id("users"),
  storeId: v.id("stores"),
  productId: v.id("products"),

  // Items
  quantity: v.number(),
  productPriceAtOrder: v.number(),
  subtotal: v.number(),

  // Shipping
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

  // Payment
  paymentMethod: v.string(),
  paymentId: v.optional(v.string()),

  // Order tracking
  orderStatus: v.string(), // pending, shipped, delivered, cancelled
  trackingId: v.optional(v.string()),
  courierName: v.optional(v.string()),
  estimatedDeliveryTime: v.optional(v.string()),
  cancellationReason: v.optional(v.string()),

  // Status history
  statusHistory: v.optional(v.array(v.object({
    status: v.string(),
    timestamp: v.number(),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
  }))),

  // Price breakdown
  storeCharges: v.optional(v.number()),
  gstAmount: v.optional(v.number()),
  codCharges: v.optional(v.number()),
  finalTotal: v.number(),
})
.index("by_userId", ["userId"])
.index("by_storeId", ["storeId"])
.index("by_productId", ["productId"])
.index("by_userId_and_status", ["userId", "orderStatus"])
.index("by_storeId_and_status", ["storeId", "orderStatus"]);

/**
 * =======
 * Reviews
 * =======
 */
const reviews = defineTable({
  userId: v.id("users"),
  productId: v.id("products"),
  storeId: v.id("stores"),
  rating: v.number(),
  comment: v.optional(v.string()),
  reviewDate: v.number(),
})
.index("by_productId", ["productId"])
.index("by_userId", ["userId"])
.index("by_storeId", ["storeId"]);

/**
 * ========
 * Invoices
 * ========
 */
const invoices = defineTable({
  orderId: v.id("orders"),
  userId: v.id("users"),
  storeId: v.id("stores"),
  invoiceNumber: v.string(),
  issueDate: v.number(),
  dueDate: v.optional(v.number()),

  // Store details
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

  // Customer details
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

  // Items
  items: v.array(v.object({
    productId: v.id("products"),
    productName: v.string(),
    quantity: v.number(),
    pricePerUnit: v.number(),
    totalPrice: v.number(),
  })),

  // Amounts
  subTotalAmount: v.number(),
  taxAmount: v.optional(v.number()),
  shippingAmount: v.optional(v.number()),
  discountAmount: v.optional(v.number()),
  totalAmount: v.number(),

  // Payment
  paymentStatus: v.string(), // paid, pending, failed
  paymentMethod: v.string(),

  notes: v.optional(v.string()),
})
.index("by_orderId", ["orderId"])
.index("by_userId", ["userId"])
.index("by_storeId", ["storeId"])
.index("by_invoiceNumber", ["invoiceNumber"]);

/**
 * =========
 * Export All
 * =========
 */
export default defineSchema({
  ...authTables,
  stores,
  products,
  userProfiles,
  orders,
  reviews,
  invoices,
});
