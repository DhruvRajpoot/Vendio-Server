const verifyEmail = (user, token) => {
  return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your Email - Vendio</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      background-color: #f4f4f4;
                      margin: 0;
                      padding: 0;
                      color: #333333;
                  }
                  .container {
                      max-width: 600px;
                      margin: 20px auto;
                      background-color: #ffffff;
                      border-radius: 8px;
                      overflow: hidden;
                      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                      padding: 20px;
                  }
                  .header {
                      background-color: #00897B;
                      padding: 20px;
                      text-align: center;
                  }
                  .header img {
                      width: 150px;
                      height: auto;
                  }
                  .content {
                      padding: 20px;
                  }
                  .message {
                      font-size: 16px;
                      line-height: 1.6;
                      color: #555555;
                  }
                  .message h2 {
                      color: #00897B;
                      font-size: 20px;
                      margin-bottom: 15px;
                      font-weight: bold;
                  }
                  .cta-button {
                      display: block;
                      width: 100%;
                      max-width: 200px;
                      margin: 20px auto;
                      padding: 15px;
                      text-align: center;
                      color: #ffffff!important;
                      background-color: #00897B;
                      text-decoration: none;
                      border-radius: 5px;
                      font-size: 16px;
                      font-weight: bold;
                  }
                  .cta-button:hover {
                      background-color: #00796B;
                  }
                  .footer {
                      background-color: #f4f4f4;
                      padding: 15px;
                      text-align: center;
                      font-size: 14px;
                      color: #666666;
                      border-top: 1px solid #e0e0e0;
                  }
                  .footer a {
                      color: #0077c2;
                      text-decoration: none;
                      font-weight: bold;
                  }
                  .footer a:hover {
                      text-decoration: underline;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <img src="https://res.cloudinary.com/dp3kpqzce/image/upload/v1724084071/logo_scddl1.png" alt="Vendio Logo">
                  </div>
                  <div class="content">
                      <div class="message">
                          <h2>Hello ${user.firstName},</h2>
                          <p>
                              Thank you for signing up for Vendio! Please confirm your email address to complete your registration and start exploring our platform.
                          </p>
                          <p>
                              Simply click the button below to verify your email:
                          </p>
                          <a href="${process.env.CLIENT_URL}/verify-email?token=${token}" class="cta-button">Verify Your Email</a>
                      </div>
                  </div>
                  <div class="footer">
                    <p>&copy; 2024 Vendio. All rights reserved.</p>
                    <p>If you did not create this account, please <a href="mailto:dhruvrajpootiiitbhopal@gmail.com">contact us</a> immediately.</p>
                </div>
              </div>
          </body>
          </html>
      `;
};

export default verifyEmail;
