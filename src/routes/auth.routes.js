const express = require('express');
const AuthController = require('../controllers/AuthController');
const { validate, userValidation } = require('../middlewares/validation');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', validate(userValidation.register), AuthController.register);
router.post('/login', validate(userValidation.login), AuthController.login);
router.get('/profile', authenticate, AuthController.profile);

module.exports = router;
