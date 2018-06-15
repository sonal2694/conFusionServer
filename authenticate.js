var passport = require('passport');
var LocalStrategy = require('passport-local');
var User = require('./models/users');

//Configuring passport with new LocalStrategy
exports.local = passport.use(new LocalStrategy( User.authenticate() ));
passport.serializeUser(User.serializeUser()); //provided by passport-local-mongoose
passport.deserializeUser(User.deserializeUser());
