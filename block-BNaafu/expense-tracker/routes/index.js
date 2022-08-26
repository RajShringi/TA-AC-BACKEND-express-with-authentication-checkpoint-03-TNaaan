var express = require("express");
var router = express.Router();
const passport = require("passport");
const mail = require("../utils/mail");
const VerificationToken = require("../models/verificationToken");
const User = require("../models/User");
const { isValidObjectId } = require("mongoose");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res, next) => {
  try {
    const OTP = mail.generateOTP();
    const user = await User.create(req.body);
    const verificationToken = await VerificationToken.create({
      owner: user._id,
      token: OTP,
    });
    mail.mailTransport().sendMail({
      from: "emailverification@email.com",
      to: user.email,
      subject: "Verify your email account",
      html: `<a href="http://localhost:3000/verify/${verificationToken.owner}/${OTP}">Verify</a>`,
    });
    res.status(200).send("An Email sent to your account please verify");
  } catch (err) {
    return next(err);
  }
});

router.get("/verify/:id/:token", async (req, res, next) => {
  const userId = req.params.id;
  const otp = req.params.token;
  if (!userId || !otp.trim()) return next(err);
  if (!isValidObjectId(userId)) {
    return next(err);
  }
  const user = await User.findById(userId);
  if (!user) return next(err);
  if (user.isVerified) return next(err);
  const token = await VerificationToken.findOne({ owner: user._id });
  if (!token) return next(err);
  token.verifyToken(otp, async (err, result) => {
    if (err) return next(err);
    if (!result) {
      return next(err);
    }
    const updatedUser = await User.findByIdAndUpdate(userId, {
      isVerified: true,
    });
    VerificationToken.findByIdAndDelete(token._id, (err, data) => {
      if (err) return next(err);
      res.redirect("/login");
    });
  });
});

router.get("/login", (req, res, next) => {
  res.render("login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    res.redirect("/incomes");
  }
);

router.get("/auth/github", passport.authenticate("github"));

router.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    res.redirect("/");
  }
);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

router.get("/logout", (req, res, next) => {
  req.session.destroy();
  res.clearCookie("connect.sid");
  res.redirect("/");
});

module.exports = router;
