import { NextResponse, NextRequest } from 'next/server';
import { signupSchema } from '@/schemas/userSchemas/signupSchema';
import pool, {SigninUser}  from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from "mysql2";
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const user = signupSchema.parse(body) as SigninUser;

        // Check if the username already exists
        const [existingUserByUsername] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM users WHERE username = ?',
            [user.username]
        );
        if (existingUserByUsername.length > 0) {
            const existingUser = existingUserByUsername[0];
            if (existingUser.isVerified === 1) {
                return NextResponse.json({ success: false, message: 'Username already taken' }, { status: 400 });
            }
        }
        // check if the user already exists by email
        const [existingUserByEmail] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [user.email]
        );

        const verifyCode = Math.floor(100000 + Math.random()*900000).toString();

        if ( existingUserByEmail.length > 0) {
            const existingUser = existingUserByEmail[0];
            if (existingUser.isVerified === 1) {          // isVerfified column has default value 0 and can be 0 or 1.
                return NextResponse.json({ success: false, message: 'email already exists' }, { status: 400 });               // this POST method will end here since it is a return and the POST method ends here
            }else{                                          // if user is not verified but the email already exists, then we will send a verification email with the code
                const hashedPassword = await bcrypt.hash(user.password, 10);
                const expiryDate = new Date(Date.now() + 3600000);   // 1 hr expiry time

                const [result] = await pool.execute<ResultSetHeader>(
                    'UPDATE users SET password = ?, verifyCode = ?, verifyCodeExpiry = ? WHERE email = ?',
                    [hashedPassword, verifyCode, expiryDate, user.email]
                );//after this, it will exit the condition and send the verification email by executing the sendVerificationEmail function
            }

        } else {
            // Username is already taken by another user, but email is not verified, so we will register the user
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1); // 1 hr expiry time but a different way

            const [result] = await pool.execute<ResultSetHeader>(
                'INSERT INTO users (name, username, email, password, verifyCode, verifyCodeExpiry) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [user.name, user.username, user.email, hashedPassword, verifyCode, expiryDate]
            );
        }
            // send a verification email
            // const emailResponse = await sendVerificationEmail(user.email, user.username, verifyCode);
            // if(!emailResponse.success){
            //     return NextResponse.json({ success: false, message: emailResponse.message }, { status: 500 });
            // }
            return NextResponse.json({ success: true, message: 'User registered successfully. Verification email sent.' }, { status: 201 });

    } catch (error) {
        console.error("Error registering user", error);
        return NextResponse.json({ success: false, message: 'Failed to register user', error }, { status: 500 });
    }

}



/*

code should effectively handles both scenerios of registering
a new user and updating an existing but unverified user account
with a new password and verfied code.



IF existingUserByEmail EXISTS THEN
    IF existingUserByEmail.isVerified THEN
        success: false,
    ELSE
        //save the updated user
    END IF
ELSE
    // Create a new user with the provided details
    // save the new user
END IF

*/