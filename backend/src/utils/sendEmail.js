const sendEmail = async (options) => {
    // If we have a Brevo API Key, use Brevo's HTTP API (Bypasses Render's port blocks)
    if (process.env.BREVO_API_KEY) {
        console.log(`[Email Service] Sending email via Brevo API to: ${options.email}`);
        
        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': process.env.BREVO_API_KEY,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { 
                        name: process.env.FROM_NAME || 'ASCEND E-Commerce', 
                        email: process.env.FROM_EMAIL || 'ayaanopyt06@gmail.com' 
                    },
                    to: [{ email: options.email }],
                    subject: options.subject,
                    htmlContent: options.html
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("[Email Service] Brevo Error Response:", data);
                throw new Error(data.message || "Failed to send email via Brevo");
            }
            
            console.log("[Email Service] Brevo Success! Message ID:", data.messageId);
            return data;
        } catch (error) {
            console.error("[Email Service] Brevo Fetch Error:", error);
            throw new Error(error.message);
        }
    } 
    
    // Fallback: If no Brevo key, we assume local dev without email
    console.log("----------------------------------------");
    console.log("📧 Ethereal Test Email Mode (No Brevo Key Found)");
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log("----------------------------------------");
    return true;
};

export default sendEmail;
