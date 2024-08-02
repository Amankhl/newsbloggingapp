import { NextResponse, NextRequest } from 'next/server';
import pool from "@/lib/db";
import { RowDataPacket } from 'mysql2';
import jwt, { JwtPayload } from 'jsonwebtoken'

export async function GET(req: NextRequest) {
    try {

        const tokenCookie = req.cookies.get('token');

        if (tokenCookie) {
            const token = tokenCookie.value;
            const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET!) as JwtPayload;
            const uid = decodedToken.id;

            const [blogs] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM blogs WHERE user_id = ? ORDER BY published_at DESC',
            [uid]
            );
            return NextResponse.json({success: true, message: "your blogs", data: blogs},{status: 200})
        }else{
            return NextResponse.json({success: false, message: "Please login first"},{status:400})
        }

    } catch (error) {
        return NextResponse.json({success: false, error: error, message: "error fetching all of your blogs"},{status:500})
    }
    
}