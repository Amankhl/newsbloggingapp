import {resend} from "../lib/resend";
import VerificationEmail from "../../emails/verificationEmail";
import {ApiResponse} from "../types/ApiResponse";


export async function sendVerificationEmail(otp: string, username: string, email: string): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Your verification code',
            react: VerificationEmail({username, otp}),
        });
        return {
            success: true,
            message: "verification email sent successfully",
        }
    } catch (emailError) {
        console.log("Error sending verification email", emailError);
        return {
            success: false,
            message: "Error sending verification email"   
        }
    }
}
