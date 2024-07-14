const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const sendEmailController = async (req, res) => {
  try {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(500).send({
        success: false,
        message: "Please Provide All Fields",
      });
    }

    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: email, // Your email address
      to: process.env.EMAIL_USER, // Recipient email address
      subject: subject,
      text: message,
      replyTo: email, // Sender's email address
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Failed to send email:", err);
        return res.status(500).send({
          success: false,
          message: "Failed to send email",
          error: err.message || err,
        });
      }

      console.log("Email sent successfully:", info);
      return res.status(200).send({
        success: true,
        message: "Your message was sent successfully",
      });
    });
  } catch (error) {
    console.log("Send Email API Error:", error);
    return res.status(500).send({
      success: false,
      message: "Send Email API Error",
      error,
    });
  }
};

module.exports = { sendEmailController };
