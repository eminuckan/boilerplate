const {emailConfirmTemplate} = require('./mailTemplates');
const { sendEmail } = require("./mailHelper");

const sendEmailConfirm = async (user,emailConfirmToken) => {
  const emailConfirmUrl = `http://localhost:5000/api/auth/confirmEmail?emailConfirmToken=${emailConfirmToken}`;
  // const emailTemplate = emailConfirmTemplate(emailConfirmUrl);
  try {
    await sendEmail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Confirm Your Email",
      html: emailConfirmTemplate(emailConfirmUrl,user.name)
    });

  } catch (err) {
    user.confirmEmailToken = undefined;
    user.confirmEmailExpire = undefined;
  }

}

module.exports = sendEmailConfirm;