const AppError = require("../../../shared/errors/app-error");
const { Order, OrderItem, Cart, CartItem, Product, sequelize } = require("../../../models");

/**
 * Repositório responsável por operações complexas envolvendo pedidos (Checkout).
 * Utiliza transações atômicas para garantir consistência.
 */
class OrderRepository {
  /**
   * Finaliza uma compra: Calcula totais, salva o Pedido e os Itens copiando os dados do carrinho e limpando-o em seguida.
   * Transacional — se qualquer passo falhar (incluindo erro de validação ou banco), a operação inteira faz rollback e o carrinho é mantido intacto.
   * @param {string} userId - ID do usuário.
   * @param {Object} payload - Dados complementares (personal_info, delivery_address, payment_info)
   * @param {Object} payload.personal_info
   * @param {Object} payload.delivery_address
   * @param {Object} payload.payment_info
   * @returns {Promise<{ order_id: string }>} O ID numérico gerado pelo fechamento do pedido.
   * @throws {Error} Erro se o carrinho estiver vazio ou a persistência falhar.
   */
  async checkoutCartToOrder(userId, { personal_info, delivery_address, payment_info }) {
    const transaction = await sequelize.transaction();

    try {
      // 1. Puxar o Carrinho Atual
      const cart = await Cart.findOne({
        where: { user_id: userId },
        transaction,
      });

      if (!cart) {
        throw new AppError("Carrinho está vazio.", 400);
      }

      const cartItems = await CartItem.findAll({
        where: { cart_id: cart.id },
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "name", "price", "price_with_discount", "enabled", "stock"],
            include: ["images"],
          },
        ],
        transaction,
      });

      if (cartItems.length === 0) {
        throw new AppError("Carrinho está vazio.", 400);
      }

      // 2. Calcular montantes iterando os cartItems e espelhando para os order items
      let subtotal = 0;
      const parsedOrderItems = [];

      for (const item of cartItems) {
        if (!item.product) {
          throw new AppError(`Um produto (ID: ${item.product_id}) no seu carrinho não está mais disponível.`, 400);
        }

        const priceAtPurchase = item.product.price_with_discount || item.product.price;
        subtotal += parseFloat(priceAtPurchase) * item.quantity;

        // Puxa a primeira imagem (ou da variante principal)
        const mainImage = item.product.images?.find((img) => img.enabled)?.path || null;

        parsedOrderItems.push({
          product_id: item.product_id,
          product_name: item.product.name,
          image_url: mainImage,
          quantity: item.quantity,
          price_at_purchase: priceAtPurchase,
          selected_color: item.selected_color,
          selected_size: item.selected_size,
        });
      }

      // Desconto/Frete no futuro virá de business logic externa ou de cupom
      const shipping = 0;
      const discount = 0;
      const total = subtotal + shipping - discount;

      // 3. Salvar Pedido e Snapshot do Cliente
      const order = await Order.create(
        {
          user_id: userId,
          status: "completed",
          subtotal,
          shipping,
          discount,
          total,
          personal_info,
          delivery_address,
          payment_info, // já mascarado pelo serviço
        },
        { transaction }
      );

      // 4. Salvar os itens anexados a ele
      for (const parsedItem of parsedOrderItems) {
        parsedItem.order_id = order.id;
        await OrderItem.create(parsedItem, { transaction });
      }

      // 5. Destruir dados de Carrinho vinculados ao Usuário original (limpar cache presencial)
      // Como o User.Cart também possuí Cascade pra baixo pro CartItem, dar um .destroy() no Cart farase-ia sozinho. Mas faremos explicitamente:
      await CartItem.destroy({ where: { cart_id: cart.id }, transaction });

      // O Carrinho em si, podemos deixar a casca lá e depois reutiliza-la ou apagar pra que seja reconstruída na proxima add no cart se o service for resiliente. Vou deletar a capa.
      await cart.destroy({ transaction });

      await transaction.commit();

      return { order_id: order.id };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Retorna os detalhes de um pedido.
   * @param {string} orderId - ID ou UUID do pedido.
   * @param {string} userId - ID do dono verificador daquele pedido (Segurança)
   * @returns {Promise<Object|null>}
   */
  async findOrderByIdAndUser(orderId, userId) {
    return await Order.findOne({
      where: {
        id: orderId,
        user_id: userId,
      },
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
    });
  }
}

module.exports = new OrderRepository();
