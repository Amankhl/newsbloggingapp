import {z} from 'zod';


const commentSchema = z.object({
    bid: z.number().int().nonnegative().describe("Blog ID must be a non-negative integer"),
    text: z.string().describe("text is required"),
    parent_cmt_id: z.number().int().nonnegative().describe("Blog ID must be a non-negative integer").optional()
})

const IdQuerySchema = z.object({
    bid: z.number().int().nonnegative().describe("Blog ID must be a non-negative integer")
})


export {commentSchema, IdQuerySchema}