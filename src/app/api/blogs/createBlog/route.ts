import { NextResponse, NextRequest } from 'next/server';
import pool from "@/lib/db";
import { blogSchema, IdQuerySchema } from "@/schemas/blogSchema";
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// only verified registered users can write blogs

export async function POST(req: NextRequest) {
  try {
    //make sure that you are also sending the id if logged in in the search params so that they can write blog in their ID
    const { searchParams } = new URL(req.url);
    const uidParam = searchParams.get('uid');  //query param should be like uid=1
    const queryParam = {
        uid: uidParam ? parseInt(uidParam, 10) : null
    }
    //validate with zod
    const parsedId = IdQuerySchema.safeParse(queryParam)

    if(!parsedId.success){
        const uidErrors = parsedId.error.format().uid?._errors || [];
        return NextResponse.json({success: false, error: parsedId.error.message, message: uidErrors?.length > 0 ? uidErrors.join(", ") : "Invalid query parameters" }, { status: 400 });
    }

    const {uid} = parsedId.data;

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