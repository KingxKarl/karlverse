import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "./models/User.js";

// Serialize user into the session by storing the user ID.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session by retrieving from DB.
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Local Strategy for email/password authentication.
passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
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
