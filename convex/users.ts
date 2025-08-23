import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Id, Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// Helper query to check if the logged-in user owns a store
// and get their store if they do.
export const getMyStore = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const store = await ctx.db
      .query("stores")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", userId)) 
      .unique();
    
    if (store) {
      const logoUrl = store.storeLogoId ? await ctx.storage.getUrl(store.storeLogoId) : null;
      const bannerUrl = store.storeBannerId ? await ctx.storage.getUrl(store.storeBannerId) : null;
      return { ...store, logoUrl, bannerUrl };
    }
    return null;
  },
});

// Mutation for users to update their own profile (name and phone in 'users' table)
export const updateMyUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()), // New email change functionality
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be logged in to update their profile.");
    }

    const currentUser = await ctx.db.get(userId);
    if (!currentUser) {
      throw new Error("Current user not found.");
    }

    // Get user profile for email change tracking
    let userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    
    // Phone number uniqueness check
    if (args.phone !== undefined && args.phone.trim() !== "") {
      const newPhone = args.phone.trim();
      if (currentUser.phone !== newPhone) {
        const usersWithNewPhone = await ctx.db
          .query("users")
          .withIndex("phone", (q) => q.eq("phone", newPhone))
          .collect();

        for (const user of usersWithNewPhone) {
          if (user._id !== userId) {
            throw new Error("This phone number is already in use by another account.");
          }
        }
      }
    }

    // Email change logic with monthly limit
    if (args.email !== undefined && args.email.trim() !== "" && args.email !== currentUser.email) {
      const newEmail = args.email.trim();
      
      // Check if email is already in use
      const usersWithNewEmail = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", newEmail))
        .collect();

      for (const user of usersWithNewEmail) {
        if (user._id !== userId) {
          throw new Error("This email is already in use by another account.");
        }
      }

      // Check monthly email change limit
      const now = Date.now();
      const currentMonth = new Date(now).getMonth();
      const currentYear = new Date(now).getFullYear();
      
      if (userProfile) {
        const lastReset = userProfile.lastEmailChangeReset || 0;
        const lastResetMonth = new Date(lastReset).getMonth();
        const lastResetYear = new Date(lastReset).getFullYear();
        
        // Reset counter if it's a new month
        if (lastResetMonth !== currentMonth || lastResetYear !== currentYear) {
          await ctx.db.patch(userProfile._id, {
            emailChangesThisMonth: 0,
            lastEmailChangeReset: now,
          });
          userProfile = { ...userProfile, emailChangesThisMonth: 0, lastEmailChangeReset: now };
        }
        
        const changesThisMonth = userProfile.emailChangesThisMonth || 0;
        if (changesThisMonth >= 3) {
          throw new Error("You have reached the maximum of 3 email changes per month. Please try again next month.");
        }
        
        // Update email change history and counter
        const emailHistory = userProfile.emailChangeHistory || [];
        emailHistory.push({
          oldEmail: currentUser.email || "",
          newEmail: newEmail,
          changeDate: now,
        });
        
        await ctx.db.patch(userProfile._id, {
          emailChangeHistory: emailHistory,
          emailChangesThisMonth: changesThisMonth + 1,
        });
      } else {
        // Create profile if it doesn't exist
        await ctx.db.insert("userProfiles", {
          userId: userId,
          addresses: [],
          emailChangeHistory: [{
            oldEmail: currentUser.email || "",
            newEmail: newEmail,
            changeDate: now,
          }],
          emailChangesThisMonth: 1,
          lastEmailChangeReset: now,
        });
      }
    }

    const updates: Partial<Doc<"users">> = {};
    if (args.name !== undefined) {
      updates.name = args.name;
    }
    if (args.phone !== undefined) {
      updates.phone = args.phone.trim() === "" ? undefined : args.phone.trim();
    }
    if (args.email !== undefined && args.email.trim() !== "") {
      updates.email = args.email.trim();
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(userId, updates);
    }
    return { success: true };
  },
});

// Get email change info
export const getEmailChangeInfo = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!userProfile) {
      return { changesThisMonth: 0, maxChanges: 3, canChange: true };
    }

    const now = Date.now();
    const currentMonth = new Date(now).getMonth();
    const currentYear = new Date(now).getFullYear();
    const lastReset = userProfile.lastEmailChangeReset || 0;
    const lastResetMonth = new Date(lastReset).getMonth();
    const lastResetYear = new Date(lastReset).getFullYear();

    let changesThisMonth = userProfile.emailChangesThisMonth || 0;
    
    // Reset if new month
    if (lastResetMonth !== currentMonth || lastResetYear !== currentYear) {
      changesThisMonth = 0;
    }

    return {
      changesThisMonth,
      maxChanges: 3,
      canChange: changesThisMonth < 3,
      emailHistory: userProfile.emailChangeHistory || [],
    };
  },
});

