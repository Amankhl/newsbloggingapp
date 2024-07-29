import {z} from 'zod';

const loginSchema = z.object({
    identifier: z.string(),
    password: z.string(),
});

//we don't need much validations here since we are just checking if the user exists in the database

export { loginSchema }