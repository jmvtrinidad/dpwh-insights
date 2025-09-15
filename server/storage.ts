import { type User, type UpsertUser, type Project, type InsertProject, type UpdateProject } from "@shared/schema";
import { randomUUID } from "crypto";

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

export const storage = new MemStorage();
