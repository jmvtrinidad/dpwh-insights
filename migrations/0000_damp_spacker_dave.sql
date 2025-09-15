-- Tables already exist, only adding indexes
CREATE INDEX "IDX_projects_region" ON "projects" USING btree ("region");--> statement-breakpoint
CREATE INDEX "IDX_projects_implementing_office" ON "projects" USING btree ("implementing_office");--> statement-breakpoint
CREATE INDEX "IDX_projects_province" ON "projects" USING btree ("province");--> statement-breakpoint
CREATE INDEX "IDX_projects_municipality" ON "projects" USING btree ("municipality");--> statement-breakpoint
CREATE INDEX "IDX_projects_barangay" ON "projects" USING btree ("barangay");--> statement-breakpoint
CREATE INDEX "IDX_projects_status" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_projects_year" ON "projects" USING btree ("year");--> statement-breakpoint
CREATE INDEX "IDX_projects_contract_name" ON "projects" USING btree ("contract_name");--> statement-breakpoint
CREATE INDEX "IDX_projects_contractor" ON "projects" USING btree ("contractor");
