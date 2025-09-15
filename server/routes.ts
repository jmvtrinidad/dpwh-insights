import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, updateProjectSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import { randomBytes } from "crypto";
import cookieParser from "cookie-parser";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication first
  await setupAuth(app);
  
  // Setup cookie parser for CSRF
  app.use(cookieParser());
  
  // Custom CSRF protection middleware
  const csrfProtection = (req: any, res: any, next: any) => {
    // Exempt safe HTTP methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }
    
    const token = req.headers['x-csrf-token'];
    const cookieToken = req.cookies['csrf-token'];
    
    if (!token || !cookieToken || token !== cookieToken) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    
    next();
  };
  
  // Configure multer for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      // Only allow JSON files
      if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
        cb(null, true);
      } else {
        cb(new Error('Only JSON files are allowed'));
      }
    }
  });

  // CSRF token endpoint (for authenticated users)
  app.get('/api/csrf-token', isAuthenticated, (req, res) => {
    const token = randomBytes(32).toString('hex');
    res.cookie('csrf-token', token, {
      httpOnly: false, // Needs to be readable by JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    res.json({ csrfToken: token });
  });
  
  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // If user doesn't exist in storage (e.g., after server restart), 
      // create from session claims to maintain login state
      if (!user) {
        const claims = req.user.claims;
        user = await storage.upsertUser({
          id: claims.sub,
          email: claims.email,
          firstName: claims.first_name,
          lastName: claims.last_name,
          profileImageUrl: claims.profile_image_url,
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Project routes
  
  // Get all projects (public for viewing)
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

  // Create a new project (protected with CSRF)
  app.post("/api/projects", isAuthenticated, csrfProtection, async (req, res) => {
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

  // Upload projects from JSON file (protected with CSRF)
  app.post("/api/projects/upload", isAuthenticated, csrfProtection, upload.single('file'), async (req, res) => {
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

  // Update project (protected with CSRF and validation)
  app.put("/api/projects/:contractId", isAuthenticated, csrfProtection, async (req, res) => {
    try {
      const { contractId } = req.params;
      
      // Validate the request body
      const updateData = updateProjectSchema.parse(req.body);
      
      const updatedProject = await storage.updateProject(contractId, updateData);
      
      if (!updatedProject) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid project data", details: error.errors });
      }
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Delete project (protected with CSRF)
  app.delete("/api/projects/:contractId", isAuthenticated, csrfProtection, async (req, res) => {
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

  
  // Handle multer errors (must be after routes)
  app.use((error: any, req: any, res: any, next: any) => {
    if (error instanceof multer.MulterError || error.message === 'Only JSON files are allowed') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  });

  const httpServer = createServer(app);

  return httpServer;
}
