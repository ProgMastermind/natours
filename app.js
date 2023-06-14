const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express(); // it adds some methods to express
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// middleware

//Generally we can't a static fields(i.e html files, images etc...,)
// The main reason is that they won't contain any routes, even though
// we can access it using middleware, but path should not contain the parent folder
// which we are going to mention in the middleware
app.use(express.static(path.join(__dirname, 'public')));

// set the HTTP header
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from the IP, please try again in a hour!',
});

app.use('/api', limiter);
// app.use(morgan('dev'));
// when a client sends a requet
// Body parser, reading the data from  the body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NOSql query injection
app.use(mongoSanitize());

// Data sanitization against xss
app.use(xss());

//Prevent paramter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
      'difficulty',
      'maxGroupSize',
    ],
  })
);

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    //"script-src 'self' https://cdnjs.cloudflare.com"
    "script-src 'self' https://cdnjs.cloudflare.com https://js.stripe.com"
  );
  next();
});

// app.use((req, res, next) => {
//   res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
//   res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
//   next();
// });

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoute');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoute');

// app.use((req, res, next) => {
//   //console.log('Hello from the middleware...'); // you have to comment this console.log as you have set some certain rules in eslint
//   next(); // next() passes the control to the next middleware component to middleware stack
// });
// middleware works only when it is declared above the certain code, it won't applicable to the
// code/sectionns  which are written below the middleware .. So the position/order matters

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// routes
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get(`/api/v1/tours/:id`, getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// To make it more organised

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Handling unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404)); // whenever we pass arguments in next() , it will treat it as error and directly skip all the middlewares
  // and goes into error handling middleware and pass on the error to error handling middleware
});

// error handling middleware (contains 4 params)
app.use(globalErrorHandler);

module.exports = app;
