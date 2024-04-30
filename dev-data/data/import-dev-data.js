/* eslint-disable no-console */
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Scale = require('../../models/scaleModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');
const Form = require('../../models/formModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => {
  console.log('Database connection successful');
});

// Read JSON file
const scales = JSON.parse(
  fs.readFileSync(`${__dirname}/scales-simple.json`, 'utf-8'),
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/scales-simple.json`, 'utf-8'),
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/scales-simple.json`, 'utf-8'),
);
const forms = JSON.parse(
  fs.readFileSync(`${__dirname}/scales-simple.json`, 'utf-8'),
);

// Import data into DB
const importData = async () => {
  try {
    await Scale.create(scales);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    await Form.create(forms);
    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete all data from DB
const deleteData = async () => {
  try {
    await Scale.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    await Form.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
