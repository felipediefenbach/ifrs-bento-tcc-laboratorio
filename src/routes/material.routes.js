const express = require('express');
const MaterialController = require('../controllers/MaterialController');
const { validate, materialValidation } = require('../middlewares/validation');
const { authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', MaterialController.index);
router.get('/stock/:id', MaterialController.getStock);
router.get('/:id', MaterialController.show);

router.post('/', 
  authorize('admin', 'technician'),
  validate(materialValidation.create), 
  MaterialController.create
);

router.put('/:id', 
  authorize('admin', 'technician'),
  validate(materialValidation.update), 
  MaterialController.update
);

router.delete('/:id', 
  authorize('admin'),
  MaterialController.delete
);

module.exports = router;
