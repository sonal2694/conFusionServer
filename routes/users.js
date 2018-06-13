var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/users');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//For user to Sign Up
router.post('/signup', (req, res, next) => {
  User.findOne({username: req.body.username})
  .then((user) => {
    if(user != null) {
      var err = new Error('User ' +req.body.username + ' already exists!');
      err.status = 403; //forbidden
      next(err);
    }
    else {
      //returning the promise to the next then()
      return User.create({
        username: req.body.username,
        password: req.body.password });
    }
  })
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: 'Registration Successful!', user: user});
  }, (err) => next(err))
  .catch((err) => next(err));
});

//For user to login
router.post('/login', (req, res, next) => {
  if(!req.session.user) {
    var authHeader = req.headers.authorization;

    if(!authHeader) {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

    var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':'); //last split because the credentials are stored like username:password
    var username = auth[0];
    var password = auth[1];

    User.findOne({username: username})
    .then((user) => {
      if(user.password == password) {
        req.session.user = 'authenticated';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are authenticated!');
      }
      else if(user.password != password) {
        var err = new Error('Your password is incorrect!');
        err.status = 403; //forbidden
        return next(err);
      }
      else if (user == null){
        var err = new Error('User ' + username + 'does not exist.');
        err.status = 403;
        return next(err);
      }
    })
    .catch((err) => next(err));
  }

  else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated');
  }
});

//For user to logout
router.get('/logout', (req, res) => {
  if(req.session) { //if user is logged in
    req.session.destroy(); // removes the info from server side
    res.clearCookie('session-id'); //asks the client to delete the cookie from client-side
    res.redirect('/'); //redirects to standard page (here, homepage)
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
