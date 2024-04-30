const express = require('express');
const scaleController = require('../controllers/scaleController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');
const formRouter = require('./formRoutes');

const router = express.Router();

// router.param('id', scaleController.checkID);

// Create a checkBody middleware
// Check if body contains the name and capacity property
// If not, send back 400 (bad request)
// Add it to the post handler stack

router.use('/:scaleId/reviews', reviewRouter);
router.use('/:scaleId/forms', formRouter);

router
  .route('/top-5-best-scales')
  .get(scaleController.aliasTopScales, scaleController.getAllScales);

router.route('/scale-stats').get(scaleController.getScaleStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    scaleController.getMonthlyPlan,
  );

router
  .route('/')
  .get(scaleController.getAllScales)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    scaleController.createScale,
  );

router
  .route('/:id')
  .get(scaleController.getScale)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    scaleController.uploadScaleImages,
    scaleController.resizeScaleImages,
    scaleController.updateScale,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    scaleController.deleteScale,
  );

module.exports = router;
