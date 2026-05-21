const { Movement, Material, User } = require('../models');
const { Op } = require('sequelize');

class MovementController {
  async index(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        materialId,
        type,
        startDate,
        endDate 
      } = req.query;

      const where = {};

      if (materialId) {
        where.materialId = materialId;
      }

      if (type) {
        where.type = type;
      }

      if (startDate || endDate) {
        where.movementDate = {};
        if (startDate) {
          where.movementDate[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.movementDate[Op.lte] = new Date(endDate);
        }
      }

      const movements = await Movement.findAndCountAll({
        where,
        include: [
          {
            model: Material,
            as: 'material',
            attributes: ['id', 'code', 'name', 'unit']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [['movementDate', 'DESC']]
      });

      res.json({
        data: movements.rows,
        total: movements.count,
        page: parseInt(page),
        totalPages: Math.ceil(movements.count / parseInt(limit))
      });
    } catch (error) {
      console.error('Erro ao listar movimentações:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req, res) {
    const transaction = await Movement.sequelize.transaction();

    try {
      const { materialId, type, quantity, reason, observation } = req.body;
      const userId = req.user.id;

      const material = await Material.findByPk(materialId, { transaction });
      
      if (!material) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Material não encontrado' });
      }

      const previousStock = material.currentStock;
      let newStock;

      if (type === 'out') {
        if (material.currentStock < quantity) {
          await transaction.rollback();
          return res.status(400).json({ 
            error: 'Quantidade indisponível em estoque',
            available: material.currentStock
          });
        }
        newStock = material.currentStock - quantity;
      } else {
        newStock = material.currentStock + quantity;
      }

      const movement = await Movement.create({
        materialId,
        userId,
        type,
        quantity,
        previousStock,
        newStock,
        reason,
        observation,
        movementDate: new Date()
      }, { transaction });

      await material.update({ currentStock: newStock }, { transaction });

      await transaction.commit();

      const createdMovement = await Movement.findByPk(movement.id, {
        include: [
          {
            model: Material,
            as: 'material',
            attributes: ['id', 'code', 'name', 'unit']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          }
        ]
      });

      res.status(201).json(createdMovement);
    } catch (error) {
      await transaction.rollback();
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Erro de validação',
          details: error.errors.map(e => e.message)
        });
      }
      
      console.error('Erro ao criar movimentação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async show(req, res) {
    try {
      const movement = await Movement.findByPk(req.params.id, {
        include: [
          {
            model: Material,
            as: 'material',
            attributes: ['id', 'code', 'name', 'unit', 'category']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!movement) {
        return res.status(404).json({ error: 'Movimentação não encontrada' });
      }

      res.json(movement);
    } catch (error) {
      console.error('Erro ao buscar movimentação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const movement = await Movement.findByPk(req.params.id);

      if (!movement) {
        return res.status(404).json({ error: 'Movimentação não encontrada' });
      }

      const hoursDiff = (new Date() - new Date(movement.createdAt)) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        return res.status(400).json({ 
          error: 'Não é possível excluir movimentações com mais de 24 horas' 
        });
      }

      await movement.destroy();

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar movimentação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getReport(req, res) {
    try {
      const { startDate, endDate, materialId } = req.query;

      const where = {};
      
      if (startDate || endDate) {
        where.movementDate = {};
        if (startDate) {
          where.movementDate[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.movementDate[Op.lte] = new Date(endDate);
        }
      }

      if (materialId) {
        where.materialId = materialId;
      }

      const movements = await Movement.findAll({
        where,
        include: [
          {
            model: Material,
            as: 'material',
            attributes: ['id', 'code', 'name', 'category', 'unit']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          }
        ],
        order: [['movementDate', 'ASC']]
      });

      const totals = movements.reduce((acc, movement) => {
        if (movement.type === 'in') {
          acc.totalEntradas += movement.quantity;
        } else {
          acc.totalSaidas += movement.quantity;
        }
        return acc;
      }, { totalEntradas: 0, totalSaidas: 0 });

      const byMaterial = movements.reduce((acc, movement) => {
        const materialId = movement.material.id;
        if (!acc[materialId]) {
          acc[materialId] = {
            material: movement.material,
            entradas: 0,
            saidas: 0
          };
        }
        if (movement.type === 'in') {
          acc[materialId].entradas += movement.quantity;
        } else {
          acc[materialId].saidas += movement.quantity;
        }
        return acc;
      }, {});

      res.json({
        period: { startDate, endDate },
        totals,
        byMaterial: Object.values(byMaterial),
        movements
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new MovementController();
