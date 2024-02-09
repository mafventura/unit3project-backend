import { Router } from "express";
import passport from "passport";
import { findOrCreateUser } from "../utils/user.js";

const router = Router();

router.get("/login/success", async (req, res) => {
  if (req.user) {
    // console.log(req.user)
    await findOrCreateUser(req.user);
    res.status(200).json({
      error: false,
      message: "Successfully Logged In",
      user: req.user,
    });
  } else {
    res.status(403).json({ error: true, message: "Not Authorized" });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    error: true,
    message: "Log in failure",
  });
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: "/login/failed",
    prompt: "select_account",
  })
);

router.get("/google", passport.authenticate("google", ["profile", "email"]));

router.get("/logout", (req, res) => {
  req.logout(() => {
    // console.log("logged out -------------------------------------->");
  });
  res.redirect(process.env.CLIENT_URL);
});

export default router;
