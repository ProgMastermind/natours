/* eslint-disable */
// import axios from 'axios';
// import { showAlert } from './alerts';
// import Stripe from 'stripe';
// const stripe = Stripe(
//   'pk_test_51NIbTMSAVOI8vI5UgtVcOqa4MImNitJQNZohZ1OdQdjAJHoWlGP2NqpXcCVJh6gyEtC3okrzDJ6NL3LQsDT4WEjx00dLHsLaoe'
// );
// export const bookTour = async (tourId) => {
//   try {
//     // 1) Get checkout session from API

//     const session = await axios(
//       `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`
//     );

//     // 2 ) Create checkout from + chanre credit card
//     await stripe.redirectToCheckout({
//       sessionId: session.data.session.id,
//     });
//   } catch (err) {
//     console.log(err);
//     showAlert('error', err);
//   }
// };

/* eslint-disable */
// import axios from 'axios';
// import { showAlert } from './alerts';
// import Stripe from 'stripe';
// const stripe = Stripe(
//   'pk_test_51NIbTMSAVOI8vI5UgtVcOqa4MImNitJQNZohZ1OdQdjAJHoWlGP2NqpXcCVJh6gyEtC3okrzDJ6NL3LQsDT4WEjx00dLHsLaoe'
// );
// export const bookTour = async (tourId) => {
//   try {
//     const response = await axios(
//       `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`
//     );

//     // 2 ) Create checkout from + chanre credit card
//     await stripe.redirectToCheckout({
//       session: response.data,
//     });
//   } catch (err) {
//     console.log(err);
//     showAlert('error', err);
//   }
// };

// export const bookTour = async (tourId) => {
//   try {
//     const response = await axios(
//       `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`
//     );

//     // 2 ) Create checkout from + chanre credit card
//     const stripe = Stripe(
//       'pk_test_51NIbTMSAVOI8vI5UgtVcOqa4MImNitJQNZohZ1OdQdjAJHoWlGP2NqpXcCVJh6gyEtC3okrzDJ6NL3LQsDT4WEjx00dLHsLaoe'
//     );
//     await stripe.redirectToCheckout({
//       sessionId: response.data.session.id,
//     });
//   } catch (err) {
//     console.log(err);
//     showAlert('error', err);
//   }
// };
