const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const password = await bcrypt.hash('admin123', 10);
    
    return queryInterface.bulkInsert('Users', [
      {
        name: 'Administrador',
        email: 'admin@lab.com',
        password: password,
        role: 'admin',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Técnico 1',
        email: 'tecnico@lab.com',
        password: password,
        role: 'technician',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
