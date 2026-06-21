import { Resend } from 'resend';

const sendEmail = async (options) => {
    // If we have a Resend API Key, use Resend (Bypasses Render's port blocks)
    if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        console.log(`[Email Service] Sending email via Resend API to: ${options.email}`);
        
        const { data, error } = await resend.emails.send({
            // Free Resend accounts can only send FROM onboarding@resend.dev
            from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
            to: options.email,
            subject: options.subject,
            html: options.html,
        });

        if (error) {
            console.error("[Email Service] Resend Error:", error);
            throw new Error(error.message);
        }
        
        console.log("[Email Service] Resend Success:", data);
        return data;
    } 
    
    // Fallback: If no Resend key, we assume local dev without email
    console.log("----------------------------------------");
    console.log("📧 Ethereal Test Email Mode (No Resend Key Found)");
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log("----------------------------------------");
    return true;
};

export default sendEmail;
