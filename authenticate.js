var passport = require('passport');
var LocalStrategy = require('passport-local');
var User = require('./models/users');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

var config = require('./config');

//Configuring passport with new LocalStrategy
exports.local = passport.use(new LocalStrategy( User.authenticate() ));
passport.serializeUser(User.serializeUser()); //provided by passport-local-mongoose
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, { expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id }, (err, user) => {
            if(err) {
                return done(err, false); //done() is a callback that passport will pass into the strategy
            }
            else if (user) {
                return done(null, true);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session : false});