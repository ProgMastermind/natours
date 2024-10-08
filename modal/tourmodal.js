const mongoose = require('mongoose');

const slugify = require('slugify');
// const User = require('./userModal');
//const validator = require('validator');
// Creating a schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minlength: [
        10,
        'A tour name must have greater than or equal to 10 characters',
      ],
      maxlength: [
        40,
        'A tour name must have lesser than or equal to 40 characters',
      ],
      // here we are commenting isAlpha , because it can't even accept if there is spaces between name
      // but we have used for demonstration purpose
      //validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },

    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },

    slug: String,

    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A rating should be above 1.0'],
      max: [5, 'A rating should be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only point to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have description'],
    },

    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },

    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // as we have set select= false, this filed won't be visible to client
    },

    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
      },
    ],

    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],

    secretTour: {
      type: Boolean,
      default: false,
    },

    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual properites
//Virtual properties in MongoDB are properties that do not persist in the database but can be accessed and computed on-the-fly based on other properties of the document or external factors.
// These properties are defined using virtual property getter methods in a Mongoose schema.
tourSchema.virtual('durationweeks').get(function () {
  return this.duration / 7;
});

// Document Middleware : runs before .save() and .create()
// It only works for save and create methods not for other Methods (i.e insertMany, findOneAndUpdate)
// we use regular function call, as it requires usage of this keyword here
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true }); // here this refers to document we are going to create
  next();
});
// .pre() and 'save' together called as pre-hook

// tourSchema.pre('save', (next) => {
//   console.log('Will save document...');
//   next();
// });

// // post-hook
// // It runs after the document has saved, since it will be run after the
// // document has created, it will get access to this keyword & it get access to present documents as argument
// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

// Query Middleware
// pre-hook
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = new Date();
  next();
});

// tourSchema.post(/^find/, function (doc, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds!`);
//   console.log(doc);
//   next();
// });

// Aggregation middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

// If we want to embede the users in the tours, but we are referencing the users
// tourSchema.pre('save', async function (next) {
//   const guidePromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidePromises);
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt -passwordRestExpires -passwordResetToken',
  });

  next();
});

// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// Indexes
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// // Creating a model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
