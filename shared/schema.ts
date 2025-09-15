import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
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
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess", { mode: 'json' }).notNull(),
    expire: integer("expire", { mode: 'timestamp' }).notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Projects table
export const projects = sqliteTable("projects", {
  contractId: text("contract_id").primaryKey(),
  contractName: text("contract_name").notNull(),
  contractor: text("contractor", { mode: 'json' }).$type<string[]>().notNull(),
  implementingOffice: text("implementing_office").notNull(),
  contractCost: real("contract_cost").notNull(),
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
}, (table) => [
  // Indexes for filter performance
  index("IDX_projects_region").on(table.region),
  index("IDX_projects_implementing_office").on(table.implementingOffice),
  index("IDX_projects_province").on(table.province),
  index("IDX_projects_municipality").on(table.municipality),
  index("IDX_projects_barangay").on(table.barangay),
  index("IDX_projects_status").on(table.status),
  index("IDX_projects_year").on(table.year),
  index("IDX_projects_contract_name").on(table.contractName),
  // Index for JSON column (contractor)
  index("IDX_projects_contractor").on(table.contractor),
]);

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
      return isNaN(num) ? 0 : num;
    })
    .pipe(z.number()),
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
