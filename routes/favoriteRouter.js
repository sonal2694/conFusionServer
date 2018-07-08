const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user})
    .populate('user')
    .populate('dishes')
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user})
    .then((favorite) => {
        //If no favorite exists, create a new favourites document for the user
        if(favorite == null) {
            var newFavoriteList = new Favorites();
            newFavoriteList.user = req.user;
            favorite = newFavoriteList;
        }
        //add the favorite dishes to the list (if not already present) and save.
        for(var obj = 0; obj < req.body.length; obj++) {
            if((favorite.dishes).indexOf(req.body[obj]._id) == -1) {
                favorite.dishes.push(req.body[obj]._id);
            }
        }
        favorite.save()
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        }, (err) => next(err));
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({user: req.user})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


favoriteRouter.route('/:dishId')
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorite' + req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user})
    .then((favorite) => {
        //If no favorite exists, create a new favourites document for the user
        if(favorite == null) {
            var newFavoriteList = new Favorites();
            newFavoriteList.user = req.user;
            favorite = newFavoriteList;
        }
        //add the favorite dish to the list (if not already present) and save.
        if((favorite.dishes).indexOf(req.params.dishId) == -1) {
            favorite.dishes.push(req.params.dishId);
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err));
        }
        else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('The dish '+ req.params.dishId + ' already exists in your favorite list!');
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user})
    .then((favorite) => {
        var index = (favorite.dishes).indexOf(req.params.dishId);
        if(index != -1) {
            (favorite.dishes).splice(index , 1);
            console.log(favorite.dishes.length);
            //if no favorites left in the list, removing the favorite list document of the user completely
            if (favorite.dishes.length == 0) {
                Favorites.findOneAndRemove({user: req.user})
                .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('Your favorites list is now empty.');
                }, (err) => next(err))
                .catch((err) => next(err));
            }
            else {
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
            }
        }
        else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('The dish '+ req.params.dishId + ' does not exist in your favorite list!');
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;
