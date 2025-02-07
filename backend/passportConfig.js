import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "./models/User.js";

// Serialize the user by storing the user id in the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize the user from the session using the stored id
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Local Strategy: authenticate users by email and password
passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      // Normalize the email for consistency
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return done(null, false, { message: "Incorrect email or password." });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect email or password." });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

export default passport;
