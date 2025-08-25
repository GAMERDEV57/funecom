import { action, query } from "./_generated/server";
import { v } from "convex/values";

// Delhivery API integration for pincode serviceability
export const checkPincodeServiceability = action({
  args: {
    originPincode: v.string(),
    destinationPincode: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Using Delhivery's pincode serviceability API
      const response = await fetch(
        `https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=${args.destinationPincode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Note: In production, you'd use process.env.DELHIVERY_API_KEY
            "Authorization": "Token your_delhivery_token_here",
          },
        }
      );

      if (!response.ok) {
        // Fallback to mock data if API fails
        return getMockDeliveryEstimate(args.originPincode, args.destinationPincode);
      }

      const data = await response.json();
      
      if (data.delivery_codes && data.delivery_codes.length > 0) {
        const pincodeData = data.delivery_codes[0];
        
        // Calculate delivery estimate based on distance and serviceability
        const deliveryDays = calculateDeliveryDays(
          args.originPincode,
          args.destinationPincode,
          pincodeData
        );

        return {
          serviceable: true,
          estimatedDays: deliveryDays,
          estimatedDate: getEstimatedDeliveryDate(deliveryDays),
          courierPartner: "Delhivery",
          cashOnDelivery: pincodeData.cod === "Y",
          district: pincodeData.district,
          state: pincodeData.state_code,
        };
      } else {
        return {
          serviceable: false,
          estimatedDays: null,
          estimatedDate: null,
          courierPartner: null,
          cashOnDelivery: false,
          district: null,
          state: null,
        };
      }
    } catch (error) {
      console.error("Delivery API error:", error);
      // Return mock data as fallback
      return getMockDeliveryEstimate(args.originPincode, args.destinationPincode);
    }
  },
});

// Alternative API using India Post pincode data
export const checkIndiaPostServiceability = action({
  args: {
    pincode: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${args.pincode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      
      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        return {
          valid: true,
          district: postOffice.District,
          state: postOffice.State,
          country: postOffice.Country,
          region: postOffice.Region,
        };
      } else {
        return {
          valid: false,
          district: null,
          state: null,
          country: null,
          region: null,
        };
      }
    } catch (error) {
      console.error("India Post API error:", error);
      return {
        valid: false,
        district: null,
        state: null,
        country: null,
        region: null,
      };
    }
  },
});

// Mock delivery estimation for fallback
function getMockDeliveryEstimate(originPincode: string, destinationPincode: string) {
  // Simple logic based on pincode proximity
  const origin = parseInt(originPincode.substring(0, 2));
  const destination = parseInt(destinationPincode.substring(0, 2));
  
  const distance = Math.abs(origin - destination);
  
  let deliveryDays: number;
  if (distance === 0) {
    deliveryDays = 1; // Same state/region
  } else if (distance <= 5) {
    deliveryDays = 2; // Nearby states
  } else if (distance <= 15) {
    deliveryDays = 3; // Medium distance
  } else {
    deliveryDays = 5; // Far distance
  }

  return {
    serviceable: true,
    estimatedDays: deliveryDays,
    estimatedDate: getEstimatedDeliveryDate(deliveryDays),
    courierPartner: "Standard Delivery",
    cashOnDelivery: true,
    district: "Unknown",
    state: "Unknown",
  };
}

function calculateDeliveryDays(
  originPincode: string,
  destinationPincode: string,
  pincodeData: any
): number {
  // Basic calculation - can be enhanced with more sophisticated logic
  const origin = parseInt(originPincode.substring(0, 2));
  const destination = parseInt(destinationPincode.substring(0, 2));
  
  const distance = Math.abs(origin - destination);
  
  // Base delivery time
  let days = 2;
  
  // Add days based on distance
  if (distance > 10) days += 1;
  if (distance > 20) days += 1;
  if (distance > 30) days += 1;
  
  // Weekend adjustment
  const today = new Date();
  const dayOfWeek = today.getDay();
  if (dayOfWeek === 6 || dayOfWeek === 0) { // Saturday or Sunday
    days += 1;
  }
  
  return Math.min(days, 7); // Max 7 days
}

function getEstimatedDeliveryDate(days: number): string {
  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + days);
  
  // Skip Sundays for delivery
  if (deliveryDate.getDay() === 0) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  }
  
  return deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Get delivery estimate for existing orders
export const getOrderDeliveryEstimate = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    const store = await ctx.db.get(order.storeId);
    if (!store) return null;

    // If order is already shipped, calculate based on tracking
    if (order.orderStatus === "shipped" && order.trackingId) {
      return {
        status: "shipped",
        trackingId: order.trackingId,
        courierName: order.courierName || "Standard Courier",
        estimatedDelivery: order.estimatedDeliveryTime,
      };
    }

    // For pending orders, show processing time
    const processingDays = store.processingTime || 1;
    const processingDate = new Date();
    processingDate.setDate(processingDate.getDate() + processingDays);

    return {
      status: order.orderStatus,
      processingTime: `${processingDays} business day${processingDays > 1 ? 's' : ''}`,
      expectedProcessingDate: processingDate.toLocaleDateString('en-IN'),
      note: "Delivery estimate will be available once the seller processes your order",
    };
  },
});
