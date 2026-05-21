const { body, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ 
      error: 'Erro de validação',
      details: errors.array() 
    });
  };
};

const userValidation = {
  register: [
    body('name').notEmpty().withMessage('Nome é obrigatório')
      .isLength({ min: 3 }).withMessage('Nome deve ter no mínimo 3 caracteres'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('role').optional().isIn(['admin', 'technician', 'viewer']).withMessage('Role inválida')
  ],
  login: [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Senha é obrigatória')
  ]
};

const materialValidation = {
  create: [
    body('code').notEmpty().withMessage('Código é obrigatório'),
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('category').isIn(['reagent', 'equipment', 'consumable', 'glassware'])
      .withMessage('Categoria inválida'),
    body('unit').notEmpty().withMessage('Unidade é obrigatória'),
    body('minimumStock').optional().isInt({ min: 0 }).withMessage('Estoque mínimo deve ser um número positivo'),
    body('currentStock').optional().isInt({ min: 0 }).withMessage('Estoque atual deve ser um número positivo')
  ],
  update: [
    body('code').optional().notEmpty().withMessage('Código não pode ser vazio'),
    body('name').optional().notEmpty().withMessage('Nome não pode ser vazio'),
    body('category').optional().isIn(['reagent', 'equipment', 'consumable', 'glassware'])
      .withMessage('Categoria inválida'),
    body('minimumStock').optional().isInt({ min: 0 }).withMessage('Estoque mínimo deve ser um número positivo')
  ]
};

const movementValidation = {
  create: [
    body('materialId').isInt().withMessage('ID do material inválido'),
    body('type').isIn(['in', 'out']).withMessage('Tipo deve ser "in" ou "out"'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantidade deve ser um número positivo'),
    body('reason').optional().isString(),
    body('observation').optional().isString()
  ]
};

module.exports = {
  validate,
  userValidation,
  materialValidation,
  movementValidation
};
