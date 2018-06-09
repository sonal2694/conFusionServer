const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());

dishRouter.route('/')
.get((req, res, next) => {
  Dishes.find({})
  .then((dishes) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dishes);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post((req, res, next) => {
  Dishes.create(req.body)
  .then((dish) => {
    console.log('Dish Created', dish);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dish);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.put((req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /dishes');
})
.delete((req, res, next) => {
  Dishes.remove({})
  .then((resp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  }, (err) => next(err))
  .catch((err) => next(err));
});


//Express Router for dishes/:dishId REST API end point
dishRouter.route('/:dishId')
.get((req, res, next) => {
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dish);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post((req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /dishes/' + req.params.dishId);
})
.put((req, res, next) => {
  Dishes.findByIdAndUpdate(req.params.dishId, { $set: req.body}, { new: true} )
  .then((dish) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(dish);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.delete((req, res, next) => {
  Dishes.findByIdAndRemove(req.params.dishId)
  .then((resp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  }, (err) => next(err))
  .catch((err) => next(err));
});



//Express Router for dishes/:dishId/comments REST API end point
dishRouter.route('/:dishId/comments')
.get((req, res, next) => {
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    //if the particular dish exists
    if(dish != null) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(dish.comments);
    }
    else {
      err = new Error('Dish' + req.params.dishId + 'not found');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post((req, res, next) => {
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    if(dish != null) {
      dish.comments.push(req.body); // add the comments to the comment array of the dish
      //save the dish and return success message in response
      dish.save()
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      }, (err) => next(err));
    }
    else {
      err = new Error('Dish' + req.params.dishId + 'not found');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
})
.put((req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /dishes' + req.params.dishId + '/comments');
})
//removing ALL the comments from the dish (not the dish itself).
.delete((req, res, next) => {
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    if(dish != null) {
      //delete each of the comments one by one. (No direct way)
      for(var i = dish.comments.length-1; i >= 0; i--)
        dish.comments.id(dish.comments[i]._id).remove();
      dish.save()
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish); //Updated dish being returned here
      }, (err) => next(err));
    }
    else {
      err = new Error('Dish' + req.params.dishId + 'not found');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
});


//Express Router for dishes/:dishId/comments/:commentId REST API end point
dishRouter.route('/:dishId/comments/:commentId')
.get((req, res, next) => {
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    //check if the dish exists and the particular comment
    if(dish != null && dish.comments.id(req.params.commentId) != null) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(dish.comments.id(req.params.commentId));
    }
    else if (dish == null) {
      err = new Error('Dish' + req.params.dishId + 'not found');
      err.status = 404;
      return next(err);
    }
    //if the particular commentId does not exist
    else {
      err = new Error('Dish' + req.params.commentId + 'not found');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post((req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /dishes/' + req.params.dishId + '/comments/' + req.params.commentId);
})
.put((req, res, next) => {
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    //check if the dish exists and the particular comment and Update
    if(dish != null && dish.comments.id(req.params.commentId) != null) {
      //not allowing user to change the author (only in rating & comemnt)
      if ( req.body.rating) {
        dish.comments.id(req.params.commentId).rating = req.body.rating;
      }
      if (req.body.comment) {
        dish.comments.id(req.params.commentId).comment = req.body.comment;
      }
      dish.save()
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish); //sending back the updated dish
      }, (err) => next(err));
    }
    else if (dish == null) {
      err = new Error('Dish' + req.params.dishId + 'not found');
      err.status = 404;
      return next(err);
    }
    //if the particular commentId does not exist
    else {
      err = new Error('Dish' + req.params.commentId + 'not found');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
})
.delete((req, res, next) => {
  Dishes.findById(req.params.dishId)
  .then((dish) => {
    //Handle both cases: dish not null and commentId not null
    if(dish != null && dish.comments.id(req.params.commentId) != null) {
      dish.comments.id(req.params.commentId).remove();
      dish.save()
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish); //Updated dish being returned here
      }, (err) => next(err));
    }
    //if the dish does not exist
    else if (dish == null) {
      err = new Error('Dish' + req.params.dishId + 'not found');
      err.status = 404;
      return next(err);
    }
    //if the particular commentId does not exist
    else {
      err = new Error('Dish' + req.params.commentId + 'not found');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
});

module.exports = dishRouter;
