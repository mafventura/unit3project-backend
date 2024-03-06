import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import { findOrCreateUser } from "./utils/user.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "https://unit3project-backend-production.up.railway.app/auth/google/callback/",
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, callback) {
    //   await findOrCreateUser(profile);
      callback(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;
