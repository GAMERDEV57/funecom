import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Id, Doc } from "./_generated/dataModel";

// Create order with enhanced pricing breakdown
export const createOrder = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    shippingAddress: v.object({
     id: v.optional(v.string()),
      type: v.string(),
      street: v.string(),
      area: v.string(),
      pincode: v.string(),
      city: v.string(),
      state: v.string(),
      country: v.string(),
      landmark: v.optional(v.string()),
      isDefault: v.optional(v.boolean()),
    }),
    paymentMethod: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated.");

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found.");

    const store = await ctx.db.get(product.storeId);
    if (!store) throw new Error("Store not found.");

    if (product.stockQuantity < args.quantity) {
      throw new Error("Insufficient stock available.");
    }

    // Calculate pricing breakdown
    const subtotal = product.price * args.quantity;
    const storeCharges = store.storeCharges || 0;
    const gstApplicable = store.gstApplicable || false;
    const gstPercentage = store.gstPercentage || 18;
    const gstAmount = gstApplicable ? (subtotal * gstPercentage) / 100 : 0;
    const codCharges = args.paymentMethod.toLowerCase() === "cod" ? (store.codCharges || 0) : 0;
    const finalTotal = subtotal + storeCharges + gstAmount + codCharges;

    // Strip extra fields from shippingAddress to match orders table schema
    const { id, isDefault, ...cleanAddress } = args.shippingAddress;

    // Create order with status history
    const orderId = await ctx.db.insert("orders", {
      userId,
      storeId: product.storeId,
      productId: args.productId,
      quantity: args.quantity,
      productPriceAtOrder: product.price,
      totalPrice: finalTotal, // Keep for backward compatibility
      shippingAddress: cleanAddress, // ✅ fixed
      paymentMethod: args.paymentMethod,
      orderStatus: "placed",
      subtotal,
      storeCharges,
      gstAmount,
      codCharges,
      finalTotal,
      statusHistory: [{
        status: "placed",
        timestamp: Date.now(),
        description: "Order has been placed successfully",
      }],
    });

    // Update product stock
    await ctx.db.patch(args.productId, {
      stockQuantity: product.stockQuantity - args.quantity,
    });

    return { success: true, orderId };
  },
});

// Update order status with tracking
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
    trackingId: v.optional(v.string()),
    courierName: v.optional(v.string()),
    estimatedDeliveryTime: v.optional(v.string()),
    location: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated.");

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found.");

    // Check if user owns the store (only store owners can update order status)
    const store = await ctx.db.get(order.storeId);
    if (!store || store.ownerId !== userId) {
      throw new Error("Unauthorized to update this order.");
    }

    const updates: Partial<Doc<"orders">> = {
      orderStatus: args.status,
    };

    if (args.trackingId) updates.trackingId = args.trackingId;
    if (args.courierName) updates.courierName = args.courierName;
    if (args.estimatedDeliveryTime) updates.estimatedDeliveryTime = args.estimatedDeliveryTime;

    // Add to status history
    const currentHistory = order.statusHistory || [];
    const newHistoryEntry = {
      status: args.status,
      timestamp: Date.now(),
      location: args.location,
      description: args.description || `Order status updated to ${args.status}`,
    };
    
    updates.statusHistory = [...currentHistory, newHistoryEntry];

    await ctx.db.patch(args.orderId, updates);
    return { success: true };
  },
});

// Get user's orders with enhanced data
export const getMyOrders = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const product = await ctx.db.get(order.productId);
        const store = await ctx.db.get(order.storeId);
        
        return {
          ...order,
          productName: product?.productName || "Unknown Product",
          storeName: store?.storeName || "Unknown Store",
        };
      })
    );

    return enrichedOrders;
  },
});

// Get store orders for store owners
export const getStoreOrders = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify user owns the store
    const store = await ctx.db.get(args.storeId);
    if (!store || store.ownerId !== userId) {
      throw new Error("Unauthorized to view these orders.");
    }

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .collect();

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const product = await ctx.db.get(order.productId);
        const user = await ctx.db.get(order.userId);
        
        return {
          ...order,
          productName: product?.productName || "Unknown Product",
          customerName: user?.name || "Unknown Customer",
          customerEmail: user?.email || "",
        };
      })
    );

    return enrichedOrders;
  },
});

// Get single order details
export const getOrderDetails = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    // Check if user is the customer or store owner
    const store = await ctx.db.get(order.storeId);
    if (order.userId !== userId && store?.ownerId !== userId) {
      throw new Error("Unauthorized to view this order.");
    }

    const product = await ctx.db.get(order.productId);
    const customer = await ctx.db.get(order.userId);

    return {
      ...order,
      productName: product?.productName || "Unknown Product",
      storeName: store?.storeName || "Unknown Store",
      customerName: customer?.name || "Unknown Customer",
      customerEmail: customer?.email || "",
    };
  },
});

// Generate invoice data for an order
export const generateInvoice = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    const store = await ctx.db.get(order.storeId);
    if (order.userId !== userId && store?.ownerId !== userId) {
      throw new Error("Unauthorized to view this invoice.");
    }

    const product = await ctx.db.get(order.productId);
    const customer = await ctx.db.get(order.userId);
    const signatureUrl = store?.invoiceSignatureId 
      ? await ctx.storage.getUrl(store.invoiceSignatureId) 
      : null;

    return {
      orderId: order._id,
      orderDate: new Date(order._creationTime).toLocaleDateString(),
      orderStatus: order.orderStatus,
      store: {
        name: store?.storeName || "Unknown Store",
        ownerName: store?.ownerName || "",
        email: store?.ownerEmail || "",
        phone: store?.ownerPhone || "",
        gstNumber: store?.gstNumber || "",
        signatureUrl,
        invoiceTerms: store?.invoiceTerms || "Thank you for your business!",
      },
      customer: {
        name: customer?.name || "Unknown Customer",
        email: customer?.email || "",
        phone: customer?.phone || "",
        shippingAddress: order.shippingAddress,
      },
      product: {
        name: product?.productName || "Unknown Product",
        quantity: order.quantity,
        unitPrice: order.productPriceAtOrder,
      },
      pricing: {
        subtotal: order.subtotal || (order.productPriceAtOrder * order.quantity),
        storeCharges: order.storeCharges || 0,
        gstAmount: order.gstAmount || 0,
        codCharges: order.codCharges || 0,
        finalTotal: order.finalTotal || order.totalPrice,
      },
      paymentMethod: order.paymentMethod,
      trackingId: order.trackingId,
      courierName: order.courierName,
    };
  },
});

