const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.post('/login', login);
router.post('/signup', protect, authorize('Admin'), signup);
router.get('/me', protect, getMe);

module.exports = router;
