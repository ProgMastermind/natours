const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connections successful');
  });
//console.log(process.env);

// const testTour = new Tour({
//   name: 'The Archimedes',
//   rating: 4.9,
//   price: 497,
// });

// saving a databse
// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('Error 🎆', err);
//   });

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on the ${port}.....`);
});
