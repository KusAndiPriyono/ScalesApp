const multer = require('multer');
const sharp = require('sharp');
const Scale = require('../models/scaleModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Bukan gambar. Silahkan upload hanya gambar.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadScaleImages = upload.single('imageCover');

exports.resizeScaleImages = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // // Definisi base URL
  const baseUrl = `https://scalesapp.up.railway.app/img/scales/`;

  // Cover image
  const filename = `scale-${req.params.id}-${Date.now()}-cover.png`;
  req.body.imageCover = baseUrl + filename;

  await sharp(req.file.buffer)
    .resize({ fit: 'cover' })
    .toFormat('png')
    .png({ quality: 90 })
    .toFile(`public/img/scales/${filename}`);

  next();
});

exports.aliasTopScales = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,brand';
  req.query.fields = 'name,brand,ratingsAverage,location,status';
  next();
};

exports.getAllScales = factory.getAll(Scale);
exports.getScale = factory.getOne(Scale, { path: 'reviews forms' });
exports.createScale = factory.createOne(Scale);
exports.updateScale = factory.updateOne(Scale);
exports.deleteScale = factory.deleteOne(Scale);

exports.getScaleStats = catchAsync(async (req, res, next) => {
  const stats = await Scale.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$brand' },
        numScale: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        minRangeCapacity: { $min: '$rangeCapacity' },
        maxRangeCapacity: { $max: '$rangeCapacity' },
      },
    },
    {
      $sort: { avgRangeCapacity: 1 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2024

  const plan = await Scale.aggregate([
    {
      $unwind: '$calibrationDate',
    },
    {
      $match: {
        calibrationDate: {
          $gte: new Date(`${year}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$calibrationDate' },
        numScaleStarts: { $sum: 1 },
        scales: {
          $push: {
            name: '$name',
            brand: '$brand',
          },
        },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numScaleStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    plan,
  });
});
