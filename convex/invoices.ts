import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// Helper to generate a unique invoice number (simplified)
async function generateInvoiceNumberHelper(db: any): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  
  const count = (await db.query("invoices").collect()).length + 1;
  const sequence = count.toString().padStart(4, '0');
  
  return `INV-${year}${month}${day}-${sequence}`;
}

export const generateInvoiceForOrder = internalMutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    // Note: Auth check might not be strictly necessary for internal mutation
    // if we trust the caller (e.g., createOrder mutation)
    // const userId = await getAuthUserId(ctx);
    // if (!userId) {
    //   throw new Error("User must be logged in.");
    // }

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found.");
    }

    const existingInvoice = await ctx.db
      .query("invoices")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .unique();

    if (existingInvoice) {
      console.log(`Invoice already exists for order ${args.orderId}`);
      return existingInvoice._id; 
    }

    const store = await ctx.db.get(order.storeId);
    if (!store) {
      throw new Error("Store not found for this order.");
    }

    const product = await ctx.db.get(order.productId);
    if (!product) {
      throw new Error("Product not found for this order.");
    }
    
    const orderingUser = await ctx.db.get(order.userId);
    if (!orderingUser) {
        throw new Error("Ordering user not found.");
    }

    const invoiceNumber = await generateInvoiceNumberHelper(ctx.db);
    const issueDate = Date.now();

    const invoiceId = await ctx.db.insert("invoices", {
      orderId: order._id,
      userId: order.userId,
      storeId: order.storeId,
      invoiceNumber,
      issueDate,
      storeDetails: {
        storeName: store.storeName,
        ownerName: store.ownerName,
        ownerEmail: store.ownerEmail,
        ownerPhone: store.ownerPhone,
        businessAddressStreet: store.businessAddressStreet,
        businessAddressArea: store.businessAddressArea,
        businessAddressPincode: store.businessAddressPincode,
        businessAddressState: store.businessAddressState,
        businessAddressCountry: store.businessAddressCountry,
        businessAddressLandmark: store.businessAddressLandmark,
      },
      customerDetails: {
        name: orderingUser.name,
        email: orderingUser.email,
        phone: orderingUser.phone,
        shippingAddress: order.shippingAddress,
      },
      items: [
        {
          productId: product._id,
          productName: product.productName,
          quantity: order.quantity,
          pricePerUnit: order.productPriceAtOrder,
          totalPrice: order.totalPrice,
        },
      ],
      subTotalAmount: order.totalPrice,
      totalAmount: order.totalPrice, 
      paymentStatus: order.paymentId ? "Paid" : "Pending", 
      paymentMethod: order.paymentMethod,
    });

    return invoiceId;
  },
});

export const getInvoiceDetails = query({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      // Allow public access or check ownership
      // For now, let's assume if you have the ID, you can view.
      // Or, add more robust checks if needed.
    }
    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice) return null;

    // Add authorization check: only user who placed order or store owner can view
    if (invoice.userId !== userId) {
        const store = await ctx.db.get(invoice.storeId);
        if (!store || store.ownerId !== userId) {
            throw new Error("Not authorized to view this invoice.");
        }
    }
    return invoice;
  },
});

export const listUserInvoices = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    return ctx.db
      .query("invoices")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const listStoreInvoices = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated.");
    }
    const store = await ctx.db.get(args.storeId);
    if (!store || store.ownerId !== userId) {
        throw new Error("Not authorized to view invoices for this store.");
    }

    return ctx.db
      .query("invoices")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .collect();
  },
});
