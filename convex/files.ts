import { mutation } from "./_generated/server";

// To generate a short-lived upload URL for a file
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
