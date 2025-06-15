import {
  users,
  blogs,
  type User,
  type UpsertUser,
  type Blog,
  type InsertBlog,
  type UpdateBlog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, sql, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  
  // Blog operations
  getBlogs(options: { page: number; limit: number; tag?: string; search?: string }): Promise<(Blog & { author: User })[]>;
  getBlog(id: number): Promise<(Blog & { author: User }) | undefined>;
  createBlog(blog: InsertBlog): Promise<Blog>;
  updateBlog(id: number, updates: UpdateBlog): Promise<Blog>;
  deleteBlog(id: number): Promise<void>;
  likeBlog(id: number): Promise<Blog>;
  getUserBlogs(userId: string, options: { page: number; limit: number }): Promise<(Blog & { author: User })[]>;
  getAllTags(): Promise<string[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Blog operations
  async getBlogs(options: { page: number; limit: number; tag?: string; search?: string }): Promise<(Blog & { author: User })[]> {
    let query = db
      .select({
        id: blogs.id,
        title: blogs.title,
        content: blogs.content,
        excerpt: blogs.excerpt,
        tags: blogs.tags,
        authorId: blogs.authorId,
        published: blogs.published,
        featuredImage: blogs.featuredImage,
        readTime: blogs.readTime,
        likes: blogs.likes,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
        author: users,
      })
      .from(blogs)
      .leftJoin(users, eq(blogs.authorId, users.id))
      .where(eq(blogs.published, true))
      .orderBy(desc(blogs.createdAt));

    if (options.tag) {
      query = query.where(sql`${options.tag} = ANY(${blogs.tags})`);
    }

    if (options.search) {
      query = query.where(
        or(
          ilike(blogs.title, `%${options.search}%`),
          ilike(blogs.content, `%${options.search}%`)
        )
      );
    }

    const offset = (options.page - 1) * options.limit;
    const results = await query.limit(options.limit).offset(offset);

    return results.map(row => ({
      ...row,
      author: row.author || {
        id: '',
        email: null,
        firstName: null,
        lastName: null,
        profileImageUrl: null,
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }));
  }

  async getBlog(id: number): Promise<(Blog & { author: User }) | undefined> {
    const [result] = await db
      .select({
        id: blogs.id,
        title: blogs.title,
        content: blogs.content,
        excerpt: blogs.excerpt,
        tags: blogs.tags,
        authorId: blogs.authorId,
        published: blogs.published,
        featuredImage: blogs.featuredImage,
        readTime: blogs.readTime,
        likes: blogs.likes,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
        author: users,
      })
      .from(blogs)
      .leftJoin(users, eq(blogs.authorId, users.id))
      .where(eq(blogs.id, id));

    if (!result) return undefined;

    return {
      ...result,
      author: result.author || {
        id: '',
        email: null,
        firstName: null,
        lastName: null,
        profileImageUrl: null,
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    };
  }

  async createBlog(blog: InsertBlog): Promise<Blog> {
    const [newBlog] = await db
      .insert(blogs)
      .values(blog)
      .returning();
    return newBlog;
  }

  async updateBlog(id: number, updates: UpdateBlog): Promise<Blog> {
    const [blog] = await db
      .update(blogs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogs.id, id))
      .returning();
    return blog;
  }

  async deleteBlog(id: number): Promise<void> {
    await db.delete(blogs).where(eq(blogs.id, id));
  }

  async likeBlog(id: number): Promise<Blog> {
    const [blog] = await db
      .update(blogs)
      .set({ likes: sql`${blogs.likes} + 1` })
      .where(eq(blogs.id, id))
      .returning();
    return blog;
  }

  async getUserBlogs(userId: string, options: { page: number; limit: number }): Promise<(Blog & { author: User })[]> {
    const offset = (options.page - 1) * options.limit;
    
    const results = await db
      .select({
        id: blogs.id,
        title: blogs.title,
        content: blogs.content,
        excerpt: blogs.excerpt,
        tags: blogs.tags,
        authorId: blogs.authorId,
        published: blogs.published,
        featuredImage: blogs.featuredImage,
        readTime: blogs.readTime,
        likes: blogs.likes,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
        author: users,
      })
      .from(blogs)
      .leftJoin(users, eq(blogs.authorId, users.id))
      .where(eq(blogs.authorId, userId))
      .orderBy(desc(blogs.createdAt))
      .limit(options.limit)
      .offset(offset);

    return results.map(row => ({
      ...row,
      author: row.author || {
        id: '',
        email: null,
        firstName: null,
        lastName: null,
        profileImageUrl: null,
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }));
  }

  async getAllTags(): Promise<string[]> {
    const result = await db
      .select({ tags: blogs.tags })
      .from(blogs)
      .where(eq(blogs.published, true));

    const allTags = new Set<string>();
    result.forEach(row => {
      if (row.tags) {
        row.tags.forEach(tag => allTags.add(tag));
      }
    });

    return Array.from(allTags);
  }
}

export const storage = new DatabaseStorage();