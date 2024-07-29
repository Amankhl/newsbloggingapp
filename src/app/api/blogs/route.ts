import {NextRequest, NextResponse} from "next/server"
import pool, { Blog }  from '@/lib/db';
import { blogSchema } from '@/schemas/blogSchema';
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { parseBody } from "@/helpers/requestParser";

export async function GET() {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM blogs');
    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await parseBody(req);
    const blogData = blogSchema.parse(body) as Blog;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO blogs (user_id, title, img, likes, content, category_id) VALUES (?, ?, ?, ?, ?, ?)',
      [blogData.user_id, blogData.title, blogData.img, blogData.likes, blogData.content, blogData.category_id]
    );

    return NextResponse.json({ id: result.insertId, ...blogData , data: result}, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
