import {z} from 'zod';

const signupSchema = z.object({
    name: z.string().max(50, "Name must be 50 characters or less").min(3, "Name must be atleast 3 characters"),
    username: z.string().max(20, "Username must be 20 characters or less").min(8, "Username must be atleast 8 characters").regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters"),
    email: z.string().email("Invalid email address").max(55, "Email must be 55 characters or less"),
    password: z.string().max(50, "Password must be 50 characters or less").min(8, "Password must be atleast 8 characters").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
});

// other fields like bio, img can be added as update user database when the user is successfully registered and wants to add details from his profile.

export { signupSchema }