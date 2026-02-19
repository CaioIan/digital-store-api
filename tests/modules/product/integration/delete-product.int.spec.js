const request = require('supertest');
const app = require('../../../../src/app');
const { sequelize } = require('../../../../src/models');
const { Product, User } = require('../../../../src/models');
const { generateToken } = require('../../../../src/shared/auth/jwt');

describe('Delete Product Integration Test', () => {
    let adminToken;
    let userToken;
    let createdProduct;
    let adminUser;
    let normalUser;

    beforeAll(async () => {
         try {
           await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
           await sequelize.sync({ force: true });
           await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
         } catch (error) {
           console.error("Erro ao sincronizar banco de dados de teste:", error);
           throw error;
         }

         // Create users in DB with correct fields (firstname, surname)
         adminUser = await User.create({
             firstname: 'Admin',
             surname: 'User',
             email: 'admin@example.com',
             password: 'password123',
             role: 'ADMIN'
         });
         
         normalUser = await User.create({
             firstname: 'Normal',
             surname: 'User',
             email: 'user@example.com',
             password: 'password123',
             role: 'USER'
         });

         // Generate tokens with real IDs
         adminToken = generateToken({ id: adminUser.id, role: adminUser.role, name: adminUser.firstname, email: adminUser.email });
         userToken = generateToken({ id: normalUser.id, role: normalUser.role, name: normalUser.firstname, email: normalUser.email });
    });

    beforeEach(async () => {
        // Create a product to be deleted
        createdProduct = await Product.create({
            name: 'Product to Delete',
            slug: 'product-to-delete',
            price: 100.00,
            price_with_discount: 90.00,
            enabled: true,
            stock: 10,
            description: 'This product will be deleted',
        });
    });

    afterEach(async () => {
        // Cleanup with cascade
        await Product.destroy({ where: {}, truncate: { cascade: true } });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('deve deletar um produto com sucesso quando autenticado como ADMIN', async () => {
        const response = await request(app)
            .delete(`/v1/product/${createdProduct.id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(204);

        // Verify it's gone from DB
        const foundProduct = await Product.findByPk(createdProduct.id);
        expect(foundProduct).toBeNull();
    });

    it('deve retornar 404 ao tentar deletar um produto inexistente', async () => {
        const nonExistentId = 99999;
        const response = await request(app)
            .delete(`/v1/product/${nonExistentId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Product not found');
    });

    it('deve retornar 401 ao tentar deletar sem token', async () => {
        const response = await request(app)
            .delete(`/v1/product/${createdProduct.id}`);

        expect(response.status).toBe(401);
    });

    it('deve retornar 403 ao tentar deletar como usuário não-ADMIN', async () => {
        const response = await request(app)
            .delete(`/v1/product/${createdProduct.id}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(403);
    });

    it('deve retornar 400 quando o ID for inválido', async () => {
        const response = await request(app)
            .delete(`/v1/product/invalid-id`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
    });
});
