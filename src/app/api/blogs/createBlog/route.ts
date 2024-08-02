import { NextResponse, NextRequest } from 'next/server';
import pool from "@/lib/db";
import { blogSchema } from "@/schemas/blogSchema";
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import jwt, { JwtPayload } from "jsonwebtoken"

// only verified registered users can write blogs

export async function POST(req: NextRequest) {
  try {
    const tokenCookie = req.cookies.get('token');
    // onlly logged in user can write blogs
      if (!tokenCookie) {
          return NextResponse.json({ success: false, message: 'Please Login first' }, { status: 401 });
      }
      const token = tokenCookie.value;
      // Verify and decode the JWT token
      const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET!) as JwtPayload; // Replace with your actual JWT secret
      // Extract the user ID from the decoded token
      const uid = decodedToken.id;

    const [existingUserByuid] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE uid = ?',
      [uid]
    );

    const body = await req.json();
    const blog = blogSchema.parse(body);

    if (existingUserByuid.length > 0) {
      const existingUser = existingUserByuid[0];
      if (existingUser.isVerified === 0) { // unverified users cannot write blogs
        return NextResponse.json({ success: false, message: 'User is not verified to write a blog' }, { status: 400 });
      }
      else{  // for verified users
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO blogs (user_id ,title, category_id, content, img) VALUES (?, ?, ?, ?, ?)',
            [existingUser.uid, blog.title, blog.category_id, blog.content, blog.img]
        );
        return NextResponse.json({ success: true, message: "You've successfully created a blog", data: result }, {status: 201})
      }
    }else{
      return NextResponse.json({success: false, message: "No User"}, {status: 400})
    }
    
  } catch (error) {
      console.error("Error creating your blog ", error);
      return NextResponse.json({ success: false, message: 'Failed to create this blog ', error }, { status: 500 });
  }
}