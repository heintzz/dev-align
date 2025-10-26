const express = require('express');
const router = express.Router();

const { createEmployee } = require('../controllers/hr.controller');

router.post('/employee', createEmployee);

module.exports = router;
