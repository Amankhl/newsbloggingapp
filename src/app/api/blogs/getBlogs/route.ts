import { NextResponse, NextRequest } from 'next/server';
import pool from "@/lib/db";
import { sortbyQuerySchema } from '@/schemas/blogSchema';
import { RowDataPacket } from 'mysql2';


export async function GET(req: NextRequest) {
    try {
    //make sure that you are also sending the sortby in the search params so that they can sort blogs
    const { searchParams } = new URL(req.url);
    const queryParam = {
        sortby: searchParams.get('sortby')    //query param should be like sortby=likes
    }
    //validate with zod
    const parsedVal = sortbyQuerySchema.safeParse(queryParam)

    if(!parsedVal.success){
        const sortbyErrors = parsedVal.error.format().sortby?._errors || [];
        return NextResponse.json({success: false, error: parsedVal.error.message, message: sortbyErrors?.length > 0 ? sortbyErrors.join(", ") : "Invalid query parameters" }, { status: 400 });
    }

    const {sortby} = parsedVal.data;

    switch (sortby) {
        case "comments":
            const [sortbyCommentsResult] = await pool.execute<RowDataPacket[]>('SELECT * FROM blogs WHERE comments IS NOT NULL ORDER BY comments DESC');
            return NextResponse.json({success: true, message: "Blogs sorted by comments", data: sortbyCommentsResult}, {status: 200}) 

        case "likes":
            const [sortbyLikesResult] = await pool.execute<RowDataPacket[]>('SELECT * FROM blogs WHERE likes IS NOT NULL ORDER BY likes DESC');
            return NextResponse.json({success: true, message: "Blogs sorted by likes", data: sortbyLikesResult}, {status: 200}) 

        case "latest":
            const [sortbyLatestResult] = await pool.execute<RowDataPacket[]>('SELECT * FROM blogs WHERE published_at IS NOT NULL ORDER BY published_at DESC');
            return NextResponse.json({success: true, message: "Blogs sorted sorted by latest", data: sortbyLatestResult}, {status: 200}) 

        default:
            break;
    }
        
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Couldn't find any blog for some reason",
            error: error
        },{status: 500}
    )   
    }  
}