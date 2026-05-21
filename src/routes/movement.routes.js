const express = require('express');
const MovementController = require('../controllers/MovementController');
const { validate, movementValidation } = require('../middlewares/validation');
const { authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', MovementController.index);
router.get('/report', MovementController.getReport);
router.get('/:id', MovementController.show);

router.post('/', 
  authorize('admin', 'technician'),
  validate(movementValidation.create), 
  MovementController.create
);

router.delete('/:id', 
  authorize('admin'),
  MovementController.delete
);

module.exports = router;
