const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama harus diisi'],
  },
  email: {
    type: String,
    required: [true, 'Email harus diisi'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email tidak valid'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'manager', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password harus diisi'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Konfirmasi password harus diisi'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password dan konfirmasi password tidak sama',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // Jalankan fungsi ini jika password diubah
  if (!this.isModified('password')) return next();

  // Enkripsi password
  this.password = await bcrypt.hash(this.password, 12);

  // Hapus field passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  // Jalankan fungsi ini jika password tidak diubah atau dokumen baru
  if (!this.isModified('password') || this.isNew) return next();

  // Kurangi 1 detik dari passwordChangedAt agar tidak terjadi perbedaan waktu
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // Hanya tampilkan user yang aktif
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
