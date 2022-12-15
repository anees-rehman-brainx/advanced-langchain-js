const { authController } = require("../../controllers");
const { authMiddleware } = require("../../middlewares");
const router = require("express").Router();

router.post(
  "/signup",
  authController.signup
);

router.post("/login", authController.login);

router.post("/forget-password", authController.forgetPassword);

router.put(
  "/change-password",
  authMiddleware.verifyUser,
  authController.changePassword
);

router.post("/validate-pass-reset-link", authController.validateLink);

router.post("/reset-password", authController.resetPassword);

router.post("/send-otp", authMiddleware.verifyUser, authController.sendOTP);

router.post("/verify-otp", authMiddleware.verifyUser, authController.verifyOTP);

module.exports = router;
