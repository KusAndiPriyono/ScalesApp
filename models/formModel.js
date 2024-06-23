// Membuat form tiap data ID Scale
const mongoose = require('mongoose');

const formSchema = new mongoose.Schema(
  {
    scale: {
      type: mongoose.Schema.ObjectId,
      ref: 'Scale',
      required: [true, 'Form harus memiliki skala'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Form harus memiliki user'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    calibrationMethod: {
      type: String,
      required: [true, 'Form harus memiliki metode kalibrasi'],
      trim: true,
    },
    reference: {
      type: String,
      required: [true, 'Form harus memiliki referensi'],
      trim: true,
    },
    standardCalibration: {
      type: String,
      required: [true, 'Form harus memiliki kalibrasi standar'],
    },
    suhu: {
      type: Number,
      required: [true, 'Form harus memiliki suhu'],
    },
    readingCenter: {
      type: Number,
      required: [true, 'Form harus memiliki pembacaan tengah'],
    },
    readingFront: {
      type: Number,
      required: [true, 'Form harus memiliki pembacaan depan'],
    },
    readingBack: {
      type: Number,
      required: [true, 'Form harus memiliki pembacaan belakang'],
    },
    readingLeft: {
      type: Number,
      required: [true, 'Form harus memiliki pembacaan kiri'],
    },
    readingRight: {
      type: Number,
      required: [true, 'Form harus memiliki pembacaan kanan'],
    },
    maxTotalReading: {
      type: Number,
      required: [true, 'Form harus memiliki pembacaan total maksimum'],
    },
    resultCalibration: {
      type: String,
      required: [true, 'Form harus memiliki hasil'],
    },
    validUntil: {
      type: Date,
      required: [true, 'Form harus memiliki tanggal valid'],
    },
    approval: {
      type: String,
      enum: {
        values: ['waiting', 'approved', 'rejected'],
        message: 'Status persetujuan harus menunggu, disetujui, atau ditolak',
        required: [true, 'Form harus memiliki status persetujuan'],
      },
      default: 'waiting',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

formSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'scale',
  });
  next();
});

const Form = mongoose.model('Form', formSchema);

module.exports = Form;
