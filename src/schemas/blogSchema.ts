import { z } from 'zod';

const blogSchema = z.object({
  user_id: z.number().int().nonnegative().describe("User ID must be a non-negative integer"),
  title: z.string().max(55, "Title must be 55 characters or less").min(10, "Title must be atleast 10 characters"),
  img: z.string().max(255, "Image URL must be 255 characters or less"),
  published_at: z.string().transform((str) => new Date(str)).describe("Published date must be in datetime format").optional(),
  likes: z.number().int().nonnegative().default(0).describe("Likes must be a non-negative integer").optional(),
  content: z.string().describe("Content is required"),
  comments_count: z.number().int().nonnegative().default(0).describe("Comments count must be a non-negative integer").optional(),
  category_id: z.number().int().nonnegative().describe("Category ID must be a non-negative integer"),
});

export { blogSchema };