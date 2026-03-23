const AppError = require("../../../shared/errors/app-error");
const { Order, OrderItem, Cart, CartItem, Product, sequelize } = require("../../../models");

/**
 * Repositório responsável por operações complexas envolvendo pedidos (Checkout).
 * Utiliza transações atômicas para garantir consistência.
 */
class OrderRepository {
  /**
   * Converte um Carrinho (Cart) em um Pedido (Order) finalizado.
   * Realiza o cálculo de totais, cria o snapshot do pedido e seus itens, e limpa o carrinho original.
   * Esta operação é protegida por uma transação SQL para garantir a atomicidade.
   * @param {string} userId - UUID do usuário que está realizando a compra.
   * @param {Object} payload - Dados de checkout fornecidos pelo frontend.
   * @param {Object} payload.personal_info - Snapshot das informações pessoais (nome, CPF, etc).
   * @param {Object} payload.delivery_address - Snapshot do endereço de entrega no momento da compra.
   * @param {Object} payload.payment_info - Snapshot das informações de pagamento (ex: últimos 4 dígitos do cartão).
   * @returns {Promise<{ order_id: string }>} Objeto contendo o UUID do pedido gerado.
   * @throws {AppError} 400 - Se o carrinho estiver vazio ou se houver problemas de stock/disponibilidade.
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
   * Lista pedidos do sistema com suporte a paginação e filtros.
   * @param {Object} options - Critérios de pesquisa.
   * @param {string} [options.userId] - Opcional. Filtra pedidos de um usuário específico.
   * @param {number} [options.limit] - Quantidade máxima de registros retornados (default 10).
   * @param {number} [options.page] - Número da página solicitada (default 1).
   * @returns {Promise<{data: Array<Object>, total: number, limit: number, page: number}>} Resultado paginado com metadados.
   */
  async findAll({ userId, limit, page } = {}) {
    const safeLimit = parseInt(limit, 10) || 10;
    const safePage = parseInt(page, 10) || 1;
    
    const queryOptions = {
      where: {},
      include: [
        {
          model: OrderItem,
          as: "items",
        },
        {
          model: require("../../../models").User,
          as: "user",
          attributes: ["firstname", "surname", "email"]
        }
      ],
      order: [["created_at", "DESC"]],
      distinct: true,
    };
    
    if (userId) {
      queryOptions.where.user_id = userId;
    }

    if (safeLimit !== -1) {
      queryOptions.limit = safeLimit;
      queryOptions.offset = (Math.max(safePage, 1) - 1) * safeLimit;
    }

    const { count, rows } = await Order.findAndCountAll(queryOptions);

    return {
      data: rows,
      total: count,
      limit: safeLimit,
      page: safePage,
    };
  }

  /**
   * Retorna todos os pedidos de um usuário, ordenados do mais recente para o mais antigo, com paginação.
   * @deprecated Utilize o método findAll({ userId, ... }) em vez deste.
   * @param {string} userId - ID do usuário.
   * @param {Object} pagination - Parâmetros de paginação.
   * @param {number} pagination.limit - Limite de itens.
   * @param {number} pagination.page - Página atual.
   * @returns {Promise<{data: Array, total: number, limit: number, page: number}>} Lista de pedidos e totais.
   */
  async findAllByUser(userId, { limit, page } = {}) {
    return this.findAll({ userId, limit, page });
  }

  /**
   * Atualiza o status de um pedido.
   * @param {string} orderId - ID ou UUID do pedido.
   * @param {string} newStatus - Novo status.
   * @returns {Promise<Object|null>} O registro atualizado ou null se não encontrado.
   */
  async updateStatus(orderId, newStatus) {
    const [updated] = await Order.update(
      { status: newStatus },
      { where: { id: orderId } }
    );

    if (!updated) return null;

    return await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: "items" }],
    });
  }

  /**
   * Localiza um pedido específico filtrando pelo seu ID e pelo ID do usuário (Garantia de Ownership).
   * @param {string} orderId - UUID do pedido.
   * @param {string} userId - UUID do usuário dono do pedido.
   * @returns {Promise<Object|null>} Instância do Order com OrderItems incluídos ou null.
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
