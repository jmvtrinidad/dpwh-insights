import { type User, type UpsertUser, type Project, type InsertProject, type UpdateProject, projects, users } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, inArray, sql, and } from "drizzle-orm";

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
  getFilteredProjects(filters: {
    search?: string;
    region?: string;
    implementingOffice?: string;
    contractor?: string;
    status?: string;
    year?: string[];
    province?: string;
    municipality?: string;
    barangay?: string;
  }): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(contractId: string, project: UpdateProject): Promise<Project | undefined>;
  deleteProject(contractId: string): Promise<boolean>;
  createManyProjects(projects: InsertProject[]): Promise<Project[]>;
  getContractors(search?: string, limit?: number, offset?: number): Promise<{ contractors: string[]; total: number }>;
  resetDatabase(): Promise<void>;
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

  async getFilteredProjects(filters: {
    search?: string;
    region?: string;
    implementingOffice?: string;
    contractor?: string;
    status?: string;
    year?: string[];
    province?: string;
    municipality?: string;
    barangay?: string;
  }): Promise<Project[]> {
    let projects = Array.from(this.projects.values());

    // Apply search filter
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase();
      projects = projects.filter(project => {
        const searchableFields = [
          project.contractName?.toLowerCase() || '',
          ...project.contractor.map(c => c.toLowerCase()),
          project.implementingOffice?.toLowerCase() || ''
        ];
        return searchableFields.some(field => field.includes(searchTerm));
      });
    }

    // Apply other filters
    projects = projects.filter(project => {
      if (filters.region && filters.region !== '__all__' && project.region !== filters.region) return false;
      if (filters.implementingOffice && filters.implementingOffice !== '__all__' && project.implementingOffice !== filters.implementingOffice) return false;
      if (filters.contractor && filters.contractor !== '__all__' && !project.contractor.includes(filters.contractor)) return false;
      if (filters.status && filters.status !== '__all__' && project.status !== filters.status) return false;
      if (filters.year && filters.year.length > 0 && !filters.year.includes(project.year)) return false;
      if (filters.province && filters.province !== '__all__' && project.province !== filters.province) return false;
      if (filters.municipality && filters.municipality !== '__all__' && project.municipality !== filters.municipality) return false;
      if (filters.barangay && filters.barangay !== '__all__' && project.barangay !== filters.barangay) return false;
      return true;
    });

    return projects;
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

  async getContractors(search?: string, limit?: number, offset?: number): Promise<{ contractors: string[]; total: number }> {
    const allContractors = Array.from(this.projects.values())
      .flatMap(project => project.contractor)
      .filter(Boolean);

    const uniqueContractors = Array.from(new Set(allContractors)).sort();

    let filtered = uniqueContractors;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = uniqueContractors.filter(contractor =>
        contractor.toLowerCase().includes(searchLower)
      );
    }

    const total = filtered.length;
    const start = offset || 0;
    const end = limit ? start + limit : filtered.length;
    const contractors = filtered.slice(start, end);

    return { contractors, total };
  }

  async resetDatabase(): Promise<void> {
    this.users.clear();
    this.projects.clear();
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
    try {
      const result = await db.select().from(projects);
      console.log('DbStorage.getAllProjects returning', result.length, 'projects');
      return result;
    } catch (error) {
      console.error('DbStorage.getAllProjects error:', error);
      throw error;
    }
  }

  async getFilteredProjects(filters: {
    search?: string;
    region?: string;
    implementingOffice?: string;
    contractor?: string;
    status?: string;
    year?: string[];
    province?: string;
    municipality?: string;
    barangay?: string;
  }): Promise<Project[]> {
    try {
      // For now, get all projects and filter in memory
      // This is simpler and works, we can optimize with SQL queries later
      const allProjects = await this.getAllProjects();
      let projects = allProjects;

      // Apply search filter
      if (filters.search && filters.search.trim() !== '') {
        const searchTerm = filters.search.toLowerCase();
        projects = projects.filter(project => {
          const searchableFields = [
            project.contractName?.toLowerCase() || '',
            ...project.contractor.map(c => c.toLowerCase()),
            project.implementingOffice?.toLowerCase() || ''
          ];
          return searchableFields.some(field => field.includes(searchTerm));
        });
      }

      // Apply other filters
      projects = projects.filter(project => {
        if (filters.region && filters.region !== '__all__' && project.region !== filters.region) return false;
        if (filters.implementingOffice && filters.implementingOffice !== '__all__' && project.implementingOffice !== filters.implementingOffice) return false;
        if (filters.contractor && filters.contractor !== '__all__' && !project.contractor.includes(filters.contractor)) return false;
        if (filters.status && filters.status !== '__all__' && project.status !== filters.status) return false;
        if (filters.year && filters.year.length > 0 && !filters.year.includes(project.year)) return false;
        if (filters.province && filters.province !== '__all__' && project.province !== filters.province) return false;
        if (filters.municipality && filters.municipality !== '__all__' && project.municipality !== filters.municipality) return false;
        if (filters.barangay && filters.barangay !== '__all__' && project.barangay !== filters.barangay) return false;
        return true;
      });

      console.log('DbStorage.getFilteredProjects returning', projects.length, 'filtered projects');
      return projects;
    } catch (error) {
      console.error('DbStorage.getFilteredProjects error:', error);
      throw error;
    }
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    console.log('DbStorage.createProject called with:', insertProject.contractId);
    const projectToInsert = {
      contractId: insertProject.contractId,
      contractName: insertProject.contractName,
      contractor: insertProject.contractor,
      implementingOffice: insertProject.implementingOffice,
      contractCost: insertProject.contractCost,
      contractEffectivityDate: insertProject.contractEffectivityDate,
      contractExpiryDate: insertProject.contractExpiryDate,
      status: insertProject.status,
      accomplishmentInPercentage: insertProject.accomplishmentInPercentage,
      region: insertProject.region,
      sourceOfFundsDesc: insertProject.sourceOfFundsDesc || "",
      sourceOfFundsYear: insertProject.sourceOfFundsYear || "",
      sourceOfFundsSource: insertProject.sourceOfFundsSource || "",
      year: insertProject.year,
      province: insertProject.province || "",
      municipality: insertProject.municipality || "",
      barangay: insertProject.barangay || "",
    };

    try {
      const result = await db.insert(projects)
        .values(projectToInsert)
        .onConflictDoUpdate({
          target: projects.contractId,
          set: projectToInsert
        })
        .returning();

      console.log('DbStorage.createProject result:', result[0]?.contractId);
      return result[0];
    } catch (error) {
      console.error('DbStorage.createProject error:', error);
      throw error;
    }
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
    console.log('DbStorage.createManyProjects called with', insertProjects.length, 'projects');
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

    try {
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

      console.log('DbStorage.createManyProjects successfully saved', result.length, 'projects');
      return result;
    } catch (error) {
      console.error('DbStorage.createManyProjects error:', error);
      throw error;
    }
  }

  async getContractors(search?: string, limit?: number, offset?: number): Promise<{ contractors: string[]; total: number }> {
    try {
      // For now, get all projects and process in memory
      // This is acceptable since contractors are cached and we have pagination
      const allProjects = await this.getAllProjects();

      const allContractors = allProjects.flatMap(project => project.contractor).filter(Boolean);
      const uniqueContractors = Array.from(new Set(allContractors)).sort();

      let filtered = uniqueContractors;
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = uniqueContractors.filter(contractor =>
          contractor.toLowerCase().includes(searchLower)
        );
      }

      const total = filtered.length;
      const start = offset || 0;
      const end = limit ? start + limit : filtered.length;
      const contractors = filtered.slice(start, end);

      return { contractors, total };
    } catch (error) {
      console.error('DbStorage.getContractors error:', error);
      throw error;
    }
  }

  async resetDatabase(): Promise<void> {
    try {
      // Truncate all tables in the correct order (respecting foreign keys)
      await db.delete(projects);
      await db.delete(users);
    } catch (error) {
      console.error('DbStorage.resetDatabase error:', error);
      throw error;
    }
  }
}

// Use database storage instead of memory storage
export const storage = new DbStorage();
