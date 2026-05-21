const { Material, Movement } = require('../models');
const { Op } = require('sequelize');

class MaterialController {
  async index(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category, 
        search,
        lowStock 
      } = req.query;

      const where = {};

      if (category) {
        where.category = category;
      }

      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      if (lowStock === 'true') {
        where.currentStock = { [Op.lte]: sequelize.col('minimumStock') };
      }

      const materials = await Material.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [['code', 'ASC']]
      });

      res.json({
        data: materials.rows,
        total: materials.count,
        page: parseInt(page),
        totalPages: Math.ceil(materials.count / parseInt(limit))
      });
    } catch (error) {
      console.error('Erro ao listar materiais:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async show(req, res) {
    try {
      const material = await Material.findByPk(req.params.id, {
        include: [{
          model: Movement,
          as: 'movements',
          limit: 10,
          order: [['movementDate', 'DESC']]
        }]
      });

      if (!material) {
        return res.status(404).json({ error: 'Material não encontrado' });
      }

      res.json(material);
    } catch (error) {
      console.error('Erro ao buscar material:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req, res) {
    try {
      const material = await Material.create(req.body);
      res.status(201).json(material);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Código já existe' });
      }
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Erro de validação',
          details: error.errors.map(e => e.message)
        });
      }
      console.error('Erro ao criar material:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    try {
      const material = await Material.findByPk(req.params.id);

      if (!material) {
        return res.status(404).json({ error: 'Material não encontrado' });
      }

      const { currentStock, ...updateData } = req.body;

      await material.update(updateData);

      res.json(material);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Código já existe' });
      }
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Erro de validação',
          details: error.errors.map(e => e.message)
        });
      }
      console.error('Erro ao atualizar material:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const material = await Material.findByPk(req.params.id);

      if (!material) {
        return res.status(404).json({ error: 'Material não encontrado' });
      }

      const movements = await Movement.count({ where: { materialId: material.id } });
      
      if (movements > 0) {
        return res.status(400).json({ 
          error: 'Não é possível excluir material com movimentações vinculadas' 
        });
      }

      await material.destroy();

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar material:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getStock(req, res) {
    try {
      const material = await Material.findByPk(req.params.id, {
        attributes: ['id', 'code', 'name', 'currentStock', 'minimumStock', 'unit']
      });

      if (!material) {
        return res.status(404).json({ error: 'Material não encontrado' });
      }

      res.json({
        material,
        status: material.currentStock <= material.minimumStock ? 'low' : 'normal'
      });
    } catch (error) {
      console.error('Erro ao consultar estoque:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new MaterialController();
