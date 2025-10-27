const express = require('express');
const {
  userLogin,
  requestResetPassword,
  resetPassword,
} = require('../controllers/auth.controller');
const router = express.Router();

router.post('/login', userLogin);
router.post('/requestResetPassword', requestResetPassword);
router.post('/resetPassword', resetPassword);

module.exports = router;
