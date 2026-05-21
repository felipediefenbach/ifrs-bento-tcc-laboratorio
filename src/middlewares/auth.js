const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = {
  authenticate: async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        throw new Error();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ 
        where: { 
          id: decoded.id,
          active: true 
        } 
      });

      if (!user) {
        throw new Error();
      }

      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Por favor, autentique-se.' });
    }
  },

  authorize: (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Acesso negado. Você não tem permissão para acessar este recurso.' 
        });
      }

      next();
    };
  }
};
