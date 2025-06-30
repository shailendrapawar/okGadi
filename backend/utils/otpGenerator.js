
import crypto from "crypto"

function generateOTPWithExpiry(length = 6, ttlMinutes = 5) {
  const otp_code = crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
  const expires_at = new Date(Date.now() + ttlMinutes * 60000);
  return { otp_code, expires_at };
}

export default generateOTPWithExpiry;