import pool from '@/lib/db';
import { NextResponse, NextRequest } from 'next/server';
import { RowDataPacket } from 'mysql2';
import { verifyemailSchema } from '@/schemas/userSchemas/verifyemailSchema';

export async function POST(req: NextRequest){
    try {
        const { username, code} = await req.json();

        const { code: validCode } = verifyemailSchema.parse({ code });  // sending code in a object so it work with the defined schema which was defined for object
        //destructuring and renaming the value
        
        const decodedUsername = decodeURIComponent(username);  // sometimes the space or other characters denoted as %20%

        const [userByUsername] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM users WHERE username = ?',
            [decodedUsername]
        );
        if(userByUsername.length === 0){
            return NextResponse.json({
                success: false,
                error: "User not found",
            }, { status: 404 })
        }

        const user = userByUsername[0];
        const isCodeCorrect = user.verifyCode === validCode
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if(isCodeCorrect && isCodeNotExpired){
            await pool.execute<RowDataPacket[]>(
                'UPDATE users SET isVerified = 1, verifyCode = NULL, verifyCodeExpiry = NULL WHERE username = ?',
                [decodedUsername]
            );
            return NextResponse.json({
                success: true,
                message: "Account Verified Successfully"
            },{status: 200})
        }else if(!isCodeNotExpired){
            return NextResponse.json({
                success: false,
                message: "Verification code has expired, please signup again"
            },{status: 400})
        }else{
            return NextResponse.json({
                success: false,
                message: "Verification code is incorrect"
            },{status: 400})
        }


    } catch (error) {
        console.log("Error verifying user", error)
        return NextResponse.json({
            success: false,
            error: "An error occurred while verifying user",
        }, { status: 500 })
    }
}