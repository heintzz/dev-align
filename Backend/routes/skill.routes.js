const express = require('express');
const {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} = require('../controllers/skill.controller');
const auth = require('../middlewares/authorization');
const verifyToken = require('../middlewares/token');
const router = express.Router();

router.get('/', verifyToken, auth('hr'), getSkills);
router.post('/', verifyToken, auth('hr'), createSkill);
router.put('/:skillId', verifyToken, auth('hr'), updateSkill);
router.delete('/:skillId', verifyToken, auth('hr'), deleteSkill);

module.exports = router;
