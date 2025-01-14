const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db'); // Replace with your actual DB config

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:8080/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { email, name } = profile._json;
        const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
          const [result] = await pool.query(
            'INSERT INTO users (email, name, google_id, password) VALUES (?, ?, ?, ?)',
            [email, name, profile.id, null]
          );
          done(null, { id: result.insertId });
        } else {
          done(null, user[0]);
        }
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  pool.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return done(err);
    done(null, results[0]); // Deserialize user data from session
  });
});
             