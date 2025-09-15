import { type User, type UpsertUser, type Project, type InsertProject, type UpdateProject, projects, users } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, inArray } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  getProject(contractId: string): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(contractId: string, project: UpdateProject): Promise<Project | undefined>;
  deleteProject(contractId: string): Promise<boolean>;
  createManyProjects(projects: InsertProject[]): Promise<Project[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === username,
    );
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const now = new Date();
    const existingUser = this.users.get(userData.id!);
    
    const user: User = {
      ...userData,
      id: userData.id!,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: existingUser?.createdAt || now,
      updatedAt: now,
    };
    
    this.users.set(user.id, user);
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const now = new Date();
    const user: User = {
      ...userData,
      id: userData.id || randomUUID(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(user.id, user);
    return user;
  }

  // Project operations
  async getProject(contractId: string): Promise<Project | undefined> {
    return this.projects.get(contractId);
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const project: Project = {
      ...insertProject,
      sourceOfFundsDesc: insertProject.sourceOfFundsDesc || "",
      sourceOfFundsYear: insertProject.sourceOfFundsYear || "",
      sourceOfFundsSource: insertProject.sourceOfFundsSource || "",
      province: insertProject.province || "",
      municipality: insertProject.municipality || "",
      barangay: insertProject.barangay || "",
    };
    this.projects.set(project.contractId, project);
    return project;
  }

  async updateProject(contractId: string, updateProject: UpdateProject): Promise<Project | undefined> {
    const existingProject = this.projects.get(contractId);
    if (!existingProject) {
      return undefined;
    }
    const updatedProject: Project = { ...existingProject, ...updateProject };
    this.projects.set(contractId, updatedProject);
    return updatedProject;
  }

  async deleteProject(contractId: string): Promise<boolean> {
    return this.projects.delete(contractId);
  }

  async createManyProjects(insertProjects: InsertProject[]): Promise<Project[]> {
    const projects: Project[] = [];
    for (const insertProject of insertProjects) {
      const project: Project = {
        ...insertProject,
        sourceOfFundsDesc: insertProject.sourceOfFundsDesc || "",
        sourceOfFundsYear: insertProject.sourceOfFundsYear || "",
        sourceOfFundsSource: insertProject.sourceOfFundsSource || "",
        province: insertProject.province || "",
        municipality: insertProject.municipality || "",
        barangay: insertProject.barangay || "",
      };
      this.projects.set(project.contractId, project);
      projects.push(project);
    }
    return projects;
  }
}

export class DbStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, username)).limit(1);
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const now = new Date();
    const userToInsert = {
      ...userData,
      id: userData.id!,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.insert(users)
      .values(userToInsert)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email || null,
          firstName: userData.firstName || null,
          lastName: userData.lastName || null,
          profileImageUrl: userData.profileImageUrl || null,
          updatedAt: now,
        }
      })
      .returning();
    
    return result[0];
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const now = new Date();
    const userToInsert = {
      ...userData,
      id: userData.id || randomUUID(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.insert(users).values(userToInsert).returning();
    return result[0];
  }

  // Project operations
  async getProject(contractId: string): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.contractId, contractId)).limit(1);
    return result[0];
  }

  async getAllProjects(): Promise<Project[]> {
    const result = await db.select().from(projects);
    return result;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const projectToInsert = {
      ...insertProject,
      sourceOfFundsDesc: insertProject.sourceOfFundsDesc || "",
      sourceOfFundsYear: insertProject.sourceOfFundsYear || "",
      sourceOfFundsSource: insertProject.sourceOfFundsSource || "",
      province: insertProject.province || "",
      municipality: insertProject.municipality || "",
      barangay: insertProject.barangay || "",
    };

    const result = await db.insert(projects)
      .values(projectToInsert)
      .onConflictDoUpdate({
        target: projects.contractId,
        set: projectToInsert
      })
      .returning();
    
    return result[0];
  }

  async updateProject(contractId: string, updateProject: UpdateProject): Promise<Project | undefined> {
    const result = await db.update(projects)
      .set(updateProject)
      .where(eq(projects.contractId, contractId))
      .returning();
    
    return result[0];
  }

  async deleteProject(contractId: string): Promise<boolean> {
    const result = await db.delete(projects)
      .where(eq(projects.contractId, contractId))
      .returning();
    
    return result.length > 0;
  }

  async createManyProjects(insertProjects: InsertProject[]): Promise<Project[]> {
    if (insertProjects.length === 0) {
      return [];
    }

    const projectsToInsert = insertProjects.map(insertProject => ({
      ...insertProject,
      sourceOfFundsDesc: insertProject.sourceOfFundsDesc || "",
      sourceOfFundsYear: insertProject.sourceOfFundsYear || "",
      sourceOfFundsSource: insertProject.sourceOfFundsSource || "",
      province: insertProject.province || "",
      municipality: insertProject.municipality || "",
      barangay: insertProject.barangay || "",
    }));

    // Use upsert approach for batch insertion
    const result = [];
    
    // Process in batches to avoid potential query size limits
    const batchSize = 100;
    for (let i = 0; i < projectsToInsert.length; i += batchSize) {
      const batch = projectsToInsert.slice(i, i + batchSize);
      
      for (const project of batch) {
        const insertResult = await db.insert(projects)
          .values(project)
          .onConflictDoUpdate({
            target: projects.contractId,
            set: project
          })
          .returning();
        
        if (insertResult[0]) {
          result.push(insertResult[0]);
        }
      }
    }
    
    return result;
  }
}

// Use database storage instead of memory storage
export const storage = new DbStorage();
