const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../modal/tourmodal');
const factory = require('./handleFactory');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError(`Not an image! Please upload only images.`, 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // Imagecover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );
  next();
});

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// Below two middleware functions are not requied , as mongo will take care of such stuff from now onwards
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };

// Not required
// exports.checkID = (req, res, next, val) => {
//   //console.log(`ID is ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid id',
//     });
//   }

//   next();
// };
// we can even pass this function in every handler right below there, but it violates the express rules
// the handlers should not take care of validating stuff and they should just follow the work given to them

exports.aliasTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//const APIFeatures = require('../utils/apiFeatures');

//const AppError = require('../utils/appError');
// Route Handlers
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // Building query
//   // 1A) Filtering
//   // const queryObj = { ...req.query };
//   // const excludedFileds = ['page', 'sort', 'limit', 'fields'];
//   // excludedFileds.forEach((el) => delete queryObj[el]);

//   // // 1B) Advanced filtering
//   // let queryStr = JSON.stringify(queryObj);
//   // queryStr = queryStr.replace(
//   //   /\b(gte| gt|lte|lt)\b/g,
//   //   (match) => `$${match}`
//   // );

//   // // as soon as we use await the query will then execute and come
//   // // back with the documents that actually match with query , then there
//   // // is no way for implementing sorting , paginating etc... instead we have
//   // // to save the query by chaining all the methods , by the end
//   // // we can use await to get the desired documents
//   // //const tours = await Tour.find(queryObj);

//   // let query = Tour.find(JSON.parse(queryStr));

//   // 2) sorting
//   // if (req.query.sort) {
//   //   const sortBy = req.query.sort.split(',').join(' ');
//   //   query = query.sort(sortBy);
//   //   // In mongo if you got tie in sorting with single attribute , we have to specify the other attribute
//   //   // and sorting in mongo looks like sort('price ratingViews');
//   //   // so we split the request and separated it with space using join
//   // } else {
//   //   query = query.sort('-createdAt');
//   // }

//   // // filed delimiting (basically projecting)
//   // if (req.query.fields) {
//   //   const fields = req.query.fields.split(',').join(' ');
//   //   query = query.select(fields);
//   // } else {
//   //   query = query.select('-__v');
//   // }

//   // pagination
//   // const page = req.query.page * 1 || 1;
//   // const limit = req.query.limit * 1 || 100;
//   // const skip = (page - 1) * limit;

//   // query = query.skip(skip).limit(limit);

//   // if (req.query.page) {
//   //   const numTours = await Tour.countDocuments();
//   //   if (skip >= numTours) throw new Error('This page does not exist');
//   // }

//   // filtering can also be done in many ways, here is another way
//   // const query = await Tour.find()
//   //   .where('difficulty')
//   //   .equals('easy')
//   //   .where('durarion')
//   //   .equals(5);

//   // Excecuting the query
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFileds()
//     .paginate();
//   const tours = await features.query;

//   // Send response
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       //tours : tours // genearlly we have to write key, value pair when sending json, but from ES20 if both key and values
//       // are same , mentioning any one of the value enough
//       tours,
//     },
//   });
// });

// exports.getTour = catchAsync(async (req, res, next) => {
//   // we have done just extracting id from req, and found out it in json file, but when it comes to database, we use mongo
//   // const id = req.params.id * 1;
//   // const newTour = tours.find((el) => el.id === id);

//   const newTour = await Tour.findById(req.params.id).populate('reviews');
//   // findById is the subfunction of Tour.findOne({_id : req.params.id}) , where findById makes our work easier

//   if (!newTour) {
//     return next(new AppError('NO tour is found with given ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError('No tour is found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.updateTour = factory.updateOne(Tour);
exports.createTour = factory.createOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// exports.createTour = catchAsync(async (req, res, next) => {
//   // This is how we created the by taking instance of model , and creating it , but we can directly create using model as we have done below
//   // const newTour = new Tour();
//   // newTour.save();

//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });

//   // try {
//   //   const newTour = await Tour.create(req.body);
//   //   res.status(201).json({
//   //     status: 'success',
//   //     data: {
//   //       tour: newTour,
//   //     },
//   //   });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
// });

// // exports.deleteTour = catchAsync(async (req, res, next) => {
// //   const tour = await Tour.findByIdAndDelete(req.params.id);
// //   if (!tour) {
// //     return next(new AppError('No tour is found with that ID', 404));
// //   }
// //   res.status(204).json({
// //     status: 'success',
// //     data: tour,
// //   });
// // });

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $avg: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      // here we only get access to above variables onlu
      $sort: { avgPrice: 1 }, // we have set value to 1 for ascending order
    },

    // we can also repeat the stages
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tour: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: plan,
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format of lat, lng',
        400
      )
    );
  }

  const tour = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tour.length,
    data: {
      data: tour,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.00621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format of lat, lng',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances,
    },
  });
});
