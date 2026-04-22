import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  googleSheetConnections: defineTable({
    createdAt: v.number(),
    spreadsheetId: v.string(),
    spreadsheetName: v.string(),
    spreadsheetUrl: v.string(),
    updatedAt: v.number(),
    userId: v.string(),
  }).index("by_userId", ["userId"]),
});

export default schema;
