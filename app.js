const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const scaleRouter = require('./routes/scaleRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const formRouter = require('./routes/formRoutes');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Global Middleware
// implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
app.options('*', cors());
// app.options('/api/v1/scales/:id', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
// Security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Terlalu banyak request dari IP Anda, coba lagi dalam satu jam!',
  validate: {
    trustProxy: false, // Disable trust proxy check
  },
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'calibrationPeriod',
      'ratingsQuantity',
      'ratingsAverage',
      'status',
    ],
  }),
);

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use('/api/v1/scales', scaleRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/forms', formRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Tidak dapat menemukan ${req.originalUrl} pada server! 🤷‍♂`,
      404,
    ),
  );
});

app.use(globalErrorHandler);

module.exports = app;
