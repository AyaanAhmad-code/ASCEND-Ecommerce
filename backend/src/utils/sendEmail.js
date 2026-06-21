import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    let transporter;

    // Use environment variables if provided, otherwise create a testing Ethereal account
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log(`[Email Service] Authenticating with real SMTP server: ${process.env.SMTP_HOST}`);
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            connectionTimeout: 10000, // 10 seconds timeout
            greetingTimeout: 10000,
            socketTimeout: 10000,
        });
    } else {
        // Fallback to Ethereal Mail for testing without setup
        console.log("No SMTP credentials found in .env. Falling back to Ethereal Test Mail.");
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    const message = {
        from: `${process.env.FROM_NAME || 'ASCEND E-Commerce'} <${process.env.FROM_EMAIL || 'noreply@ascend.com'}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    const info = await transporter.sendMail(message);

    // If using Ethereal, print the URL to preview the email in the console
    if (!process.env.SMTP_HOST) {
        console.log("----------------------------------------");
        console.log("📧 Ethereal Test Email Sent!");
        console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));
        console.log("----------------------------------------");
    }
};

export default sendEmail;
