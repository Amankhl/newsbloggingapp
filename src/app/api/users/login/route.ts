import bcrypt from "bcryptjs";
import pool, {loginUser} from '@/lib/db';
import { loginSchema } from "@/schemas/userSchemas/loginSchema";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"


export async function POST(req: NextRequest) {

    try {
        const body = await req.json();
        const user = loginSchema.parse(body) as loginUser;
        const [rows] = await pool.execute<RowDataPacket[]>(
            "SELECT * FROM users WHERE email=? OR username=?",
            [user.identifier , user.identifier]
        );
    
         // Check if the user exists
        if (rows.length === 0) {
            throw new Error("User not found with this email or username");
        }
        const dbUser = rows[0];
    
        // Check if the user is verified
        if (dbUser.isVerified === 0) {
            throw new Error("Please verify your account first");
        }
        // Now authetication begins. Check the user and check if the password is correct
        const isPasswordCorrect = await bcrypt.compare(user.password, dbUser.password);
    
        if (!isPasswordCorrect) {
            return NextResponse.json({ success: false, message: 'Incorrect password' }, { status: 400 });
        }

        interface TokenData {
            id: number;
            username: string;
            email: string;
            isVerified: number;
        }

        const tokenData: TokenData = {  // for payload data.
            id: dbUser.uid,
            username: dbUser.username,
            email: dbUser.email,
            isVerified: dbUser.isVerified
        }

        const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {expiresIn: "1d"})

        const response = NextResponse.json({ success: true, message: 'Login successful' }, { status: 200 });

        response.cookies.set("token", token, {
            httpOnly: true, // 
            // secure: true,  // only send cookie over https
            // sameSite: "strict", // only send cookie to same site
        })

        return response

    } catch (error) {
        console.error("Failed to login ", error);
        return NextResponse.json({ success: false, message: "Failed to login. " + (error as Error).message, error }, { status: 500 });
    }

}
