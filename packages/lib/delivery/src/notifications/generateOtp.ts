// generates n digit OTP
export const generateOtp = (otpLength: number) => {
    return (
        Math.floor(Math.random() * (9 * Math.pow(10, otpLength - 1))) +
        Math.pow(10, otpLength - 1)
    ).toString();
};
