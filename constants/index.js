const { generateTokenWithSecret } = require("../services/jwtService");

const FORGET_PASS_EMAIL_SUBJECT = `Reset Password`;

const FORGET_PASS_EMAIL_BODY = (user, oldPass) => {
  return `Visit the following link to reset your password\n${
    process.env.HOST
  }/auth/reset-password/${generateTokenWithSecret(user, oldPass)}`;
};

const getS3Url = (key) => {
  return encodeURI(
    `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  );
};

//password must contain a capital Letter, a symbol and a number, and must be minimum 8 digits long
const passwordRegex = new RegExp(
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
);

const PLATFORMS = {
  ios: "ios",
  android: "android",
  reactApp: "react-app",
};

module.exports = {
  FORGET_PASS_EMAIL_BODY,
  getS3Url,
  FORGET_PASS_EMAIL_SUBJECT,
  passwordRegex,
  PLATFORMS,
};
