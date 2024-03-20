const nodemailer = require("nodemailer");

function sendEmail(user, code) {
  console.log("user", user);
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "servetechlahore@gmail.com",
        pass: "buno gcvh zupa odfx",
      },
    });

    const mailOptions = {
      from: "auth.nodeecommerce@gmail.com",
      to: user,
      subject: "Authentication",
      html: `<div style="background-color: gray, border: 1px solid #5f6d66, border-radius: 5px, padding: 5px"><p>Please use bellow pin for verification</p><h2 style='color: red; padding: 10px; background-color: #000; width: max-content'>${code}</h2></div>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        // console.error("Error sending email: ", error);
        return reject({ status: false, error: "Error sending email" });
      } else {
        // console.log("Email sent: ", info.response);
        return resolve({ status: true, message: info.response });
      }
    });
  });
}

module.exports = sendEmail;
