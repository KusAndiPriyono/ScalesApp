const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.setScaleUserId = (req, res, next) => {
  // Jika tidak ada scaleId pada req.body, maka gunakan scaleId dari req.params
  if (!req.body.scale) req.body.scale = req.params.scaleId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
