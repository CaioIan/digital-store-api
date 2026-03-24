const { Cart, CartItem, Product, ProductImage } = require("../../../models");

/**
 * Repositório responsável pelas operações de persistência do carrinho.
 * Centraliza todas as queries Sequelize relacionadas a Cart e CartItem.
 */
class CartRepository {
  /**
   * Busca ou cria o carrinho do usuário.
   * @param {string} userId - UUID do usuário autenticado.
   * @returns {Promise<import('sequelize').Model>} Instância do Cart.
   */
  async findOrCreateCart(userId) {
    const [cart] = await Cart.findOrCreate({
      where: { user_id: userId },
      defaults: { user_id: userId },
    });
    return cart;
  }

  /**
   * Retorna o carrinho do usuário com todos os items e dados do produto populados.
   * @param {string} userId - UUID do usuário autenticado.
   * @returns {Promise<import('sequelize').Model|null>} Cart com items incluídos, ou null.
   */
  async getCartWithItems(userId) {
    return Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "slug", "price", "price_with_discount", "stock", "enabled"],
              include: [
                {
                  model: ProductImage,
                  as: "images",
                  attributes: ["id", "path", "enabled"],
                },
              ],
            },
          ],
        },
      ],
    });
  }

  /**
   * Busca um item no carrinho pela combinação exata de produto, cor e tamanho.
   * @param {string} cartId - UUID do carrinho.
   * @param {number} productId - ID do produto.
   * @param {string|null} selectedColor - Cor selecionada.
   * @param {string|null} selectedSize - Tamanho selecionado.
   * @returns {Promise<import('sequelize').Model|null>} CartItem encontrado ou null.
   */
  async findCartItem(cartId, productId, selectedColor, selectedSize) {
    return CartItem.findOne({
      where: {
        cart_id: cartId,
        product_id: productId,
        selected_color: selectedColor || null,
        selected_size: selectedSize || null,
      },
    });
  }

  /**
   * Adiciona um novo item ao carrinho.
   * @param {Object} data - Dados do item.
   * @param {string} data.cart_id - UUID do carrinho.
   * @param {number} data.product_id - ID do produto.
   * @param {number} data.quantity - Quantidade.
   * @param {string|null} data.selected_color - Cor selecionada.
   * @param {string|null} data.selected_size - Tamanho selecionado.
   * @returns {Promise<import('sequelize').Model>} CartItem criado.
   */
  async addItem(data) {
    return CartItem.create(data);
  }

  /**
   * Atualiza a quantidade de um item.
   * @param {string} itemId - UUID do CartItem.
   * @param {number} quantity - Nova quantidade.
   * @returns {Promise<import('sequelize').Model>} CartItem atualizado.
   */
  async updateItemQuantity(itemId, quantity) {
    const item = await CartItem.findByPk(itemId);
    if (!item) return null;
    item.quantity = quantity;
    await item.save();
    return item;
  }

  /**
   * Busca um CartItem pelo ID com o Cart associado (para validação de ownership).
   * @param {string} itemId - UUID do CartItem.
   * @returns {Promise<import('sequelize').Model|null>} CartItem com Cart incluído, ou null.
   */
  async findItemById(itemId) {
    return CartItem.findByPk(itemId, {
      include: [{ model: Cart, as: "cart" }],
    });
  }

  /**
   * Remove um item do carrinho.
   * @param {string} itemId - UUID do CartItem.
   * @returns {Promise<number>} Número de linhas deletadas (0 ou 1).
   */
  async removeItem(itemId) {
    return CartItem.destroy({ where: { id: itemId } });
  }

  /**
   * Remove todos os itens de um carrinho.
   * @param {string} cartId - UUID do carrinho.
   * @returns {Promise<number>} Número de linhas deletadas.
   */
  async clearCart(cartId) {
    return CartItem.destroy({ where: { cart_id: cartId } });
  }
}

module.exports = new CartRepository();
