const express = require('express');
const db = require('./db');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const app = express();
app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }))
app.use(session({
  secret: 'abcddejkd',
  resave: false,
  saveUninitialized: false,
}))
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
  done (null, user.id);
})
passport.deserializeUser((id, done) => {
  const user = db.findById(id);
  if (!user) return done(false, null);
  done(null, user);
})
passport.use(new LocalStrategy((username, password, done) => {
  const user = db.findByUsername(username);
  if (!user || user.password !== password) return done(false, null);
  return done(null, user);
}))
app.get("/login", (req, res) => {
  res.render('./login.ejs');
})
app.post('/login', passport.authenticate('local', { failureRedirect: '/error' }), (req, res) => {
  res.redirect('/');
})
app.get('/error', (req, res) => {
  res.send('Error login')
})
app.get('/', (req, res) => {
  res.render('./index.ejs', { user: req.user.username });
})
// GOOGLE AUTH
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
let userProfile;
passport.use(new GoogleStrategy({
  clientID: "939204257180-nk2al9e2hcb63jd697lioemq6jlmiip3.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: 'http://localhost:3000/auth/google/callback'
},
function (accessToken, refreshToken, profile, done) {
  userProfile = profile;
  console.log(profile)
  return done(null, userProfile);
}
))
app.get('/auth/google', passport.authenticate('google', { scope: [ 'profile', 'email' ] }));
app.get('/auth/google/callback', passport.authenticate('google', 
{ failureRedirect: '/error' }
), (req, res) => {
  res.redirect('/google-success');
})
app.get('/google-success', (req, res) => {
  res.render('./google.success.ejs', { user: userProfile })
})
// FACEBOOK AUTH
const FacebookStrategy = require('passport-facebook');
passport.use(new FacebookStrategy({
  clientID: '595018182016484',
  clientSecret: '4039e69494610d1cbbdcd99fa552cc1c',
  callbackURL: 'http://localhost:3000/auth/facebook/callback'
},
function (accessToken, refreshToken, profile, done) {
  userProfile = profile;
  userProfile.photo = `https://graph.facebook.com/${profile.id}/picture?width=200&height=200`;
  return done(null, profile);
}))
app.get('/auth/facebook', passport.authenticate('facebook', {
  scope: [ 'public_profile', 'email' ]
}))
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/facebook-success',
  failureRedirect: '/error'
}))
app.get('/facebook-success', (req, res) => {
  res.render('./facebook.success.ejs', { user: userProfile })
})
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})