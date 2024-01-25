export const OTP_EMAIL_TEMPLATE = (otp: string) =>
    `<html lang="en">
    <body>
        <p>Your OTP to verify email ID is : ${otp}. The OTP will expire in 10 minutes.
    </body>
</html>`;

export const OTP_EMAIL_SUBJECT = 'Email Verification';
