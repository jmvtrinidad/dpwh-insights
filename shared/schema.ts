import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Projects table
export const projects = pgTable("projects", {
  contractId: varchar("contract_id").primaryKey(),
  contractName: text("contract_name").notNull(),
  contractor: text("contractor").notNull(),
  implementingOffice: text("implementing_office").notNull(),
  contractCost: numeric("contract_cost").notNull(),
  contractEffectivityDate: text("contract_effectivity_date").notNull(),
  contractExpiryDate: text("contract_expiry_date").notNull(),
  status: text("status").notNull(),
  accomplishmentInPercentage: integer("accomplishment_in_percentage").notNull(),
  region: text("region").notNull(),
  sourceOfFundsDesc: text("source_of_funds_desc"),
  sourceOfFundsYear: text("source_of_funds_year"),
  sourceOfFundsSource: text("source_of_funds_source"),
  year: text("year").notNull(),
  province: text("province"),
  municipality: text("municipality"),
  barangay: text("barangay"),
});

export const insertProjectSchema = createInsertSchema(projects);
export const updateProjectSchema = insertProjectSchema.partial();

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type Project = typeof projects.$inferSelect;
