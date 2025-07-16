// email/templates/otpLogin.js
export function otpLoginTemplate({ userName = "User", otpCode }) {
    return `
    <html>
      <body style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
          <div style="background-color: #001f3f; color: white; padding: 20px;">
            <h2 style="margin: 0;">Welcome to OkGaadi</h2>
          </div>
          <div style="padding: 30px;">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Here is your One-Time Password (OTP) for login:</p>
            <p style="font-size: 32px; letter-spacing: 6px; font-weight: bold; color: #001f3f;">${otpCode}</p>
            <p>This OTP is valid for <strong>5 minutes</strong>.</p>
            <p style="margin-top: 30px; color: #555;">If you didn’t request this, please ignore this email.</p>
            <p style="margin-top: 30px;">Thanks,<br/>Team OkGaadi</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// email/templates/otpSignup.js
export function otpSignupTemplate({ userName = "User", otpCode }) {
    return `
    <html>
      <body style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
          <div style="background-color: #001f3f; color: white; padding: 20px;">
            <h2 style="margin: 0;">Welcome to OkGaadi</h2>
          </div>
          <div style="padding: 30px;">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Here is your One-Time Password (OTP) for Signup:</p>
            <p style="font-size: 32px; letter-spacing: 6px; font-weight: bold; color: #001f3f;">${otpCode}</p>
            <p>This OTP is valid for <strong>5 minutes</strong>.</p>
            <p style="margin-top: 30px; color: #555;">If you didn’t request this, please ignore this email.</p>
            <p style="margin-top: 30px;">Thanks,<br/>Team OkGaadi</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// email/templates/passwordReset.js
export function passwordResetTemplate({ userName = "User", otpCode }) {
    return `
    <html>
      <body style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
          <div style="background-color: #001f3f; color: white; padding: 20px;">
            <h2 style="margin: 0;">Password Reset - OkGaadi</h2>
          </div>
          <div style="padding: 30px;">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>You requested to reset your password. Use the OTP below to proceed:</p>
            <p style="font-size: 32px; letter-spacing: 6px; font-weight: bold; color: #001f3f;">${otpCode}</p>
            <p>This OTP is valid for <strong>5 minutes</strong>.</p>
            <p style="margin-top: 30px; color: #555;">If you didn’t request this reset, you can safely ignore this message.</p>
            <p style="margin-top: 30px;">Thanks,<br/>Team OkGaadi</p>
          </div>
        </div>
      </body>
    </html>
  `;
}


// email/templates/adminNotification.js
export function adminNotificationTemplate({ title, message, footerNote = "This is an automated message." }) {
    return `
    <html>
      <body style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
          <div style="background-color: #001f3f; color: white; padding: 20px;">
            <h2 style="margin: 0;">${title}</h2>
          </div>
          <div style="padding: 30px;">
            <p>${message}</p>
            <p style="margin-top: 30px; color: #999; font-size: 14px;">${footerNote}</p>
            <p style="margin-top: 20px;">Thanks,<br/>OkGaadi Admin Panel</p>
          </div>
        </div>
      </body>
    </html>
  `;
}


export function emailTemplateGenerator({ purpose, otp_code }) {

    switch (purpose) {
        case "login": {
            const html = otpLoginTemplate({ otpCode: otp_code })
            return {
                subject: "Your login OTP request",
                html
            }
            break;
        }

        case "signup": {
            const html = otpSignupTemplate({ otpCode: otp_code })
            return {
                subject: "Your Signup OTP request",
                html
            }
            break;
        }

        case "reset_password":
            const html = passwordResetTemplate({ otpCode: otp_code });
            return {
                subject: "Your Password reset OTP request",
                html
            }
            break;

        default:
            return {
                
            }
            break;
    }

}