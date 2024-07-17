const Form = require('../models/formModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.setScaleUserId = (req, res, next) => {
  // Jika tidak ada scaleId pada req.body, maka gunakan scaleId dari req.params
  if (!req.body.scale) req.body.scale = req.params.scaleId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllForms = factory.getAll(Form);
exports.getForm = factory.getOne(Form);
exports.createForm = factory.createOne(Form);
exports.updateForm = factory.updateOne(Form);
exports.deleteForm = factory.deleteOne(Form);

exports.approveForm = catchAsync(async (req, res, next) => {
  if (req.body.approval !== 'approved' && req.body.approval !== 'rejected') {
    return next(
      new AppError('Status persetujuan harus approved atau rejected', 400),
    );
  }

  const form = await Form.findByIdAndUpdate(
    req.params.id,
    {
      approval: req.body.approval,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  if (!form) {
    return next(
      new AppError('Tidak dapat menemukan formulir dengan ID tersebut!', 404),
    );
  }

  res.status(200).json({
    status: 'success',
    form,
  });
});

exports.unreleaseForm = catchAsync(async (req, res, next) => {
  const form = await Form.findByIdAndUpdate(
    req.params.id,
    {
      approval: 'waiting',
    },
    {
      new: true,
      runValidators: true,
    },
  );
  if (!form) {
    return next(
      new AppError('Tidak dapat menemukan formulir dengan ID tersebut!', 404),
    );
  }

  res.status(200).json({
    status: 'success',
    form,
  });
});
