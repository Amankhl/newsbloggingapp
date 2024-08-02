import { NextResponse, NextRequest } from 'next/server';
import pool from "@/lib/db";
import { IdQuerySchema } from '@/schemas/commentSchema';
import { RowDataPacket } from 'mysql2';
import jwt, { JwtPayload } from 'jsonwebtoken'

export async function GET(req: NextRequest) {
    try {
        //make sure that you are also sending the blog id in the search params. whenever a user clicks on a blog listed, they get comments to that blog
        const { searchParams } = new URL(req.url);
        const uidParam = searchParams.get('bid');
        const queryParam = {
        bid: uidParam ? parseInt(uidParam, 10) : null
        }
        //validate with zod
        const parsedId = IdQuerySchema.safeParse(queryParam)
        if(!parsedId.success){
            const bidErrors = parsedId.error.format().bid?._errors || [];
            return NextResponse.json({success: false, error: parsedId.error.message, message: bidErrors?.length > 0 ? bidErrors.join(", ") : "Invalid query parameters" }, { status: 400 });
        }
        const {bid} = parsedId.data;

        let uid: number | null = null;

        // check If the user is logged in and has a token
        const tokenCookie = req.cookies.get('token');

        if (tokenCookie) {
            const token = tokenCookie.value;
            // Verify and decode the JWT token
            const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET!) as JwtPayload;
            // Extract the user ID from the decoded token
            uid = decodedToken.id;
        }

        const [comments] = await pool.execute<RowDataPacket[]>(
          'SELECT * FROM comments WHERE blog_id = ? ORDER BY published_at DESC',
          [bid]
        );

        if(comments.length === 0){
            return NextResponse.json({success: false, message: "No comments to this blog"},{status: 200})
        }

        // Add a property to each comment indicating if it is the user's comment. I couldn't add a column 'isYourComment' and
        // add the '1 or 0' to that to show that it is your comment because this would create a permanent data in table and every
        // time someone else searches for their comments they would see your comment highlighted besides theirs.
        const commentsWithUserHighlight = comments.map(comment => ({
            ...comment,
            isYourComment: uid !== null && comment.user_id === uid   // if it is your comment, it will return true otherwise false
        }));

        return NextResponse.json({success: true, message: "Comments fetched successfully", data: commentsWithUserHighlight},{status:200})

    } catch (error) {
        return NextResponse.json({success: false, error: error},{status: 500})
    }    
}