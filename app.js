const express = require('express');
const db = require('./db');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const { config } = require('dotenv');
config({ path: __dirname + '/.env' })
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
  done (null, user);
})
passport.deserializeUser((obj, done) => {
  done(null, obj);
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
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
function (accessToken, refreshToken, profile, done) {
  return done(null, profile);
}
))
app.get('/auth/google', passport.authenticate('google', { scope: [ 'profile', 'email' ] }));
app.get('/auth/google/callback', passport.authenticate('google', 
{ failureRedirect: '/error', successRedirect: '/google-success'}
))
app.get('/google-success', (req, res) => {
  res.render('./google.success.ejs', { user: req.user })
})
// FACEBOOK AUTH
const FacebookStrategy = require('passport-facebook');
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL
},
function (accessToken, refreshToken, profile, done) {
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
  if (req.user) {
    req.user.photo = `https://graph.facebook.com/${req.user.id}/picture?width=200&height=200`;
  }
  res.render('./facebook.success.ejs', { user: req.user })
})
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})