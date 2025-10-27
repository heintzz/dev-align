const express = require('express');
const {
  userLogin,
  requestResetPassword,
  resetPassword,
} = require('../controllers/auth.controller');
const router = express.Router();

router.post('/login', userLogin);
router.post('/forgot-password', requestResetPassword);
router.post('/change-password', resetPassword);

module.exports = router;
