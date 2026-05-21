module.exports = {
  up: async (queryInterface) => {
    return queryInterface.bulkInsert('Materials', [
      {
        code: 'REAG-001',
        name: 'Ácido Sulfúrico',
        description: 'Ácido sulfúrico P.A.',
        category: 'reagent',
        unit: 'L',
        minimumStock: 1,
        currentStock: 5,
        location: 'Prateleira A1',
        manufacturer: 'Merck',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'EQP-001',
        name: 'Microscópio Binocular',
        description: 'Microscópio óptico com aumento de 1000x',
        category: 'equipment',
        unit: 'un',
        minimumStock: 1,
        currentStock: 3,
        location: 'Sala 102',
        manufacturer: 'Nikon',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CONS-001',
        name: 'Luva de Látex',
        description: 'Luva de procedimento tamanho M',
        category: 'consumable',
        unit: 'cx',
        minimumStock: 5,
        currentStock: 10,
        location: 'Depósito 2',
        manufacturer: 'MedPro',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface) => {
    return queryInterface.bulkDelete('Materials', null, {});
  }
};
