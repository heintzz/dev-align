const express = require('express');
const {
  getPositions,
  createPosition,
  updatePosition,
  deletePosition,
} = require('../controllers/position.controller');
const auth = require('../middlewares/authorization');
const verifyToken = require('../middlewares/token');
const router = express.Router();

router.get('/', verifyToken, auth('hr'), getPositions);
router.post('/', verifyToken, auth('hr'), createPosition);
router.put('/:positionId', verifyToken, auth('hr'), updatePosition);
router.delete('/:positionId', verifyToken, auth('hr'), deletePosition);

module.exports = router;
