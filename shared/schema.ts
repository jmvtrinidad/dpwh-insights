import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
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
  contractor: text("contractor").notNull(),
  implementingOffice: text("implementing_office").notNull(),
  contractCost: integer("contract_cost").notNull(),
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
  status: z.enum(PROJECT_STATUS_VALUES)
});
export const updateProjectSchema = insertProjectSchema.partial();

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type Project = typeof projects.$inferSelect;
