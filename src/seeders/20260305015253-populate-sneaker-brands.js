"use strict";

const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const products = [
      {
        name: "Puma RS-X 3D",
        slug: "puma-rsx-3d-" + Date.now(),
        enabled: true,
        use_in_menu: true,
        stock: 50,
        description: "Tênis Puma RS-X com detalhes 3D e muito conforto.",
        price: 499.9,
        price_with_discount: 399.9,
        brand: "Puma",
        gender: "Masculino",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Adidas Ultraboost 22",
        slug: "adidas-ultraboost-22-" + Date.now(),
        enabled: true,
        use_in_menu: true,
        stock: 30,
        description: "Tênis corrida Adidas Ultraboost com retorno de energia.",
        price: 999.9,
        price_with_discount: 899.9,
        brand: "Adidas",
        gender: "Unisex",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "K-Swiss Classic VN",
        slug: "k-swiss-classic-vn-" + Date.now(),
        enabled: true,
        use_in_menu: true,
        stock: 20,
        description: "Tênis clássico K-Swiss para o dia a dia.",
        price: 299.9,
        price_with_discount: 249.9,
        brand: "K-Swiss",
        gender: "Feminino",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("products", products, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("products", {
      brand: {
        [Sequelize.Op.in]: ["Puma", "Adidas", "K-Swiss"],
      },
    });
  },
};
