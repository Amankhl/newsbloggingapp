import {z} from 'zod'
import {usernameSchema} from '@/schemas/userSchemas/signupSchema'
import pool from '@/lib/db';
import { NextResponse, NextRequest } from 'next/server';
import { RowDataPacket } from 'mysql2';

// this route or functionality is used when a user registers and as they enteres a username, they get the message below the input field that says the username is already exists, but here remember the user should be verified to make sure their username is safe.

const UsernameQuerySchema = z.object({
    username: usernameSchema
})

export async function GET(req: NextRequest){
    try {
        //whenever a user enters, they will send the value as search query - localhost:3000/api/users/check-unique-username?username=abc123

        const { searchParams } = new URL(req.url);
        const queryParam = {
            username: searchParams.get('username')
        }
        //validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam)
        console.log(result)

        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || [];
            return NextResponse.json({success: false, error: result.error.message, message: usernameErrors?.length > 0 ? usernameErrors.join(", ") : "Invalid query parameters" }, { status: 400 });
        }

        const {username} = result.data;

        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM users WHERE username = ?',
            [username]
        )
        if (rows.length > 0) {
            const ifUserVerified = rows[0];
            if(ifUserVerified.isVerified === 1){
                return NextResponse.json({success: false, error: "Username is already taken" }, { status: 400 });
        }
    }
    return NextResponse.json({success: true, message: "Username is available" }, { status: 200 });

    } catch (error) {
        console.log(error)
        return NextResponse.json({success: false, error: (error as Error).message + error, message: "error finding unique username" }, { status: 400 });
    }
}
