import {NextRequest, NextResponse} from "next/server"


export const GET = async (req: NextRequest) => {
    try {
        const response = NextResponse.json({
            message: "Logout successfully",
            success: true
        })
        // destroying cookie token
        response.cookies.set("token", "", {httpOnly: true, expires: new Date(0)})
        return response
        
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 400 });
        
    }
}