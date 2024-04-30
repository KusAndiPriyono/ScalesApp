const express = require('express');
const formController = require('../controllers/formController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(formController.getAllForms)
  .post(
    authController.restrictTo('admin'),
    formController.setScaleUserId,
    formController.createForm,
  );

router
  .route('/:id')
  .get(formController.getForm)
  .patch(authController.restrictTo('admin'), formController.updateForm)
  .delete(authController.restrictTo('admin'), formController.deleteForm);

router
  .route('/:id/approve')
  .patch(authController.restrictTo('manager'), formController.approveForm);

module.exports = router;