// --- Extended User Profile Functions (userProfiles table) ---

// Define the type for a single address object based on schema for backend use
type UserAddressInternal = {
    id: string;
    type: string;
    street: string;
    area: string;
    pincode: string;
    city: string;
    state: string;
    country: string;
    landmark?: string | undefined; 
    isDefault?: boolean | undefined; 
};

export const getUserProfile = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const userProfileDoc = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!userProfileDoc) {
      return null;
    }

    let profileImageUrl: string | null = null;
    if (userProfileDoc.profileImageId) {
      profileImageUrl = await ctx.storage.getUrl(userProfileDoc.profileImageId);
    }
    
    const addresses: UserAddressInternal[] = userProfileDoc.addresses ?? [];

    return { ...userProfileDoc, profileImageUrl, addresses };
  },
});

export const updateProfileImage = mutation({
  args: { profileImageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated.");

    let userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (userProfile) {
      if (userProfile.profileImageId) {
        await ctx.storage.delete(userProfile.profileImageId);
      }
      await ctx.db.patch(userProfile._id, { profileImageId: args.profileImageId });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: userId,
        profileImageId: args.profileImageId,
        addresses: [],
      });
    }
    return { success: true };
  },
});

export const removeProfileImage = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("User not authenticated.");

        const userProfile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();

        if (userProfile?.profileImageId) {
            await ctx.storage.delete(userProfile.profileImageId);
            await ctx.db.patch(userProfile._id, { profileImageId: undefined });
        }
        return { success: true };
    }
});

const addressArgsValidator = v.object({
  type: v.string(),
  street: v.string(),
  area: v.string(),
  pincode: v.string(),
  city: v.string(),
  state: v.string(),
  country: v.string(),
  landmark: v.optional(v.string()),
  isDefault: v.optional(v.boolean()),
});

export const addAddress = mutation({
  args: { address: addressArgsValidator }, 
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated.");

    let userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    const newAddress: UserAddressInternal = { 
        ...args.address, 
        id: crypto.randomUUID() 
    };

    if (userProfile) {
      const addresses: UserAddressInternal[] = userProfile.addresses || [];
      if (newAddress.isDefault) {
        addresses.forEach(addr => addr.isDefault = false);
      }
      await ctx.db.patch(userProfile._id, { addresses: [...addresses, newAddress] });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: userId,
        addresses: [newAddress],
      });
    }
    return { success: true, addressId: newAddress.id };
  },
});

export const updateAddress = mutation({
  args: { addressId: v.string(), addressData: addressArgsValidator }, 
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated.");

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!userProfile || !userProfile.addresses) throw new Error("Profile or addresses not found.");

    let addressFound = false;
    const updatedAddressDataWithId: UserAddressInternal = { ...args.addressData, id: args.addressId };

    const finalAddresses = userProfile.addresses.map(addr => {
        if (addr.id === args.addressId) {
            addressFound = true;
            return updatedAddressDataWithId;
        }
        if (args.addressData.isDefault) {
            return { ...addr, isDefault: false };
        }
        return addr;
    });

    if (!addressFound) throw new Error("Address not found to update.");
    
    await ctx.db.patch(userProfile._id, { addresses: finalAddresses });
    return { success: true };
  },
});

export const deleteAddress = mutation({
  args: { addressId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated.");

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!userProfile || !userProfile.addresses) throw new Error("Profile or addresses not found.");

    const initialLength = userProfile.addresses.length;
    const addresses = userProfile.addresses.filter(addr => addr.id !== args.addressId);
    
    if (addresses.length === initialLength) {
        // Address not found
    }
    await ctx.db.patch(userProfile._id, { addresses });
    return { success: true };
  },
});

export const setDefaultAddress = mutation({
    args: { addressId: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("User not authenticated.");

        const userProfile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .unique();

        if (!userProfile || !userProfile.addresses) throw new Error("Profile or addresses not found.");
        
        let addressToSetDefaultExists = false;
        const addresses: UserAddressInternal[] = userProfile.addresses.map(addr => {
            if (addr.id === args.addressId) addressToSetDefaultExists = true;
            return {
                ...addr,
                isDefault: addr.id === args.addressId
            }
        });
        
        if (!addressToSetDefaultExists) throw new Error("Address to set as default not found.");

        await ctx.db.patch(userProfile._id, { addresses });
        return { success: true };
    }
});
