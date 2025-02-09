const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

/**
 * Register new user
 * @param {Object} req.body - User registration data
 */
exports.register = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!password) {
      return res
        .status(400)
        .json({ message: "Password is required for registration" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user and get the result
    const [result] = await pool.query(
      "INSERT INTO users (email, name, password) VALUES (?, ?, ?)",
      [email, name, hashedPassword]
    );

    res
      .status(201)
      .json({ message: "User registered", userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Authenticate user login
 * @param {Object} req.body - Login credentials
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    if (!user.password)
      return res
        .status(400)
        .json({ message: "This account requires Google login" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token, name: user.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.googleCallback = async (req, res) => {
  try {
    // `req.user` is set by Passport in googleStrategy (passport.deserializeUser, etc.)
    // That includes: { id: profile.id, email: profile.emails[0].value, displayName: profile.displayName }
    const googleUser = req.user;
    // Check if user already exists:
    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [googleUser.email]
    );

    let userId;
    let displayName;
    if (!existingUser.length) {
      // Create new user if doesn't exist
      const [result] = await pool.query(
        "INSERT INTO users (email, name, google_id) VALUES (?, ?, ?)",
        [googleUser.email, googleUser.displayName, googleUser.id]
      );
      userId = result.insertId;
      displayName = googleUser.displayName;
    } else {
      userId = existingUser[0].id;
      displayName = existingUser[0].name;
    }

    // Generate token
    const token = jwt.sign(
      { id: userId, name: displayName },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Now redirect the user to your front-end with the token in the URL:
    return res.redirect(
      `${
        process.env.FRONTEND_URL
      }/oauth-callback?token=${token}&name=${encodeURIComponent(displayName)}`
    );
  } catch (error) {
    console.error("Google callback error:", error);
    // On any error, just push them back to home or some error page
    return res.redirect(`${process.env.FRONTEND_URL}/?message=oauth-error`);
  }
};
