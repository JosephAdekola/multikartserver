const nodemailer = require("nodemailer");
require('dotenv').config()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAILERUSER,
    pass: process.env.MAILERPASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
})



const sendOtp = function (email, otp) {
  try {

    const mailOptions = {
      from: `"Adekola Holdings" <${process.env.MAILERUSER}>`,
      to: email,
      subject: "OTP request",
      text: "OTP request",
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <html lang="en">
  
          <head data-id="__react-email-head"></head>
  
          <body data-id="__react-email-body" style="background-color:#ffffff">
            <table align="center" width="100%" data-id="__react-email-container" role="presentation" cellSpacing="0" cellPadding="0" border="0" style="max-width:37.5em;padding-left:12px;padding-right:12px;margin:0 auto">
              <tbody>
                <tr style="width:100%">
                  <td>
                    <h1 data-id="react-email-heading" style="color:#333;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;font-size:24px;font-weight:bold;margin:40px 0;padding:0">${otp}</h1>
                    <p data-id="react-email-text" style="font-size:14px;line-height:24px;margin:24px 0;color:#333;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;margin-bottom:14px">Verify your account with the OTP</p><code style="display:inline-block;padding:16px 4.5%;width:90.5%;background-color:#f4f4f4;border-radius:5px;border:1px solid #eee;color:#333">
  
                    </code>
                    <p data-id="react-email-text" style="font-size:14px;line-height:24px;margin:24px 0;color:#ababab;font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;margin-top:14px;margin-bottom:16px">If you didn&#x27;t use our logistic services, you can safely ignore this email.</p><img data-id="react-email-img" alt="Admin &#x27;s Logo" src="https://www.comfortcargoservicecs.co.uk/static/media/c3-logo.1ec6de07.png" width="45" height="32" style="display:block;outline:none;border:none;text-decoration:none" />
                  
                  </td>
                </tr>
              </tbody>
            </table>
          </body>
  
        </html>
  
          `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const sendOrderSummary = ({ email, orderNumber, customerName, orderItems = [], subtotal, shipping, total, orderDate }) => {
  const itemsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 10px 0;">${item.product.title}</td>
      <td align="center">${item.quantity}</td>
      <td align="right">&#36;${item.unitPrice}</td>
    </tr>
  `).join("");

  const mailOptions = {
    from: `"Adekola Holdings" <${process.env.MAILERUSER}>`,
    to: email,
    subject: "Order Confirmation",
    html: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Summary</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin: 20px auto; border-radius: 8px; padding: 20px;">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <img src="https://multikart-react-reactpixelstrap.vercel.app/assets/images/icon/logo.png" alt="Adekola Holdings" width="120" />
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="color: #333;">Thank you for your order!</h2>
                    <p style="color: #555;">Hi <strong>${customerName}</strong>,</p>
                    <p style="color: #555;">Here’s a summary of your order <strong>#${orderNumber}</strong> placed on <strong>${orderDate}</strong>.</p>

                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Summary</h3>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 15px;">
                      <thead>
                        <tr style="background-color: #f9f9f9;">
                          <th align="left" style="padding: 10px;">Item</th>
                          <th align="center" style="padding: 10px;">Qty</th>
                          <th align="right" style="padding: 10px;">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>

                    <hr style="margin: 20px 0;" />

                    <table width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td align="left">Subtotal:</td>
                        <td align="right">&#36;${subtotal}</td>
                      </tr>
                      <tr>
                        <td align="left">Shipping:</td>
                        <td align="right">&#36;${shipping}</td>
                      </tr>
                      <tr>
                        <td align="left" style="font-weight: bold;">Total:</td>
                        <td align="right" style="font-weight: bold;">&#36;${total}</td>
                      </tr>
                    </table>

                    <p style="margin-top: 30px; font-size: 14px; color: #888;">If you have any questions, reply to this email or contact our support team.</p>
                    <p style="font-size: 14px; color: #888;">Thank you for choosing Adekola Holdings!</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 10px; background-color: #f0f0f0; font-size: 12px; color: #999;">
                    &copy; 2025 Adekola Holdings. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    `
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Order summary email sent: " + info.response);
    }
  });
};


module.exports = {
  sendOtp,
  sendOrderSummary
}