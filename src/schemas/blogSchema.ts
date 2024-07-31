import { z } from 'zod';

const userIdSchema = z.number().int().nonnegative().describe("User ID must be a non-negative integer")

const blogSchema = z.object({
  title: z.string().max(100, "Title must be 100 characters or less").min(30, "Title must be atleast 30 characters"),
  category_id: z.number().int().nonnegative().describe("Category ID must be a non-negative integer"),
  content: z.string().describe("Content is required"),
  img: z.string().max(255, "Image URL must be 255 characters or less"),
});
  
const IdQuerySchema = z.object({
  uid: userIdSchema 
})

const SORTBY_OPTIONS = ["likes", "comments", "latest"] as const;
const sortbyQuerySchema = z.object({
  sortby: z.enum(SORTBY_OPTIONS)
});

export { blogSchema, IdQuerySchema, sortbyQuerySchema };