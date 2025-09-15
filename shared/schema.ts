import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Valid status values
export const PROJECT_STATUS_VALUES = [
  "Completed",
  "Not Yet Started", 
  "On-Going",
  "Terminated"
] as const;

export type ProjectStatus = typeof PROJECT_STATUS_VALUES[number];

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Projects table
export const projects = pgTable("projects", {
  contractId: varchar("contract_id").primaryKey(),
  contractName: text("contract_name").notNull(),
  contractor: text("contractor").array().notNull(),
  implementingOffice: text("implementing_office").notNull(),
  contractCost: decimal("contract_cost", { precision: 15, scale: 2 }).notNull(),
  contractEffectivityDate: text("contract_effectivity_date").notNull(),
  contractExpiryDate: text("contract_expiry_date").notNull(),
  status: text("status").notNull(),
  accomplishmentInPercentage: integer("accomplishment_in_percentage").notNull(),
  region: text("region").notNull(),
  sourceOfFundsDesc: text("source_of_funds_desc").notNull().default(""),
  sourceOfFundsYear: text("source_of_funds_year").notNull().default(""),
  sourceOfFundsSource: text("source_of_funds_source").notNull().default(""),
  year: text("year").notNull(),
  province: text("province").notNull().default(""),
  municipality: text("municipality").notNull().default(""),
  barangay: text("barangay").notNull().default(""),
});

export const insertProjectSchema = createInsertSchema(projects).extend({
  status: z.string()
    .transform((val) => {
      // Case-insensitive matching for status values
      const normalizedVal = val.trim();
      const found = PROJECT_STATUS_VALUES.find(
        status => status.toLowerCase() === normalizedVal.toLowerCase()
      );
      return found || normalizedVal;
    })
    .pipe(z.enum(PROJECT_STATUS_VALUES)),
  // Handle single contractor or array of contractors
  contractor: z.union([z.string(), z.array(z.string())])
    .transform(val => {
      // Convert single string to array, keep arrays as arrays
      return Array.isArray(val) ? val : [val];
    }),
  // Handle null values for location fields
  province: z.union([z.string(), z.null()]).transform(val => val || ""),
  municipality: z.union([z.string(), z.null()]).transform(val => val || ""),
  barangay: z.union([z.string(), z.null()]).transform(val => val || ""),
  // Handle decimal/float values for contract cost
  contractCost: z.union([z.number(), z.string()])
    .transform(val => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return num.toString();
    })
    .pipe(z.string()),
  // Handle float to integer for accomplishment percentage
  accomplishmentInPercentage: z.union([z.number(), z.string()])
    .transform(val => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return Math.round(num);
    })
    .pipe(z.number().int())
});
export const updateProjectSchema = insertProjectSchema.partial();

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type Project = typeof projects.$inferSelect;
