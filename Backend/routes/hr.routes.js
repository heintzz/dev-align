const express = require('express');
const router = express.Router();

const { createEmployee } = require('../controllers/hr.controller');
const verifyToken = require('../middlewares/token');
const auth = require('../middlewares/authorization');

router.post('/employee', verifyToken, auth('hr'), createEmployee);

module.exports = router;
