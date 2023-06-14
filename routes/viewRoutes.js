const express = require('express');

const viewControlloer = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewControlloer.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, viewControlloer.getTour);

router.get('/login', authController.isLoggedIn, viewControlloer.getLoginForm);

router.get('/me', authController.protect, viewControlloer.getAccount);

router.post(
  '/submit-user-data',
  authController.protect,
  viewControlloer.updateUserData
);

module.exports = router;
