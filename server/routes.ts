import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { storage } from './storage';
import { insertProjectSchema, updateProjectSchema } from '@shared/schema';
import { setupAuth, isAuthenticated } from './replitAuth';
import multer from 'multer';
import { randomBytes } from 'crypto';
import cookieParser from 'cookie-parser';
import { z } from 'zod';

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication first
  await setupAuth(app);

  // Setup cookie parser for CSRF
  app.use(cookieParser());

  // Custom CSRF protection middleware
  const csrfProtection = (req: any, res: any, next: any) => {
    // Bypass CSRF protection in development mode
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

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

  // Admin authorization middleware
  const AUTHORIZED_ADMIN_EMAILS = [
    'jmvtrinidad16@gmail.com',
    'borromeosherlynes@gmail.com',
    'janmvtrinidad@gmail.com',
  ];

  const isAuthorizedAdmin = async (req: any, res: any, next: any) => {
    console.log(
      'isAuthorizedAdmin middleware called, NODE_ENV:',
      process.env.NODE_ENV
    );
    console.log('req.user:', req.user);

    // Bypass admin authorization in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Bypassing admin authorization in development mode');
      return next();
    }

    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.email) {
        return res
          .status(403)
          .json({ error: 'User not found or email not available' });
      }

      if (!AUTHORIZED_ADMIN_EMAILS.includes(user.email)) {
        return res
          .status(403)
          .json({
            error:
              'Admin access denied. Only authorized administrators can perform this action.',
          });
      }

      next();
    } catch (error) {
      console.error('Admin authorization error:', error);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: process.env.NODE_ENV === 'development' ? {} : { fileSize: 10 * 1024 * 1024 }, // No limit in development
    fileFilter: (req, file, cb) => {
      // Bypass file type check in development
      if (process.env.NODE_ENV === 'development') {
        return cb(null, true);
      }

      // Only allow JSON files in production
      if (
        file.mimetype === 'application/json' ||
        file.originalname.endsWith('.json')
      ) {
        cb(null, true);
      } else {
        cb(new Error('Only JSON files are allowed'));
      }
    },
  });

  // CSRF token endpoint (for authenticated users)
  app.get('/api/csrf-token', isAuthenticated, (req, res) => {
    const token = randomBytes(32).toString('hex');
    res.cookie('csrf-token', token, {
      httpOnly: false, // Needs to be readable by JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
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
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  // Project routes

  // Get all projects (public for viewing)
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  // Get filtered projects (public for viewing)
  app.get('/api/projects/filtered', async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string,
        region: req.query.region as string,
        implementingOffice: req.query.implementingOffice as string,
        contractor: req.query.contractor as string,
        status: req.query.status as string,
        year: req.query.year ? (req.query.year as string).split(',') : undefined,
        province: req.query.province as string,
        municipality: req.query.municipality as string,
        barangay: req.query.barangay as string,
      };

      const projects = await storage.getFilteredProjects(filters);
      res.json(projects);
    } catch (error) {
      console.error('Error fetching filtered projects:', error);
      res.status(500).json({ error: 'Failed to fetch filtered projects' });
    }
  });

  // Get project by contract ID
  app.get('/api/projects/:contractId', async (req, res) => {
    try {
      const { contractId } = req.params;
      const project = await storage.getProject(contractId);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  });

  // Create a new project (protected with CSRF)
  app.post(
    '/api/projects',
    isAuthenticated,
    csrfProtection,
    async (req, res) => {
      try {
        const projectData = insertProjectSchema.parse(req.body);
        const project = await storage.createProject(projectData);
        res.status(201).json(project);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: 'Invalid project data', details: error.errors });
        }
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
      }
    }
  );

  // Check if user is authorized admin
  app.get('/api/auth/admin-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.json({ isAdmin: false });
      }

      const user = await storage.getUser(userId);
      const isAdmin =
        user && user.email && AUTHORIZED_ADMIN_EMAILS.includes(user.email);

      res.json({ isAdmin: !!isAdmin });
    } catch (error) {
      console.error('Admin status check error:', error);
      res.json({ isAdmin: false });
    }
  });

  // Upload projects from JSON file (protected with CSRF and admin authorization)
  app.post(
    '/api/projects/upload',
    isAuthenticated,
    isAuthorizedAdmin,
    csrfProtection,
    upload.single('file'),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileContent = req.file.buffer.toString('utf8');
        let projectsData;

        try {
          projectsData = JSON.parse(fileContent);
        } catch (parseError) {
          return res.status(400).json({ error: 'Invalid JSON file' });
        }

        // Ensure it's an array
        const projects = Array.isArray(projectsData)
          ? projectsData
          : [projectsData];

        const totalCount = projects.length;
        let successCount = 0;
        let failureCount = 0;

        // Set up Server-Sent Events for progress updates
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control',
        });

        // Send initial progress
        res.write(`data: ${JSON.stringify({
          type: 'progress',
          processed: 0,
          total: totalCount,
          successCount: 0,
          failureCount: 0,
          message: 'Starting upload...'
        })}\n\n`);

        const batchSize = 100; // Process in batches of 100

        for (let i = 0; i < projects.length; i += batchSize) {
          const batch = projects.slice(i, i + batchSize);
          const batchValidatedProjects = [];

          // Validate batch
          for (let j = 0; j < batch.length; j++) {
            const projectIndex = i + j;
            try {
              const validatedProject = insertProjectSchema.parse(batch[j]);
              batchValidatedProjects.push(validatedProject);
            } catch (error) {
              failureCount++;
              if (error instanceof z.ZodError) {
                console.error(`Validation error for project ${projectIndex}:`, {
                  contractId: batch[j]?.contractId || 'unknown',
                  errors: error.errors
                });
              } else {
                console.error(`Unknown validation error for project ${projectIndex}:`, {
                  contractId: batch[j]?.contractId || 'unknown',
                  error: error instanceof Error ? error.message : String(error)
                });
              }
            }
          }

          // Save valid projects in this batch
          if (batchValidatedProjects.length > 0) {
            try {
              const savedProjects = await storage.createManyProjects(batchValidatedProjects);
              successCount += savedProjects.length;
            } catch (error) {
              console.error('Error saving batch:', error);
              failureCount += batchValidatedProjects.length;
            }
          }

          // Send progress update
          const processed = Math.min(i + batchSize, totalCount);
          res.write(`data: ${JSON.stringify({
            type: 'progress',
            processed,
            total: totalCount,
            successCount,
            failureCount,
            message: `Processed ${processed}/${totalCount} projects...`
          })}\n\n`);

          // Small delay to prevent overwhelming the client
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Send completion message
        res.write(`data: ${JSON.stringify({
          type: 'complete',
          totalCount,
          successCount,
          failureCount,
          message: `Upload completed. ${successCount} successful, ${failureCount} failed.`
        })}\n\n`);

        res.end();

      } catch (error) {
        console.error('Error uploading projects:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to upload projects' });
        } else {
          // If headers already sent (SSE started), send error through SSE
          res.write(`data: ${JSON.stringify({
            type: 'error',
            message: 'Upload failed due to server error'
          })}\n\n`);
          res.end();
        }
      }
    }
  );

  // Update project (protected with CSRF and validation)
  app.put(
    '/api/projects/:contractId',
    isAuthenticated,
    csrfProtection,
    async (req, res) => {
      try {
        const { contractId } = req.params;

        // Validate the request body
        const updateData = updateProjectSchema.parse(req.body);

        const updatedProject = await storage.updateProject(
          contractId,
          updateData
        );

        if (!updatedProject) {
          return res.status(404).json({ error: 'Project not found' });
        }

        res.json(updatedProject);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: 'Invalid project data', details: error.errors });
        }
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
      }
    }
  );

  // Delete project (protected with CSRF)
  app.delete(
    '/api/projects/:contractId',
    isAuthenticated,
    csrfProtection,
    async (req, res) => {
      try {
        const { contractId } = req.params;
        const deleted = await storage.deleteProject(contractId);

        if (!deleted) {
          return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ message: 'Project deleted successfully' });
      } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
      }
    }
  );

  // Get contractors with search and pagination
  app.get('/api/contractors', async (req, res) => {
    try {
      const { search, limit, offset } = req.query;
      const limitNum = limit ? parseInt(limit as string) : 50;
      const offsetNum = offset ? parseInt(offset as string) : 0;

      const result = await storage.getContractors(
        search as string,
        limitNum,
        offsetNum
      );

      res.json(result);
    } catch (error) {
      console.error('Error fetching contractors:', error);
      res.status(500).json({ error: 'Failed to fetch contractors' });
    }
  });

  // Reset database (development only)
  app.post('/api/reset-db', async (req, res) => {
    try {
      if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ error: 'Reset only available in development' });
      }

      await storage.resetDatabase();
      res.json({ message: 'Database reset successfully' });
    } catch (error) {
      console.error('Error resetting database:', error);
      res.status(500).json({ error: 'Failed to reset database' });
    }
  });

  // Handle multer errors (must be after routes)
  app.use((error: any, req: any, res: any, next: any) => {
    if (
      error instanceof multer.MulterError ||
      error.message === 'Only JSON files are allowed'
    ) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  });

  const httpServer = createServer(app);

  return httpServer;
}
