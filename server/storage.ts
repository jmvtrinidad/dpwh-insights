import { type User, type InsertUser, type Project, type InsertProject, type UpdateProject } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
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
      sourceOfFundsDesc: insertProject.sourceOfFundsDesc ?? null,
      sourceOfFundsYear: insertProject.sourceOfFundsYear ?? null,
      sourceOfFundsSource: insertProject.sourceOfFundsSource ?? null,
      province: insertProject.province ?? null,
      municipality: insertProject.municipality ?? null,
      barangay: insertProject.barangay ?? null,
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
        sourceOfFundsDesc: insertProject.sourceOfFundsDesc ?? null,
        sourceOfFundsYear: insertProject.sourceOfFundsYear ?? null,
        sourceOfFundsSource: insertProject.sourceOfFundsSource ?? null,
        province: insertProject.province ?? null,
        municipality: insertProject.municipality ?? null,
        barangay: insertProject.barangay ?? null,
      };
      this.projects.set(project.contractId, project);
      projects.push(project);
    }
    return projects;
  }
}

export const storage = new MemStorage();
