import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Delhivery pincode serviceability (server-side).
 * Requires DELHIVERY_API_KEY in your environment.
 */
export const checkDelhiveryServiceability = action({
  args: { pincode: v.string() },
  handler: async (_ctx, { pincode }) => {
    const token = process.env.DELHIVERY_API_KEY;
    if (!token) {
      return {
        success: false,
        message:
          "Delhivery API key not configured. Set DELHIVERY_API_KEY in your environment.",
      };
    }

    try {
      const res = await fetch(
        `https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(
          pincode
        )}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Delhivery API responded ${res.status}`);
      }

      const data = await res.json();
      const code = data?.delivery_codes?.[0]?.postal_code;

      if (!code) {
        return {
          success: true,
          serviceable: false,
          cashOnDelivery: false,
          district: null,
          state: null,
          raw: data,
        };
      }

      return {
        success: true,
        serviceable: true,
        cashOnDelivery: code.cod === "Y",
        district: code.district || code.district_name || null,
        state: code.state || code.state_code || null,
        raw: data,
      };
    } catch (err) {
      console.error("Delhivery API error:", err);
      return {
        success: false,
        message: "Unable to connect to Delhivery API. Please try again later.",
      };
    }
  },
});
