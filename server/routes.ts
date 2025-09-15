import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema } from "@shared/schema";
import multer from "multer";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });

  // Project routes
  
  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Get project by contract ID
  app.get("/api/projects/:contractId", async (req, res) => {
    try {
      const { contractId } = req.params;
      const project = await storage.getProject(contractId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Create a new project
  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid project data", details: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Upload projects from JSON file
  app.post("/api/projects/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileContent = req.file.buffer.toString('utf8');
      let projectsData;
      
      try {
        projectsData = JSON.parse(fileContent);
      } catch (parseError) {
        return res.status(400).json({ error: "Invalid JSON file" });
      }

      // Ensure it's an array
      const projects = Array.isArray(projectsData) ? projectsData : [projectsData];
      
      // Validate and transform the data
      const validatedProjects = [];
      const errors = [];
      
      for (let i = 0; i < projects.length; i++) {
        try {
          const validatedProject = insertProjectSchema.parse(projects[i]);
          validatedProjects.push(validatedProject);
        } catch (error) {
          if (error instanceof z.ZodError) {
            errors.push({ index: i, errors: error.errors });
          } else {
            errors.push({ index: i, error: "Unknown validation error" });
          }
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({ 
          error: "Validation failed for some projects", 
          validationErrors: errors,
          validCount: validatedProjects.length,
          totalCount: projects.length
        });
      }

      // Save all valid projects
      const savedProjects = await storage.createManyProjects(validatedProjects);
      
      res.json({ 
        message: "Projects uploaded successfully",
        count: savedProjects.length,
        projects: savedProjects
      });
    } catch (error) {
      console.error("Error uploading projects:", error);
      res.status(500).json({ error: "Failed to upload projects" });
    }
  });

  // Update project
  app.put("/api/projects/:contractId", async (req, res) => {
    try {
      const { contractId } = req.params;
      const updateData = req.body;
      
      const updatedProject = await storage.updateProject(contractId, updateData);
      
      if (!updatedProject) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Delete project
  app.delete("/api/projects/:contractId", async (req, res) => {
    try {
      const { contractId } = req.params;
      const deleted = await storage.deleteProject(contractId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
