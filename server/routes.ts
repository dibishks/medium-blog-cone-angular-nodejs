import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBlogSchema, updateBlogSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Blog routes
  app.get('/api/blogs', async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const tag = req.query.tag as string;
      const search = req.query.search as string;

      const blogs = await storage.getBlogs({ page, limit, tag, search });
      res.json(blogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ message: "Failed to fetch blogs" });
    }
  });

  app.get('/api/blogs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const blog = await storage.getBlog(id);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      res.json(blog);
    } catch (error) {
      console.error("Error fetching blog:", error);
      res.status(500).json({ message: "Failed to fetch blog" });
    }
  });

  app.post('/api/blogs', isAuthenticated, async (req: any, res) => {
    try {
      const blogData = insertBlogSchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      // Generate excerpt if not provided
      if (!blogData.excerpt && blogData.content) {
        blogData.excerpt = blogData.content.substring(0, 200) + "...";
      }

      // Calculate read time (rough estimate: 200 words per minute)
      if (blogData.content) {
        const wordCount = blogData.content.split(' ').length;
        blogData.readTime = Math.max(1, Math.ceil(wordCount / 200));
      }

      const blog = await storage.createBlog({ ...blogData, authorId: userId });
      res.status(201).json(blog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid blog data", errors: error.errors });
      }
      console.error("Error creating blog:", error);
      res.status(500).json({ message: "Failed to create blog" });
    }
  });

  app.put('/api/blogs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const updateData = updateBlogSchema.parse(req.body);

      // Check if blog exists and user owns it
      const existingBlog = await storage.getBlog(id);
      if (!existingBlog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      if (existingBlog.authorId !== userId) {
        return res.status(403).json({ message: "Not authorized to edit this blog" });
      }

      // Update excerpt if content changed
      if (updateData.content && !updateData.excerpt) {
        updateData.excerpt = updateData.content.substring(0, 200) + "...";
      }

      // Recalculate read time if content changed
      if (updateData.content) {
        const wordCount = updateData.content.split(' ').length;
        updateData.readTime = Math.max(1, Math.ceil(wordCount / 200));
      }

      const blog = await storage.updateBlog(id, updateData);
      res.json(blog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid blog data", errors: error.errors });
      }
      console.error("Error updating blog:", error);
      res.status(500).json({ message: "Failed to update blog" });
    }
  });

  app.delete('/api/blogs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      // Check if blog exists and user owns it
      const existingBlog = await storage.getBlog(id);
      if (!existingBlog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      if (existingBlog.authorId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this blog" });
      }

      await storage.deleteBlog(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting blog:", error);
      res.status(500).json({ message: "Failed to delete blog" });
    }
  });

  // Like/unlike blog
  app.post('/api/blogs/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const blog = await storage.likeBlog(id);
      res.json(blog);
    } catch (error) {
      console.error("Error liking blog:", error);
      res.status(500).json({ message: "Failed to like blog" });
    }
  });

  // Get user's blogs
  app.get('/api/users/:id/blogs', async (req, res) => {
    try {
      const userId = req.params.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const blogs = await storage.getUserBlogs(userId, { page, limit });
      res.json(blogs);
    } catch (error) {
      console.error("Error fetching user blogs:", error);
      res.status(500).json({ message: "Failed to fetch user blogs" });
    }
  });

  // Get user profile
  app.get('/api/users/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.put('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const currentUserId = req.user.claims.sub;

      if (userId !== currentUserId) {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }

      const updateData = {
        bio: req.body.bio,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        profileImageUrl: req.body.profileImageUrl,
      };

      const user = await storage.updateUser(userId, updateData);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Get all tags
  app.get('/api/tags', async (req, res) => {
    try {
      const tags = await storage.getAllTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
