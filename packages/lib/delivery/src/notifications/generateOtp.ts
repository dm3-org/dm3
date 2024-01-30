// generates n digit OTP
export const generateOtp = (otpLength: number) => {
    return (
        Math.floor(Math.random() * (9 * Math.pow(10, otpLength - 1))) +
        Math.pow(10, otpLength - 1)
    ).toString();
};

export const saveOtp = (otpLength: number): string => {
    const otp = generateOtp(otpLength);
    // { type: Email, otp: 12345, generatedAt: 1705998418 }
    // save otp
    return otp;
};
