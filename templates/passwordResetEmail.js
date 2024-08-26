import { clientUrl, contactEmail } from "../config/baseurl.js";

const passwordResetEmail = (user, token) => {
  return `
     <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - Vendio</title>
      </head>
      <body style="font-family: Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333333;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; margin: 0; padding: 0;">
              <tr>
                  <td align="center">
                      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; overflow: hidden; padding: 15px;">
                          <tr>
                              <td style="background-color: #00897B; padding: 20px; text-align: center;">
                                  <img src="https://res.cloudinary.com/dp3kpqzce/image/upload/v1724084071/logo_scddl1.png" alt="Vendio Logo" width="100" height="auto">
                              </td>
                          </tr>
                          <tr>
                              <td style="padding: 20px;">
                                  <h2 style="color: #00897B; font-size: 18px; font-weight: bold;">Hello ${user.firstName},</h2>
                                  <p style="font-size: 14px; line-height: 1.6; color: #555555;">
                                      We received a request to reset your password for your Vendio account. Please click the button below to reset your password:
                                  </p>
                                  <a href="${clientUrl}/setnewpassword?token=${token}" style="display: block; width: 100%; max-width: 200px; margin: 20px auto; padding: 12px 10px; text-align: center; color: #ffffff; background-color: #00897B; text-decoration: none; border-radius: 5px; font-size: 14px; font-weight: bold;" role="button">Reset Your Password</a>
                                  <p style="font-size: 14px; line-height: 1.6; color: #555555;">
                                      If you didn't request this, please ignore this email or <a href="mailto:${contactEmail}" style="color: #0077c2; text-decoration: none; font-weight: bold;">contact us</a> if you have any concerns.
                                  </p>
                              </td>
                          </tr>
                          <tr>
                              <td style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 13px; color: #666666; border-top: 1px solid #e0e0e0;">
                                  <p>&copy; 2024 Vendio. All rights reserved.</p>
                                  <p>If you need further assistance, feel free to <a href="mailto:${contactEmail}" style="color: #0077c2; text-decoration: none; font-weight: bold;">contact us</a>.</p>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
  `;
};

export default passwordResetEmail;
