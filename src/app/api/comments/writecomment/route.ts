import { NextResponse, NextRequest } from 'next/server';
import pool from "@/lib/db";
import { commentSchema, IdQuerySchema } from '@/schemas/commentSchema';
import { ResultSetHeader } from 'mysql2';
import jwt, { JwtPayload } from 'jsonwebtoken';

export async function POST(req:NextRequest) {
    try {

    const body = await req.json();
    const comment = commentSchema.parse(body);


    // check If the user is logged in and has a token
    const tokenCookie = req.cookies.get('token');

    if (tokenCookie) {
        const token = tokenCookie.value;
        // Verify and decode the JWT token
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET!) as JwtPayload; // Replace with your actual JWT secret
        // Extract the user ID from the decoded token
        const uid = decodedToken.id;

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO comments (comment, user_id, blog_id, parent_cmt_id) VALUES (?, ?, ?, ?)',
            [comment.text, uid, comment.bid, comment.parent_cmt_id || null]
        )
        return NextResponse.json({success: true, message: "you just commented", result },{status: 201})

    }else{
        // for non registered users - they can also comment
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO comments (comment, blog_id, parent_cmt_id) VALUES (?, ?, ?)',
            [comment.text, comment.bid, comment.parent_cmt_id || null]
        )
        return NextResponse.json({success: true, message: "you just commented", result },{status: 201})
    }

    } catch (error) {
        console.log('Error posting comment: ',error)
        return NextResponse.json({
            success: false,
            error: error || "Failed to post comment"
        },{status: 500})
    }
}