/* eslint-disable no-use-before-define */
const mongoose = require('mongoose');

const slugify = require('slugify');
// const validator = require('validator');

const scaleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Timbangan harus memiliki nama'],
      trim: true,
    },
    measuringEquipmentIdNumber: {
      type: String,
      unique: true,
    },
    brand: {
      type: String,
      required: [true, 'Timbangan harus memiliki merk'],
    },
    slug: String,
    kindType: {
      type: String,
      required: [true, 'Timbangan harus memiliki jenis'],
    },
    serialNumber: {
      type: String,
      required: [true, 'Timbangan harus memiliki nomor seri'],
      unique: true,
    },
    rangeCapacity: {
      type: Number,
      required: [true, 'Timbangan harus memiliki kapasitas'],
    },
    unit: {
      type: String,
      enum: {
        values: ['kg', 'g'],
        message: 'Unit timbangan harus kg atau g',
      },
      required: [true, 'Timbangan harus memiliki unit'],
    },
    location: {
      type: String,
      required: [true, 'Timbangan harus memiliki lokasi'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['aktif', 'tidak aktif'],
        message: 'Status timbangan harus aktif atau tidak aktif',
      },
      default: 'aktif',
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating harus lebih besar atau sama dengan 1.0'],
      max: [5, 'Rating harus lebih kecil atau sama dengan 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    parentMachineOfEquipment: {
      type: String,
      required: [
        true,
        'Timbangan harus memiliki parent mesin induk tempat alat',
      ],
      trim: true,
    },
    equipmentDescription: {
      type: String,
      required: [true, 'Timbangan harus memiliki deskripsi alat'],
      trim: true,
    },
    imageCover: {
      type: String,
    },
    calibrationPeriod: {
      type: Number,
      required: [true, 'Timbangan harus memiliki periode kalibrasi'],
    },
    calibrationDate: {
      type: Date,
      required: [true, 'Timbangan harus memiliki tanggal kalibrasi'],
    },
    nextCalibrationDate: {
      type: Date,
      required: [true, 'Timbangan harus memiliki tanggal kalibrasi berikutnya'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

scaleSchema.index({ slug: 1 });

scaleSchema.virtual('calibrationPeriodInYears').get(function () {
  return this.calibrationPeriod / 12;
});

// Populate reviews
scaleSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'scale',
  localField: '_id',
});

// Populate forms
scaleSchema.virtual('forms', {
  ref: 'Form',
  foreignField: 'scale',
  localField: '_id',
});

// Hook sebelum menyimpan data document ke database timbangan
scaleSchema.pre('save', async function (next) {
  this.slug = slugify(this.brand, { lower: true });
  if (!this.measuringEquipmentIdNumber) {
    try {
      const lastScale = await Scale.countDocuments({
        measuringEquipmentIdNumber: { $regex: 'MAY/JTK/LKM/CND/' },
      });
      const formattedNumber = (lastScale + 1).toString().padStart(2, '0');
      this.measuringEquipmentIdNumber = `MAY/JTK/LKM/CND/${formattedNumber}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

const Scale = mongoose.model('Scale', scaleSchema);

module.exports = Scale;
